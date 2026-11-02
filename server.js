const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { spawn } = require('child_process');
const axios = require('axios');
const {
    ensureDir,
    readJsonFile,
    writeJsonFileSafe,
    normalizeEmail,
    isValidEmail,
    generarIdSeguro,
    verifyPassword
} = require('./auth-utils');

const app = express();
app.set('trust proxy', 1);

const PORT = Number(process.env.PORT || 3000);
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
const PYTHON_ANALYSIS_TIMEOUT_MS = Number(process.env.PYTHON_ANALYSIS_TIMEOUT_MS || 15 * 60 * 1000);
const PYTHON_HEALTH_TIMEOUT_MS = Number(process.env.PYTHON_HEALTH_TIMEOUT_MS || 10 * 1000);
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-change-this-secret';
const SESSION_COOKIE_NAME = 'mtt_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const dataRoot = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : __dirname;
const usersRootDir = path.join(dataRoot, 'users');
const usersFile = path.join(dataRoot, 'users.json');
const legacyPatientsFile = path.join(dataRoot, 'pacientes.json');
const legacyPatientsFileBase = path.join(__dirname, 'pacientes.json');
const legacyVideosDir = path.join(dataRoot, 'videos');
const legacyConsentimientosDir = path.join(dataRoot, 'consentimientos');
const legacyAnalysisOutputsDir = path.join(dataRoot, 'analysis_outputs');
const legacyMigrationMarker = path.join(dataRoot, 'legacy-migration.json');
const audiosBaseDir = path.join(__dirname, 'audios');
const localPythonApiScript = path.join(__dirname, 'analisis_api.py');
const localVenvConfigPath = path.join(__dirname, '.venv', 'pyvenv.cfg');
const localVenvSitePackages = path.join(__dirname, '.venv', 'Lib', 'site-packages');

let pythonBootstrapPromise = null;

ensureDir(dataRoot);
ensureDir(usersRootDir);

if (!fs.existsSync(legacyPatientsFile) && fs.existsSync(legacyPatientsFileBase)) {
    fs.copyFileSync(legacyPatientsFileBase, legacyPatientsFile);
}

function isLocalPythonApiTarget() {
    try {
        const parsedUrl = new URL(PYTHON_API_URL);
        return ['127.0.0.1', 'localhost'].includes(parsedUrl.hostname);
    } catch (_) {
        return false;
    }
}

function getPythonExecutableCandidates() {
    const candidates = new Set();
    const envPython = process.env.PYTHON_EXECUTABLE;
    const localVenvPython = path.join(__dirname, '.venv', 'Scripts', 'python.exe');

    if (envPython) {
        candidates.add(path.resolve(envPython));
    }

    if (fs.existsSync(localVenvConfigPath)) {
        const configContent = fs.readFileSync(localVenvConfigPath, 'utf8');
        for (const line of configContent.split(/\r?\n/)) {
            const separatorIndex = line.indexOf('=');
            if (separatorIndex === -1) continue;
            const key = line.slice(0, separatorIndex).trim().toLowerCase();
            const value = line.slice(separatorIndex + 1).trim();
            if (!value) continue;

            if (key === 'executable' && fs.existsSync(value)) {
                candidates.add(value);
            }

            if (key === 'home') {
                const homePython = path.join(value, 'python.exe');
                if (fs.existsSync(homePython)) {
                    candidates.add(homePython);
                }
            }
        }
    }

    if (fs.existsSync(localVenvPython)) {
        candidates.add(localVenvPython);
    }

    return Array.from(candidates);
}

function getPythonLaunchEnv() {
    const extraPaths = [];
    if (fs.existsSync(localVenvSitePackages)) {
        extraPaths.push(localVenvSitePackages);
    }
    if (process.env.PYTHONPATH) {
        extraPaths.push(process.env.PYTHONPATH);
    }

    return {
        ...process.env,
        PYTHONPATH: extraPaths.join(path.delimiter)
    };
}

async function canReachPythonApi(timeoutMs = 1500) {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/health`, {
            timeout: timeoutMs,
            validateStatus: () => true
        });
        return response.status >= 200 && response.status < 300;
    } catch (_) {
        return false;
    }
}

async function startLocalPythonApiIfNeeded() {
    if (!isLocalPythonApiTarget() || !fs.existsSync(localPythonApiScript)) {
        return false;
    }

    if (await canReachPythonApi()) {
        return true;
    }

    if (pythonBootstrapPromise) {
        return pythonBootstrapPromise;
    }

    pythonBootstrapPromise = (async () => {
        const pythonCandidates = getPythonExecutableCandidates();

        for (const executablePath of pythonCandidates) {
            try {
                const child = spawn(executablePath, [localPythonApiScript], {
                    cwd: __dirname,
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: true,
                    env: getPythonLaunchEnv()
                });
                child.unref();
            } catch (error) {
                console.warn(`No se pudo iniciar Python con ${executablePath}:`, error.message);
                continue;
            }

            for (let attempt = 0; attempt < 10; attempt += 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (await canReachPythonApi()) {
                    console.log(`Backend Python iniciado automáticamente con ${executablePath}`);
                    return true;
                }
            }
        }

        return false;
    })();

    try {
        return await pythonBootstrapPromise;
    } finally {
        pythonBootstrapPromise = null;
    }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sesiones = new Map();
const analysisJobs = new Map();

function userPublicData(user) {
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

function readUsers() {
    return readJsonFile(usersFile, []);
}

function writeUsers(users) {
    writeJsonFileSafe(usersFile, users);
}

function getUserByEmail(email) {
    const normalized = normalizeEmail(email);
    return readUsers().find(user => normalizeEmail(user.email) === normalized) || null;
}

function getUserById(userId) {
    return readUsers().find(user => user.id === userId) || null;
}

function getUserDataDir(userId) {
    return path.join(usersRootDir, userId);
}

function getUserPatientsFile(userId) {
    return path.join(getUserDataDir(userId), 'pacientes.json');
}

function getUserVideosDir(userId) {
    return path.join(getUserDataDir(userId), 'videos');
}

function getUserConsentimientosDir(userId) {
    return path.join(getUserDataDir(userId), 'consentimientos');
}

function getUserAnalysisOutputsDir(userId) {
    return path.join(getUserDataDir(userId), 'analysis_outputs');
}

function ensureUserStorage(userId) {
    ensureDir(getUserDataDir(userId));
    ensureDir(getUserVideosDir(userId));
    ensureDir(getUserConsentimientosDir(userId));
    ensureDir(getUserAnalysisOutputsDir(userId));
}

function readPatientsByUser(userId) {
    ensureUserStorage(userId);
    return readJsonFile(getUserPatientsFile(userId), []);
}

function writePatientsByUser(userId, pacientes) {
    ensureUserStorage(userId);
    writeJsonFileSafe(getUserPatientsFile(userId), pacientes);
}

function createSessionForUser(userId) {
    const tokenSeed = `${userId}:${Date.now()}:${crypto.randomBytes(24).toString('hex')}`;
    const sessionToken = crypto.createHmac('sha256', SESSION_SECRET).update(tokenSeed).digest('hex');
    sesiones.set(sessionToken, {
        userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_MAX_AGE_MS
    });
    return sessionToken;
}

function getCookieValue(req, name) {
    const raw = req.headers.cookie || '';
    const cookies = raw.split(';').map(entry => entry.trim()).filter(Boolean);
    for (const cookie of cookies) {
        const separator = cookie.indexOf('=');
        if (separator === -1) continue;
        const key = cookie.slice(0, separator).trim();
        const value = cookie.slice(separator + 1).trim();
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

function buildSessionCookie(req, token) {
    const secure = req.secure || String(req.headers['x-forwarded-proto'] || '').includes('https');
    return [
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`,
        ...(secure ? ['Secure'] : [])
    ].join('; ');
}

function buildClearSessionCookie(req) {
    const secure = req.secure || String(req.headers['x-forwarded-proto'] || '').includes('https');
    return [
        `${SESSION_COOKIE_NAME}=`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=0',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ...(secure ? ['Secure'] : [])
    ].join('; ');
}

function loadSession(req, res, next) {
    const token = getCookieValue(req, SESSION_COOKIE_NAME);
    if (!token) {
        req.session = null;
        req.authUser = null;
        return next();
    }

    const session = sesiones.get(token);
    if (!session || session.expiresAt < Date.now()) {
        sesiones.delete(token);
        res.setHeader('Set-Cookie', buildClearSessionCookie(req));
        req.session = null;
        req.authUser = null;
        return next();
    }

    const user = getUserById(session.userId);
    if (!user) {
        sesiones.delete(token);
        res.setHeader('Set-Cookie', buildClearSessionCookie(req));
        req.session = null;
        req.authUser = null;
        return next();
    }

    req.session = { id: token, user: userPublicData(user) };
    req.authUser = user;
    next();
}

function requireAuth(req, res, next) {
    if (req.authUser) {
        return next();
    }

    if (req.path.startsWith('/api/')) {
        return res.status(401).json({
            authenticated: false,
            error: 'Debés iniciar sesión para acceder a esta información.'
        });
    }

    return res.redirect('/login');
}

function requireAdmin(req, res, next) {
    if (req.authUser?.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'No tenés permisos para realizar esta acción.' });
}

function isPublicFamilyRequest(req) {
    return req.path.startsWith('/api/familia/modulo-a/') || req.path.startsWith('/familia/modulo-a/');
}

function parseRelativePath(relPath) {
    const normalized = path.normalize(String(relPath || '')).replace(/^(\.\.(\/|\\|$))+/, '');
    if (!normalized || normalized.startsWith('..') || path.isAbsolute(normalized)) {
        return null;
    }
    return normalized;
}

function safeJoin(baseDir, relPath) {
    const normalized = parseRelativePath(relPath);
    if (!normalized) return null;
    const fullPath = path.resolve(baseDir, normalized);
    const expectedBase = path.resolve(baseDir);
    return fullPath.startsWith(expectedBase) ? fullPath : null;
}

function sendProtectedFile(res, baseDir, relPath) {
    const filePath = safeJoin(baseDir, relPath);
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return res.status(404).json({ error: 'Archivo no encontrado o no disponible para este usuario.' });
    }
    return res.sendFile(filePath);
}

function copyDirectoryContents(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) return;
    ensureDir(targetDir);
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
        const src = path.join(sourceDir, entry.name);
        const dst = path.join(targetDir, entry.name);
        if (entry.isDirectory()) {
            copyDirectoryContents(src, dst);
        } else if (!fs.existsSync(dst)) {
            fs.copyFileSync(src, dst);
        }
    }
}

function maybeMigrateLegacyData(userId) {
    if (fs.existsSync(legacyMigrationMarker)) {
        return;
    }

    const legacyPatients = readJsonFile(legacyPatientsFile, []);
    const hasLegacyFolders = [legacyVideosDir, legacyConsentimientosDir, legacyAnalysisOutputsDir].some(dir => fs.existsSync(dir));
    if ((!Array.isArray(legacyPatients) || !legacyPatients.length) && !hasLegacyFolders) {
        return;
    }

    const currentPatients = readPatientsByUser(userId);
    if (currentPatients.length > 0) {
        return;
    }

    const now = new Date().toISOString();
    const migratedPatients = (legacyPatients || []).map((patient) => ({
        ...patient,
        id: patient.id || generarIdSeguro(),
        ownerUserId: userId,
        createdAt: patient.createdAt || now
    }));

    if (migratedPatients.length) {
        writePatientsByUser(userId, migratedPatients);
    }

    copyDirectoryContents(legacyVideosDir, getUserVideosDir(userId));
    copyDirectoryContents(legacyConsentimientosDir, getUserConsentimientosDir(userId));
    copyDirectoryContents(legacyAnalysisOutputsDir, getUserAnalysisOutputsDir(userId));

    writeJsonFileSafe(legacyMigrationMarker, {
        migratedAt: now,
        migratedToUserId: userId,
        source: {
            patientsFile: legacyPatientsFile,
            videosDir: legacyVideosDir,
            consentimientosDir: legacyConsentimientosDir,
            analysisOutputsDir: legacyAnalysisOutputsDir
        }
    });
}

function esPacienteNino(paciente) {
    return !!paciente && (
        paciente.tipo_registro === 'nino' ||
        paciente.tipo_registro === 'niño' ||
        paciente.tipo_evaluacion === 'bnpm_nino' ||
        paciente.tipo_evaluacion === 'bnpm-niño' ||
        (paciente.bnpm && typeof paciente.bnpm === 'object' && Object.keys(paciente.bnpm).length > 0)
    );
}

function generarTokenSeguro() {
    return crypto.randomBytes(24).toString('hex');
}

function obtenerSolicitudModuloA(paciente) {
    return paciente?.bnpm?.moduloARequest || null;
}

function construirUrlPublica(req, token) {
    return `${req.protocol}://${req.get('host')}/familia/modulo-a/${token}`;
}

function buscarPacientePorToken(token) {
    const users = readUsers();
    for (const user of users) {
        const pacientes = readPatientsByUser(user.id);
        for (let index = 0; index < pacientes.length; index += 1) {
            const paciente = pacientes[index];
            const solicitud = obtenerSolicitudModuloA(paciente);
            if (solicitud && solicitud.token === token) {
                return { user, pacientes, index, paciente, solicitud };
            }
        }
    }
    return null;
}

function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\\/g, '/')
        .toLowerCase();
}

function buscarArchivoAudioPorRutaRelativa(rutaRelativa) {
    if (!rutaRelativa) {
        return null;
    }

    const rutaDirecta = path.join(audiosBaseDir, ...String(rutaRelativa).split('/'));
    if (fs.existsSync(rutaDirecta)) {
        return rutaDirecta;
    }

    const normalizadoObjetivo = normalizarTexto(rutaRelativa);
    const archivosDisponibles = fs.readdirSync(audiosBaseDir, { recursive: true, withFileTypes: true });

    for (const entrada of archivosDisponibles) {
        if (!entrada.isFile()) continue;
        const relativa = path.relative(audiosBaseDir, path.join(entrada.parentPath, entrada.name));
        if (normalizarTexto(relativa) === normalizadoObjetivo) {
            return path.join(entrada.parentPath, entrada.name);
        }
    }

    const basenameObjetivo = normalizarTexto(path.basename(String(rutaRelativa)));
    for (const entrada of archivosDisponibles) {
        if (!entrada.isFile()) continue;
        if (normalizarTexto(entrada.name) === basenameObjetivo) {
            return path.join(entrada.parentPath, entrada.name);
        }
    }

    return null;
}

function obtenerRutaAudioDesdeNombreVideo(nombreArchivoVideo) {
    const nombre = path.basename(String(nombreArchivoVideo || ''));
    const sinPrefijo = nombre.replace(/^pista_\d+_/i, '');

    const matchIso = sinPrefijo.match(/_ISO(\d+)_/i);
    if (matchIso) {
        return buscarArchivoAudioPorRutaRelativa(`isocronos/metronomo_isocrono${matchIso[1]}bpm.wav`);
    }

    const matchPa = sinPrefijo.match(/_(PA)([+\-_]\d+)__(\d+)-(\d+)_/i);
    if (matchPa) {
        const variacion = matchPa[2].replace('_', '+');
        return buscarArchivoAudioPorRutaRelativa(`abruptos/PA${variacion}/PA${variacion}__${matchPa[3]}-${matchPa[4]}.wav`);
    }

    const matchPr = sinPrefijo.match(/_(PR)([+\-_]\d+)__(\d+)-(\d+)-(\d+)_/i);
    if (matchPr) {
        const variacion = matchPr[2].replace('_', '+');
        return buscarArchivoAudioPorRutaRelativa(`rampa/PR${variacion}/PR${variacion}__${matchPr[3]}-${matchPr[4]}-${matchPr[5]}.wav`);
    }

    return null;
}

function obtenerRutaAudioPaciente(userId, index, pista) {
    const pacientes = readPatientsByUser(userId);
    const paciente = pacientes[Number(index)];
    if (!paciente || !Array.isArray(paciente.evaluaciones_detalladas)) {
        return null;
    }

    const evaluacion = paciente.evaluaciones_detalladas.find(ev => String(ev.nro_pista) === String(pista));
    if (!evaluacion || !evaluacion.archivo) {
        return null;
    }

    return buscarArchivoAudioPorRutaRelativa(String(evaluacion.archivo));
}

function obtenerVideosDePista(patientDir, pista) {
    if (!fs.existsSync(patientDir)) {
        return [];
    }

    return fs.readdirSync(patientDir)
        .filter(fileName => fileName.startsWith(`pista_${pista}`))
        .map(fileName => {
            const fullPath = path.join(patientDir, fileName);
            let mtimeMs = 0;
            try {
                mtimeMs = fs.statSync(fullPath).mtimeMs || 0;
            } catch (error) {
                mtimeMs = 0;
            }
            return { fileName, fullPath, mtimeMs };
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs || a.fileName.localeCompare(b.fileName));
}

function obtenerVideoActivoDePista(patientDir, pista) {
    return obtenerVideosDePista(patientDir, pista)[0] || null;
}

function obtenerEvaluacionPaciente(userId, index, pista) {
    const pacientes = readPatientsByUser(userId);
    const paciente = pacientes[Number(index)];
    if (!paciente || !Array.isArray(paciente.evaluaciones_detalladas)) {
        return { paciente: null, evaluacion: null };
    }

    const evaluacion = paciente.evaluaciones_detalladas.find(ev => String(ev.nro_pista) === String(pista)) || null;
    return { paciente, evaluacion };
}

function obtenerCodigoSujetoPaciente(paciente, index) {
    const candidato = paciente?.sujeto || paciente?.codigo_sujeto || paciente?.nombre || '';
    const matchSujeto = String(candidato).match(/S(\d+)/i);
    if (matchSujeto) {
        return matchSujeto[1];
    }

    const matchNumero = String(candidato).match(/(\d+)/);
    if (matchNumero) {
        return matchNumero[1];
    }

    return String(Number(index) + 1);
}

function normalizarCodigoMano(mano) {
    const valor = String(mano || '').trim().toLowerCase();
    if (valor === 'derecha' || valor === 'md') return 'MD';
    if (valor === 'izquierda' || valor === 'mi') return 'MI';
    return String(mano || 'MD').trim().toUpperCase();
}

function normalizarRutaAudioEvaluacion(rutaAudio) {
    return String(rutaAudio || '')
        .replace(/\\/g, '/')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function obtenerTokenEstimuloDesdeRutaAudio(rutaAudio) {
    const relativa = normalizarRutaAudioEvaluacion(rutaAudio);
    const nombre = path.basename(relativa, path.extname(relativa));

    const matchIso = nombre.match(/metronomo_isocrono(\d+)bpm/i) || nombre.match(/metronomo_isocrono(\d+)bpm/i);
    if (matchIso) {
        return `ISO${matchIso[1]}`;
    }

    const matchPa = nombre.match(/(PA[+\-]?\d+)__(\d+)-(\d+)/i);
    if (matchPa) {
        return `${matchPa[1].toUpperCase()}__${matchPa[2]}-${matchPa[3]}`;
    }

    const matchPr = nombre.match(/(PR[+\-]?\d+)__(\d+)-(\d+)-(\d+)/i);
    if (matchPr) {
        return `${matchPr[1].toUpperCase()}__${matchPr[2]}-${matchPr[3]}-${matchPr[4]}`;
    }

    return null;
}

function extraerMedicionDesdeNombreCanonico(originalName = '') {
    const nombre = path.basename(String(originalName || ''));
    const match = nombre.match(
        /^pista_(\d+)_S(\d+)_([A-Z]+)_(ISO\d+|PA[+\-]?\d+__\d+-\d+|PR[+\-]?\d+__\d+-\d+-\d+)_Med(\d+)\.[A-Za-z0-9]+$/i
    );
    return match?.[5] || null;
}

function construirNombreVideoCanonico(userId, index, pista, originalName = '', metadataOverride = null) {
    const { paciente, evaluacion } = obtenerEvaluacionPaciente(userId, index, pista);
    const extension = path.extname(originalName || '').toLowerCase() || '.mp4';
    const sujeto = String(
        metadataOverride?.sujeto
        || metadataOverride?.codigoSujeto
        || obtenerCodigoSujetoPaciente(paciente, index)
    );
    const mano = normalizarCodigoMano(
        metadataOverride?.mano_evaluada
        || metadataOverride?.manoEvaluada
        || evaluacion?.mano_evaluada
        || paciente?.manoInicio
        || 'MD'
    );
    const estimulo = (
        obtenerTokenEstimuloDesdeRutaAudio(metadataOverride?.archivo)
        || obtenerTokenEstimuloDesdeRutaAudio(metadataOverride?.audio_rel_path)
        || obtenerTokenEstimuloDesdeRutaAudio(evaluacion?.archivo)
        || 'ISO120'
    );
    const medicionDesdeNombreCanonico = extraerMedicionDesdeNombreCanonico(originalName);
    const medicion = medicionDesdeNombreCanonico || String(evaluacion?.nro_pista || pista);
    return `pista_${pista}_S${sujeto}_${mano}_${estimulo}_Med${medicion}${extension}`;
}

function localPathToPublicUrl(baseDir, prefix, localPath) {
    const relative = path.relative(baseDir, localPath).split(path.sep).join('/');
    return `${prefix}/${relative}`;
}

function normalizarArchivosAnalisis(userId, files, outputDir) {
    const baseDir = getUserAnalysisOutputsDir(userId);
    if (!Array.isArray(files)) return [];

    return files
        .map(filePath => {
            if (!filePath) return null;
            if (path.isAbsolute(filePath)) return filePath;
            return path.join(outputDir, String(filePath));
        })
        .filter(filePath => filePath && fs.existsSync(filePath))
        .map(localPath => localPathToPublicUrl(baseDir, '/analysis_outputs', localPath));
}

function obtenerAnalisisDisponiblesPaciente(userId, index) {
    const pacienteOutputDir = path.join(getUserAnalysisOutputsDir(userId), `paciente_${index}`);
    if (!fs.existsSync(pacienteOutputDir)) {
        return [];
    }

    return fs.readdirSync(pacienteOutputDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && /^pista_\d+$/i.test(entry.name))
        .map(entry => {
            const match = entry.name.match(/^pista_(\d+)$/i);
            const nroPista = match ? Number(match[1]) : null;
            const manifestPath = path.join(pacienteOutputDir, entry.name, 'analysis_results.json');
            return nroPista && fs.existsSync(manifestPath)
                ? { nro_pista: nroPista, manifest: localPathToPublicUrl(getUserAnalysisOutputsDir(userId), '/analysis_outputs', manifestPath) }
                : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.nro_pista - b.nro_pista);
}

function limpiarAnalisisPista(userId, index, pista) {
    const outputDir = path.join(getUserAnalysisOutputsDir(userId), `paciente_${index}`, `pista_${pista}`);
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
}

function createAnalysisJobKey(userId, index, pista) {
    return `${userId}:paciente_${index}:pista_${pista}`;
}

function getAnalysisManifestPath(userId, index, pista) {
    return path.join(getUserAnalysisOutputsDir(userId), `paciente_${index}`, `pista_${pista}`, 'analysis_results.json');
}

function getStoredAnalysisStatus(userId, index, pista) {
    const manifestPath = getAnalysisManifestPath(userId, index, pista);
    if (!fs.existsSync(manifestPath)) {
        return null;
    }

    return {
        status: 'completed',
        message: 'Análisis completado.',
        manifest: localPathToPublicUrl(getUserAnalysisOutputsDir(userId), '/analysis_outputs', manifestPath),
        completedAt: fs.statSync(manifestPath).mtime.toISOString()
    };
}

function getAnalysisJobStatus(userId, index, pista) {
    const job = analysisJobs.get(createAnalysisJobKey(userId, index, pista));
    if (job) {
        return job;
    }
    return getStoredAnalysisStatus(userId, index, pista) || { status: 'idle' };
}

async function runAnalysisJob(userId, index, pista, videoName, videoPath, metronomePath, outputDir) {
    const key = createAnalysisJobKey(userId, index, pista);
    analysisJobs.set(key, {
        status: 'running',
        message: 'Análisis en curso.',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    try {
        await startLocalPythonApiIfNeeded();

        const response = await axios.post(
            `${PYTHON_API_URL}/analizar`,
            {
                ruta_video: videoPath,
                nombre_archivo: videoName,
                ruta_audio_metronomo: metronomePath,
                output_dir: outputDir
            },
            {
                timeout: PYTHON_ANALYSIS_TIMEOUT_MS,
                headers: { 'Content-Type': 'application/json' },
                validateStatus: () => true
            }
        );

        const data = response.data && typeof response.data === 'object' ? response.data : {};
        if (response.status < 200 || response.status >= 300) {
            analysisJobs.set(key, {
                status: 'error',
                message: data.message || data.error || 'Error durante el análisis.',
                detalle: data,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return;
        }

        analysisJobs.set(key, {
            status: 'completed',
            message: 'Análisis completado.',
            manifest: localPathToPublicUrl(getUserAnalysisOutputsDir(userId), '/analysis_outputs', getAnalysisManifestPath(userId, index, pista)),
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al contactar con Python:', error);
        const timeout = error?.code === 'ECONNABORTED';
        analysisJobs.set(key, {
            status: 'error',
            message: timeout
                ? 'El análisis tardó más de lo esperado y se interrumpió antes de completarse.'
                : 'El servidor de Python no respondió.',
            detalle: error.message,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
}

function buildPatientPayloadForSave(userId, incoming, current = null) {
    const now = new Date().toISOString();
    const payload = {
        ...(current || {}),
        ...(incoming || {}),
        id: current?.id || incoming?.id || generarIdSeguro(),
        ownerUserId: userId,
        createdAt: current?.createdAt || incoming?.createdAt || now
    };

    if ((current?.bnpm && typeof current.bnpm === 'object') || (incoming?.bnpm && typeof incoming.bnpm === 'object')) {
        payload.bnpm = {
            ...((current?.bnpm && typeof current.bnpm === 'object') ? current.bnpm : {}),
            ...((incoming?.bnpm && typeof incoming.bnpm === 'object') ? incoming.bnpm : {})
        };
    }

    return payload;
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            const patientDir = path.join(getUserVideosDir(req.authUser.id), `paciente_${req.params.index}`);
            ensureDir(patientDir);
            cb(null, patientDir);
        },
        filename(req, file, cb) {
            cb(
                null,
                construirNombreVideoCanonico(
                    req.authUser.id,
                    req.params.index,
                    req.params.pista,
                    file.originalname,
                    req.body || {}
                )
            );
        }
    }),
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (/video\//.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de video.'));
        }
    }
});

const uploadConsent = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            const patientDir = path.join(getUserConsentimientosDir(req.authUser.id), `paciente_${req.params.index}`);
            ensureDir(patientDir);
            cb(null, patientDir);
        },
        filename(req, file, cb) {
            const extension = path.extname(file.originalname || '').toLowerCase();
            cb(null, `consentimiento_firmado${extension}`);
        }
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const extension = path.extname(file.originalname || '').toLowerCase();
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF, JPG o PNG.'));
        }
    }
});

app.use(loadSession);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', backend: 'node' });
});

app.get('/api/test-python', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/health`, {
            timeout: PYTHON_HEALTH_TIMEOUT_MS,
            headers: { Accept: 'application/json' },
            validateStatus: () => true
        });

        if (response.status < 200 || response.status >= 300) {
            return res.status(502).json({
                ok: false,
                pythonApiUrl: PYTHON_API_URL,
                error: response.data?.message || response.data?.error || `Python respondió con estado ${response.status}.`,
                pythonResponse: response.data
            });
        }

        return res.json({
            ok: true,
            pythonApiUrl: PYTHON_API_URL,
            pythonResponse: response.data
        });
    } catch (error) {
        return res.status(502).json({
            ok: false,
            pythonApiUrl: PYTHON_API_URL,
            error: error?.code === 'ECONNABORTED'
                ? 'La verificación del backend Python tardó demasiado en responder.'
                : error?.message || 'No se pudo contactar al backend Python.'
        });
    }
});

app.get('/api/me', (req, res) => {
    if (!req.authUser) {
        return res.json({ authenticated: false });
    }
    maybeMigrateLegacyData(req.authUser.id);
    return res.json({ authenticated: true, user: userPublicData(req.authUser) });
});

app.get('/login', (req, res) => {
    if (req.authUser) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!isValidEmail(email) || password.length < 8) {
        return res.status(400).json({ error: 'Ingresá un e-mail válido y una contraseña de al menos 8 caracteres.' });
    }

    const user = getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    maybeMigrateLegacyData(user.id);
    const sessionToken = createSessionForUser(user.id);
    res.setHeader('Set-Cookie', buildSessionCookie(req, sessionToken));
    return res.json({
        authenticated: true,
        user: userPublicData(user)
    });
});

app.post('/logout', (req, res) => {
    if (req.session?.id) {
        sesiones.delete(req.session.id);
    }
    res.setHeader('Set-Cookie', buildClearSessionCookie(req));
    res.json({ ok: true });
});

app.get('/logout', (req, res) => {
    if (req.session?.id) {
        sesiones.delete(req.session.id);
    }
    res.setHeader('Set-Cookie', buildClearSessionCookie(req));
    res.redirect('/login');
});

app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/consentimiento.pdf', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'consentimiento.pdf'));
});

app.get('/PESSM%20-%20AUTORREPORTE.pdf', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'PESSM - AUTORREPORTE.pdf'));
});

app.get('/familia-modulo-a.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'familia-modulo-a.html'));
});

app.get('/familia/modulo-a/:token', (req, res) => {
    res.sendFile(path.join(__dirname, 'familia-modulo-a.html'));
});

app.use('/audios', requireAuth, express.static(audiosBaseDir));

app.get(/^\/videos\/(.+)$/, requireAuth, (req, res) => {
    return sendProtectedFile(res, getUserVideosDir(req.authUser.id), req.params[0]);
});

app.get(/^\/consentimientos\/(.+)$/, requireAuth, (req, res) => {
    return sendProtectedFile(res, getUserConsentimientosDir(req.authUser.id), req.params[0]);
});

app.get(/^\/analysis_outputs\/(.+)$/, requireAuth, (req, res) => {
    return sendProtectedFile(res, getUserAnalysisOutputsDir(req.authUser.id), req.params[0]);
});

app.get('/api/pacientes', requireAuth, (req, res) => {
    res.json(readPatientsByUser(req.authUser.id));
});

app.post('/api/pacientes', requireAuth, (req, res) => {
    const patients = readPatientsByUser(req.authUser.id);
    const nuevoPaciente = buildPatientPayloadForSave(req.authUser.id, req.body);
    patients.push(nuevoPaciente);
    writePatientsByUser(req.authUser.id, patients);
    res.status(201).json({ mensaje: 'Paciente guardado con éxito', paciente: nuevoPaciente });
});

app.patch('/api/pacientes/:index', requireAuth, (req, res) => {
    const patients = readPatientsByUser(req.authUser.id);
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || index < 0 || index >= patients.length) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    const actualizado = buildPatientPayloadForSave(req.authUser.id, req.body, patients[index]);
    patients[index] = actualizado;
    writePatientsByUser(req.authUser.id, patients);
    res.json({ mensaje: 'Paciente actualizado con éxito.', paciente: actualizado });
});

app.post('/api/pacientes/:index/bnpm/modulo-a/enlace', requireAuth, (req, res) => {
    const patients = readPatientsByUser(req.authUser.id);
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || index < 0 || index >= patients.length) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    const patient = patients[index];
    if (!esPacienteNino(patient)) {
        return res.status(400).json({ error: 'El enlace de familia solo aplica a pacientes niño/a.' });
    }

    const token = generarTokenSeguro();
    const now = new Date().toISOString();
    const publicUrl = construirUrlPublica(req, token);

    patients[index] = {
        ...patient,
        bnpm: {
            ...(patient.bnpm || {}),
            moduloARequest: {
                moduleType: 'BNPM_MODULO_A',
                token,
                status: 'pendiente',
                createdAt: now,
                submittedAt: null,
                completedAt: null,
                invalidatedAt: null,
                publicUrl
            }
        }
    };

    writePatientsByUser(req.authUser.id, patients);
    res.json({
        patientId: index,
        moduleType: 'BNPM_MODULO_A',
        token,
        status: 'pendiente',
        publicUrl,
        createdAt: now
    });
});

app.post('/api/pacientes/:index/bnpm/modulo-a/anular', requireAuth, (req, res) => {
    const patients = readPatientsByUser(req.authUser.id);
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || index < 0 || index >= patients.length) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
    }

    const patient = patients[index];
    const requestState = obtenerSolicitudModuloA(patient);
    if (!requestState) {
        return res.status(404).json({ error: 'No hay enlace generado para este paciente.' });
    }

    patients[index] = {
        ...patient,
        bnpm: {
            ...(patient.bnpm || {}),
            moduloARequest: {
                ...requestState,
                status: 'anulado',
                invalidatedAt: new Date().toISOString()
            }
        }
    };

    writePatientsByUser(req.authUser.id, patients);
    res.json({ status: 'anulado' });
});

app.get('/api/familia/modulo-a/:token', (req, res) => {
    const found = buscarPacientePorToken(req.params.token);
    if (!found) {
        return res.status(404).json({ error: 'El enlace no es válido o ya no está disponible.' });
    }

    const { paciente, solicitud } = found;
    if (solicitud.status === 'anulado') {
        return res.status(410).json({ status: 'anulado', message: 'El enlace no es válido o ya no está disponible.' });
    }
    if (solicitud.status === 'completado') {
        return res.json({ status: 'completado', submittedAt: solicitud.submittedAt || solicitud.completedAt || null });
    }

    res.json({
        status: 'pendiente',
        moduleType: 'BNPM_MODULO_A',
        patient: {
            displayName: paciente.nombre || 'Paciente',
            birthDate: paciente.fecha_nacimiento || '',
            age: paciente.edad || ''
        },
        request: {
            createdAt: solicitud.createdAt,
            publicUrl: solicitud.publicUrl
        }
    });
});

app.post('/api/familia/modulo-a/:token', (req, res) => {
    const found = buscarPacientePorToken(req.params.token);
    if (!found) {
        return res.status(404).json({ error: 'El enlace no es válido o ya no está disponible.' });
    }

    const { user, pacientes, index, paciente, solicitud } = found;
    if (solicitud.status === 'anulado') {
        return res.status(410).json({ error: 'El enlace no es válido o ya no está disponible.' });
    }
    if (solicitud.status === 'completado') {
        return res.status(409).json({ error: 'Este formulario ya fue completado.' });
    }

    const answers = req.body?.answers || {};
    const now = new Date().toISOString();
    const respondentName = req.body?.respondentName || answers.respondent_name || '';
    const respondentRelation = req.body?.respondentRelation || answers.respondent_relation || '';

    pacientes[index] = {
        ...paciente,
        bnpm: {
            ...(paciente.bnpm || {}),
            moduloA: {
                savedAt: now,
                source: 'familia',
                submittedAt: now,
                respondentName,
                respondentRelation,
                values: answers
            },
            moduloARequest: {
                ...solicitud,
                status: 'completado',
                submittedAt: now,
                completedAt: now,
                respondentName,
                respondentRelation
            }
        }
    };

    writePatientsByUser(user.id, pacientes);
    res.json({ status: 'completado', submittedAt: now });
});

app.post('/api/pacientes/:index/videos/:pista', requireAuth, upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo de video.' });
    }

    const patientDir = path.join(getUserVideosDir(req.authUser.id), `paciente_${req.params.index}`);
    obtenerVideosDePista(patientDir, req.params.pista)
        .filter(item => item.fileName !== req.file.filename)
        .forEach(item => {
            try {
                fs.unlinkSync(item.fullPath);
            } catch (error) {
                console.warn('No se pudo limpiar un video duplicado de la pista:', item.fullPath, error);
            }
        });

    limpiarAnalisisPista(req.authUser.id, req.params.index, req.params.pista);
    res.status(201).json({
        mensaje: 'Video subido correctamente.',
        archivo: req.file.filename,
        ruta: `/videos/paciente_${req.params.index}/${req.file.filename}`
    });
});

app.get('/api/pacientes/:index/videos', requireAuth, (req, res) => {
    const patientDir = path.join(getUserVideosDir(req.authUser.id), `paciente_${req.params.index}`);
    if (!fs.existsSync(patientDir)) {
        return res.json({ videos: {} });
    }

    const videos = {};
    const pistas = new Set();
    fs.readdirSync(patientDir).forEach(fileName => {
        const match = fileName.match(/^pista_(\d+)/i);
        if (match) pistas.add(match[1]);
    });
    pistas.forEach((pista) => {
        const activo = obtenerVideoActivoDePista(patientDir, pista);
        if (activo) {
            videos[pista] = `/videos/paciente_${req.params.index}/${activo.fileName}`;
        }
    });

    res.json({ videos });
});

app.post('/api/pacientes/:index/consentimiento', requireAuth, uploadConsent.single('consentimiento'), (req, res) => {
    const patients = readPatientsByUser(req.authUser.id);
    const index = Number(req.params.index);
    if (!Number.isInteger(index) || index < 0 || index >= patients.length) {
        return res.status(404).json({ error: 'Paciente no encontrado.' });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo de consentimiento.' });
    }

    const patient = patients[index];
    const publicUrl = `/consentimientos/paciente_${index}/${req.file.filename}`;

    patients[index] = {
        ...patient,
        consentFileUrl: publicUrl,
        consentFileName: req.file.originalname || req.file.filename,
        consentUploadedAt: new Date().toISOString()
    };

    writePatientsByUser(req.authUser.id, patients);
    res.status(201).json({
        mensaje: 'Consentimiento informado cargado correctamente.',
        consentFileUrl: publicUrl,
        consentFileName: patients[index].consentFileName,
        consentUploadedAt: patients[index].consentUploadedAt
    });
});

app.get('/api/pacientes/:index/analisis', requireAuth, (req, res) => {
    res.json({ analisis: obtenerAnalisisDisponiblesPaciente(req.authUser.id, req.params.index) });
});

app.delete('/api/pacientes/:index/videos/:pista', requireAuth, (req, res) => {
    const { index, pista } = req.params;
    const jobKey = createAnalysisJobKey(req.authUser.id, index, pista);
    const existingJob = analysisJobs.get(jobKey);
    if (existingJob && existingJob.status === 'running') {
        return res.status(409).json({
            error: 'No se puede eliminar este video mientras el análisis sigue en curso.',
            code: 'ANALYSIS_RUNNING'
        });
    }
    const patientDir = path.join(getUserVideosDir(req.authUser.id), `paciente_${req.params.index}`);
    if (!fs.existsSync(patientDir)) {
        return res.status(404).json({ error: 'No se encontró el directorio.' });
    }

    const target = obtenerVideoActivoDePista(patientDir, pista)?.fileName;
    if (!target) {
        return res.status(404).json({ error: 'Video no encontrado.' });
    }

    try {
        fs.unlinkSync(path.join(patientDir, target));
    } catch (error) {
        const codigo = String(error?.code || '').toUpperCase();
        if (codigo === 'EPERM' || codigo === 'EBUSY') {
            return res.status(409).json({
                error: 'No se puede eliminar el video porque el archivo está siendo usado por otro proceso.',
                code: 'VIDEO_FILE_IN_USE'
            });
        }
        throw error;
    }
    limpiarAnalisisPista(req.authUser.id, index, pista);
    res.json({ mensaje: 'Video eliminado.' });
});

app.post('/api/pacientes/:index/analizar/:pista', requireAuth, async (req, res) => {
    try {
        const { index, pista } = req.params;
        const jobKey = createAnalysisJobKey(req.authUser.id, index, pista);
        const existingJob = analysisJobs.get(jobKey);
        if (existingJob && existingJob.status === 'running') {
            return res.status(202).json({
                status: 'running',
                message: 'El análisis ya está en curso.'
            });
        }
        const patients = readPatientsByUser(req.authUser.id);
        const patient = patients[Number(index)];
        const patientDir = path.join(getUserVideosDir(req.authUser.id), `paciente_${index}`);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente no encontrado.' });
        }
        if (!patient.consentFileUrl) {
            return res.status(403).json({ error: 'Para analizar los videos, primero debés cargar el consentimiento informado firmado.' });
        }
        if (!fs.existsSync(patientDir)) {
            return res.status(404).json({ error: 'Carpeta del paciente no encontrada.' });
        }

        const videoName = obtenerVideoActivoDePista(patientDir, pista)?.fileName;
        if (!videoName) {
            return res.status(404).json({ error: 'No se encontró el video de esta pista.' });
        }

        const canonicalVideoName = construirNombreVideoCanonico(req.authUser.id, index, pista, videoName);
        const metronomePath = obtenerRutaAudioPaciente(req.authUser.id, index, pista)
            || obtenerRutaAudioDesdeNombreVideo(canonicalVideoName)
            || obtenerRutaAudioDesdeNombreVideo(videoName);
        if (!metronomePath || !fs.existsSync(metronomePath)) {
            return res.status(404).json({ error: 'No se encontró el audio del metrónomo asociado a esta pista.' });
        }

        const videoPath = path.join(patientDir, videoName);
        const outputDir = path.join(getUserAnalysisOutputsDir(req.authUser.id), `paciente_${index}`, `pista_${pista}`);
        ensureDir(outputDir);

        runAnalysisJob(req.authUser.id, index, pista, canonicalVideoName, videoPath, metronomePath, outputDir)
            .catch(error => {
                console.error('Error inesperado al iniciar el job de análisis:', error);
            });

        return res.status(202).json({
            status: 'running',
            message: 'Análisis iniciado correctamente.'
        });

        const response = await axios.post(
            `${PYTHON_API_URL}/analizar`,
            {
                ruta_video: videoPath,
                nombre_archivo: videoName,
                ruta_audio_metronomo: metronomePath,
                output_dir: outputDir
            },
            {
                timeout: PYTHON_ANALYSIS_TIMEOUT_MS,
                headers: { 'Content-Type': 'application/json' },
                validateStatus: () => true
            }
        );

        const data = response.data && typeof response.data === 'object' ? response.data : {};
        if (response.status < 200 || response.status >= 300) {
            return res.status(response.status).json({
                error: data.message || data.error || 'Error durante el análisis.',
                detalle: data
            });
        }

        data.graficos = normalizarArchivosAnalisis(req.authUser.id, data.graficos, outputDir);
        data.generated_files = normalizarArchivosAnalisis(req.authUser.id, data.generated_files, outputDir);

        res.json(data);
    } catch (error) {
        console.error('Error al contactar con Python:', error);
        const timeout = error?.code === 'ECONNABORTED';
        res.status(500).json({
            error: timeout
                ? 'El análisis tardó más de lo esperado y se interrumpió antes de completarse.'
                : 'El servidor de Python no respondió.',
            detalle: error.message
        });
    }
});

app.get('/api/pacientes/:index/analizar/:pista/estado', requireAuth, (req, res) => {
    const { index, pista } = req.params;
    res.json(getAnalysisJobStatus(req.authUser.id, index, pista));
});

app.get('/api/pacientes/:index/analizar/:pista/estado', requireAuth, (req, res) => {
    const { index, pista } = req.params;
    res.json(getAnalysisJobStatus(req.authUser.id, index, pista));
});

app.use((error, req, res, next) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: error.message || 'No se pudo procesar el archivo.' });
    }
    return res.status(400).json({ error: error.message || 'No se pudo procesar el archivo.' });
});

app.listen(PORT, () => {
    console.log('\n==============================================');
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Directorio de datos: ${dataRoot}`);
    console.log(`API Python: ${PYTHON_API_URL}`);
    console.log(`Usuarios: ${usersFile}`);
    console.log('Sesiones por cookie habilitadas.');
    console.log('==============================================\n');

    startLocalPythonApiIfNeeded()
        .then(started => {
            if (!started) {
                console.warn('No se pudo iniciar automáticamente el backend Python local.');
            }
        })
        .catch(error => {
            console.warn('Fallo el arranque automático del backend Python:', error.message);
        });
});
