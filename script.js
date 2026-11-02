/**
 * LOGICA PRINCIPAL DE LA PLATAFORMA DE MUSICOTERAPIA
 */

lucide.createIcons();
const CONFIG = {
    API_URL: (() => {
        if (window.location && /^https:$/i.test(window.location.protocol)) {
            return '/api/pacientes';
        }
        return 'http://localhost:3000/api/pacientes';
    })(),
    ME_URL: '/api/me',
    HEALTH_URL: '/health',
    LOGIN_URL: '/login',
    LOGOUT_URL: '/logout',
    LOGOUT_NAV_URL: '/logout'
};

// =======================================================
// TUS ARCHIVOS CON SUS RUTAS (CARPETAS)
// =======================================================
const ESTRUCTURA_DE_AUDIOS = {
    isocronos: [
        "isocronos/metronomo_isocrono80bpm.wav",
        "isocronos/metronomo_isocrono108bpm.wav",
        "isocronos/metronomo_isocrono120bpm.wav",
        "isocronos/metronomo_isocrono132bpm.wav",
        "isocronos/metronomo_isocrono160bpm.wav"
    ],
    abruptos: [
        ["abruptos/PA+10/PA+10__20-40.wav", "abruptos/PA+10/PA+10__21-40.wav", "abruptos/PA+10/PA+10__22-40.wav", "abruptos/PA+10/PA+10__23-40.wav", "abruptos/PA+10/PA+10__24-40.wav", "abruptos/PA+10/PA+10__25-40.wav"],
        ["abruptos/PA+33/PA+33__20-40.wav", "abruptos/PA+33/PA+33__21-40.wav", "abruptos/PA+33/PA+33__22-40.wav", "abruptos/PA+33/PA+33__23-40.wav", "abruptos/PA+33/PA+33__24-40.wav", "abruptos/PA+33/PA+33__25-40.wav"],
        ["abruptos/PA-10/PA-10__20-40.wav", "abruptos/PA-10/PA-10__21-40.wav", "abruptos/PA-10/PA-10__22-40.wav", "abruptos/PA-10/PA-10__23-40.wav", "abruptos/PA-10/PA-10__24-40.wav", "abruptos/PA-10/PA-10__25-40.wav"],
        ["abruptos/PA-33/PA-33__20-40.wav", "abruptos/PA-33/PA-33__21-40.wav", "abruptos/PA-33/PA-33__22-40.wav", "abruptos/PA-33/PA-33__23-40.wav", "abruptos/PA-33/PA-33__24-40.wav", "abruptos/PA-33/PA-33__25-40.wav"]
    ],
    rampa: [
        ["rampa/PR+10/PR+10__20-10-30.wav", "rampa/PR+10/PR+10__21-10-30.wav", "rampa/PR+10/PR+10__22-10-30.wav", "rampa/PR+10/PR+10__23-10-30.wav", "rampa/PR+10/PR+10__24-10-30.wav", "rampa/PR+10/PR+10__25-10-30.wav"],
        ["rampa/PR+33/PR+33__20-10-30.wav", "rampa/PR+33/PR+33__21-10-30.wav", "rampa/PR+33/PR+33__22-10-30.wav", "rampa/PR+33/PR+33__23-10-30.wav", "rampa/PR+33/PR+33__24-10-30.wav", "rampa/PR+33/PR+33__25-10-30.wav"],
        ["rampa/PR-10/PR-10__20-10-30.wav", "rampa/PR-10/PR-10__21-10-30.wav", "rampa/PR-10/PR-10__22-10-30.wav", "rampa/PR-10/PR-10__23-10-30.wav", "rampa/PR-10/PR-10__24-10-30.wav", "rampa/PR-10/PR-10__25-10-30.wav"],
        ["rampa/PR-33/PR-33__20-10-30.wav", "rampa/PR-33/PR-33__21-10-30.wav", "rampa/PR-33/PR-33__22-10-30.wav", "rampa/PR-33/PR-33__23-10-30.wav", "rampa/PR-33/PR-33__24-10-30.wav", "rampa/PR-33/PR-33__25-10-30.wav"]
    ]
};

const __verResultadosAnalisisOverride = function (data, nroPista) {
    const metadata = data.metadata_extraida || {};
    const video = (data.analisis && data.analisis.video) || {};
    const graficos = Array.isArray(data.graficos) ?data.graficos : [];

    document.getElementById('modal-analisis-titulo').textContent = `Resultados del análisis - Pista ${nroPista}`;
    document.getElementById('modal-analisis-subtitulo').textContent =
        `${metadata.tipo_metronomo || 'Tipo no detectado'} · ${metadata.mano || 'Mano no detectada'} · Sujeto ${metadata.sujeto || 'N/D'}`;

    document.getElementById('modal-analisis-resumen').textContent = [
        `Archivo: ${data.archivo || 'Sin nombre'}`,
        `Tipo: ${metadata.tipo_metronomo || 'No detectado'}`,
        `Mano: ${metadata.mano || 'No detectada'}`,
        `Sujeto: ${metadata.sujeto || 'No detectado'}`,
        `Duración: ${video.duracion_segundos ??'No disponible'} s`,
        `FPS: ${video.fps ??'No disponible'}`,
        `Gráficos generados: ${graficos.length}`
    ].join('\n');

    const galeria = document.getElementById('modal-analisis-galeria');
    galeria.className = 'flex-1 overflow-y-auto p-6 grid grid-cols-1 gap-8 bg-gray-100';
    galeria.innerHTML = '';

    if (!graficos.length) {
        galeria.innerHTML = `
                No se generaron gráficos visibles para esta corrida.
                No se generaron gráficos visibles para esta corrida.
            </div>
        `;
    } else {
        graficos.forEach((grafico, idx) => {
            const urlGrafico = app.normalizarUrlGrafico(grafico);
            const nombreGrafico = urlGrafico.split('/').pop() || `grafico_${idx + 1}`;
            const ext = nombreGrafico.split('.').pop().toLowerCase();
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl border shadow-sm';

            if (ext === 'html') {
                card.innerHTML = `
                    <div class="px-4 py-3 border-b bg-gray-50 font-semibold text-sm text-gray-700">
                        Gráfico interactivo ${idx + 1}
                    </div>
                    <iframe src="${urlGrafico}" class="w-full bg-white rounded-b-2xl" style="height:75vh;min-height:520px;border:0;" loading="lazy"></iframe>
                    <div class="px-4 py-3 border-t text-xs text-gray-500 break-all">
                        ${nombreGrafico}
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="px-4 py-3 border-b bg-gray-50 font-semibold text-sm text-gray-700">
                        Gráfico ${idx + 1}
                    </div>
                    <img src="${urlGrafico}" alt="Gráfico de análisis ${idx + 1}" class="w-full h-auto bg-white">
                    <div class="px-4 py-3 border-t text-xs text-gray-500 break-all">
                        ${nombreGrafico}
                    </div>
                `;
            }

            const img = card.querySelector('img');
            if (img) {
                img.style.display = 'block';
                img.style.height = 'auto';
                img.style.maxHeight = 'none';
                img.style.objectFit = 'contain';
                img.style.objectPosition = 'top';
                img.classList.add('rounded-b-2xl');

                const wrapper = document.createElement('a');
                wrapper.href = urlGrafico;
                wrapper.target = '_blank';
                wrapper.rel = 'noopener noreferrer';
                wrapper.className = 'block bg-white';

                const parent = img.parentNode;
                if (parent) {
                    parent.insertBefore(wrapper, img);
                    wrapper.appendChild(img);
                }

                img.addEventListener('error', () => {
                    card.innerHTML = `
                        <div class="px-4 py-3 border-b bg-red-50 font-semibold text-sm text-red-700">
                            No se pudo cargar el gráfico ${idx + 1}
                        </div>
                        <div class="p-4 text-sm text-gray-600 break-all">
                            <p class="mb-3">Ruta intentada:</p>
                            <a href="${urlGrafico}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${urlGrafico}</a>
                        </div>
                    `;
                });
            }

            const iframe = card.querySelector('iframe');
            if (iframe) {
                iframe.addEventListener('error', () => {
                    card.innerHTML = `
                        <div class="px-4 py-3 border-b bg-red-50 font-semibold text-sm text-red-700">
                            No se pudo cargar el gráfico interactivo ${idx + 1}
                        </div>
                        <div class="p-4 text-sm text-gray-600 break-all">
                            <p class="mb-3">Ruta intentada:</p>
                            <a href="${urlGrafico}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${urlGrafico}</a>
                        </div>
                    `;
                });
            }

            galeria.appendChild(card);
        });
    }

    document.getElementById('modal-analisis').classList.remove('hidden');
    lucide.createIcons();
};


// ==========================================
// MÓDULO PRINCIPAL DE LA APP
// ==========================================
const ANALYSIS_STORAGE_KEY = 'neuroMusicaAnalisisV2';
const MAX_CONSENT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE_BYTES = 250 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE_BYTES_PUBLIC = 100 * 1024 * 1024;
const ANALYSIS_CATEGORY_RULES = [
    { key: 'resumen', label: 'Resumen', tests: ['grafico_001', 'grafico_002', 'resumen', 'overview', 'general'] },
    { key: 'senal', label: 'Señal / envolvente', tests: ['envolvente', 'envelope', 'senal', 'signal', 'audio', 'onda', 'waveform', 'fft', 'frecuencia', 'spect', 'grafico_003', 'grafico_004', 'grafico_005', 'grafico_006', 'grafico_007'] },
    { key: 'picos', label: 'Picos / detección', tests: ['peak', 'pico', 'deteccion', 'detec', 'grafico_008', 'grafico_009', 'grafico_010', 'grafico_011'] },
    { key: 'ritmo', label: 'Ritmo', tests: ['ritmo', 'rhythm', 'asincronia', 'sincro', 'sync', 'grafico_012', 'grafico_013', 'grafico_014', 'grafico_015', 'grafico_016'] },
    { key: 'tempo', label: 'Tempo', tests: ['tempo', 'bpm', 'rampa', 'grafico_017', 'grafico_018', 'grafico_019'] },
    { key: 'precision', label: 'Precisión', tests: ['precision', 'accuracy', 'consistencia', 'iti', 'stats', 'grafico_020', 'grafico_021', 'grafico_022', 'grafico_023'] },
    { key: 'otros', label: 'Otros / adicionales', tests: ['trayectorias', '3d', '2d', 'html', 'adicional'] }
];

const app = {
    pacientes: [],
    pacientesFiltroTipo: 'adulto',
    bnpmMostrarCreadorA: false,
    bnpmMostrarCreadorB: false,
    uiLoadingStates: {},
    currentUser: null,
    suprimirBeforeUnload: false,
    suprimirConfirmacionSalidaAdulto: false,
    formularioAdultoTieneCambios: false,
    pacienteDetalleEdicionTieneCambios: false,
    origenEvaluaciónAdulto: null,
    init: async function () {
        const sessionReady = await this.cargarSesionUsuario();
        if (!sessionReady) {
            return;
        }
        this.cambiarVista('inicio');
        this.configurarBuscador();
        this.verificarConexion();
    },
    cargarSesionUsuario: async function () {
        try {
            const response = await fetch(CONFIG.ME_URL, { cache: 'no-store' });
            const data = await response.json().catch(() => ({ authenticated: false }));
            if (!response.ok || !data.authenticated || !data.user) {
                window.location.href = CONFIG.LOGIN_URL;
                return false;
            }
            this.currentUser = data.user;
            this.actualizarSesionUsuarioUI();
            return true;
        } catch (error) {
            alert('No se pudo verificar la sesión. Revisá la conexión e intentá nuevamente.');
            window.location.href = CONFIG.LOGIN_URL;
            return false;
        }
    },
    actualizarSesionUsuarioUI: function () {
        const nameNode = document.getElementById('auth-user-name');
        const emailNode = document.getElementById('auth-user-email');
        const user = this.currentUser || {};
        if (nameNode) {
            nameNode.textContent = user.name || user.nombre || user.email || 'Sin sesión';
        }
        if (emailNode) {
            const role = user.role ? ` · ${user.role}` : '';
            emailNode.textContent = user.email ? `${user.email}${role}` : '';
        }
        lucide.createIcons();
    },
    cerrarSesion: async function () {
        if (this.hayCambiosPendientesGlobales() && !this.confirmarSalidaSinGuardar('Tenés cambios sin guardar. ¿Querés cerrar sesión y salir sin guardar?')) {
            return;
        }

        const button = document.getElementById('btn-logout');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<span class="track-inline-spinner" aria-hidden="true"></span>Cerrando sesión...';
        }
        this.suprimirBeforeUnload = true;
        this.suprimirConfirmacionSalidaAdulto = true;
        window.location.assign(CONFIG.LOGOUT_NAV_URL);
    },
    esperarSiguienteFrame: function () {
        return new Promise(resolve => requestAnimationFrame(() => resolve()));
    },
    construirContenidoCargando: function (texto) {
        return `<span class="track-inline-spinner" aria-hidden="true"></span><span>${this.escapeHtml(texto)}</span>`;
    },
    esEmailValido: function (valor) {
        if (!valor) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor).trim());
    },
    esFechaValida: function (valor) {
        if (!valor) return false;
        const fecha = new Date(valor);
        return !Number.isNaN(fecha.getTime());
    },
    esNumeroValidoOpcional: function (valor) {
        if (valor == null || valor === '') return true;
        const numero = Number(valor);
        return Number.isFinite(numero);
    },
    limitarADecimalUnico: function (valor) {
        const texto = String(valor || '').replace(',', '.').replace(/[^\d.]/g, '');
        if (!texto) return '';
        const partes = texto.split('.');
        const entero = partes[0] || '0';
        const decimal = partes[1] ?partes[1].slice(0, 1) : '';
        return decimal ?`${entero}.${decimal}` : entero;
    },
    inicializarCamposMedidasMano: function () {
        ['dat-mano-md-mayor', 'dat-mano-md-indice', 'dat-mano-mi-mayor', 'dat-mano-mi-indice'].forEach(id => {
            const campo = document.getElementById(id);
            if (!campo || campo.dataset.decimalInit === 'true') return;
            campo.dataset.decimalInit = 'true';
            campo.addEventListener('input', () => {
                const valorNormalizado = this.limitarADecimalUnico(campo.value);
                if (campo.value !== valorNormalizado) {
                    campo.value = valorNormalizado;
                }
            });
            campo.addEventListener('blur', () => {
                const valorNormalizado = this.limitarADecimalUnico(campo.value);
                if (valorNormalizado === '') {
                    campo.value = '';
                    return;
                }
                const numero = Number(valorNormalizado);
                campo.value = Number.isFinite(numero) ?numero.toFixed(1) : '';
            });
        });
    },
    limpiarErroresValidacionFormulario: function (form) {
        if (!form) return;
        form.querySelectorAll('[data-error-for]').forEach(nodo => nodo.remove());
        form.querySelectorAll('.field-error').forEach(campo => campo.classList.remove('field-error'));
    },
    mostrarErrorCampo: function (campo, mensaje) {
        if (!campo) return;
        campo.classList.add('field-error');
        campo.setAttribute('aria-invalid', 'true');
        const error = document.createElement('p');
        error.className = 'mt-1 text-xs font-medium text-red-600';
        error.dataset.errorFor = campo.id || campo.name || 'campo';
        error.textContent = mensaje;
        campo.insertAdjacentElement('afterend', error);
    },
    obtenerMensajeErrorConexion: function (accion = 'completar la acción') {
        return `No se pudo conectar con el servidor para ${accion}. Revisá la conexión e intentá nuevamente.`;
    },
    obtenerMensajeErrorServidor: function (accion = 'completar la acción') {
        return `No se pudo ${accion}. Volvé a intentarlo en unos segundos.`;
    },
    cerrarModalErrorAccion: function () {
        const modal = document.getElementById('modal-error-accion');
        if (!modal) return;
        modal.classList.add('hidden');
        if (typeof this._resolverModalAccionPendiente === 'function') {
            const resolver = this._resolverModalAccionPendiente;
            this._resolverModalAccionPendiente = null;
            resolver();
        }
    },
    obtenerEstiloModalAccion: function (tipo = 'error') {
        const estilos = {
            error: {
                etiqueta: 'Aviso',
                encabezado: 'px-6 py-5 bg-gradient-to-r from-rose-50 via-white to-amber-50 border-b border-slate-200 flex items-start justify-between gap-4',
                iconoWrap: 'w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0',
                icono: 'alert-triangle',
                detalles: 'rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-slate-700 space-y-2',
                ayuda: 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600',
                boton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition'
            },
            warning: {
                etiqueta: 'Aviso',
                encabezado: 'px-6 py-5 bg-gradient-to-r from-amber-50 via-white to-orange-50 border-b border-slate-200 flex items-start justify-between gap-4',
                iconoWrap: 'w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0',
                icono: 'triangle-alert',
                detalles: 'rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-slate-700 space-y-2',
                ayuda: 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600',
                boton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition'
            },
            success: {
                etiqueta: 'Listo',
                encabezado: 'px-6 py-5 bg-gradient-to-r from-emerald-50 via-white to-sky-50 border-b border-slate-200 flex items-start justify-between gap-4',
                iconoWrap: 'w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0',
                icono: 'check-circle',
                detalles: 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-slate-700 space-y-2',
                ayuda: 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600',
                boton: 'bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition'
            },
            info: {
                etiqueta: 'Información',
                encabezado: 'px-6 py-5 bg-gradient-to-r from-sky-50 via-white to-indigo-50 border-b border-slate-200 flex items-start justify-between gap-4',
                iconoWrap: 'w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0',
                icono: 'info',
                detalles: 'rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-slate-700 space-y-2',
                ayuda: 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600',
                boton: 'bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition'
            }
        };
        return estilos[tipo] || estilos.error;
    },
    mostrarModalAvisoAccion: function ({
        tipo = 'info',
        titulo = 'Aviso',
        resumen = '',
        detalles = [],
        ayuda = '',
        botonTexto = 'Entendido'
    } = {}) {
        const modal = document.getElementById('modal-error-accion');
        if (!modal) {
            const texto = [titulo, resumen, ...(Array.isArray(detalles) ? detalles : [])].filter(Boolean).join('\n\n');
            alert(texto || 'Aviso');
            return Promise.resolve();
        }

        if (typeof this._resolverModalAccionPendiente === 'function') {
            const resolverAnterior = this._resolverModalAccionPendiente;
            this._resolverModalAccionPendiente = null;
            resolverAnterior();
        }

        const estilo = this.obtenerEstiloModalAccion(tipo);
        const encabezado = document.getElementById('modal-error-accion-encabezado');
        const iconoWrap = document.getElementById('modal-error-accion-icono-wrap');
        const icono = document.getElementById('modal-error-accion-icono');
        const etiqueta = document.getElementById('modal-error-accion-etiqueta');
        const tituloEl = document.getElementById('modal-error-accion-titulo');
        const resumenEl = document.getElementById('modal-error-accion-resumen');
        const detallesEl = document.getElementById('modal-error-accion-detalles');
        const ayudaEl = document.getElementById('modal-error-accion-ayuda');
        const botonEl = document.getElementById('modal-error-accion-boton');

        if (encabezado) encabezado.className = estilo.encabezado;
        if (iconoWrap) iconoWrap.className = estilo.iconoWrap;
        if (icono) {
            icono.setAttribute('data-lucide', estilo.icono);
            icono.className = 'w-6 h-6';
        }
        if (etiqueta) etiqueta.textContent = estilo.etiqueta;
        if (tituloEl) tituloEl.textContent = titulo;
        if (resumenEl) resumenEl.textContent = resumen;
        if (botonEl) {
            botonEl.className = estilo.boton;
            botonEl.textContent = botonTexto;
        }

        if (detallesEl) {
            detallesEl.innerHTML = '';
            const listaDetalles = Array.isArray(detalles) ? detalles.filter(Boolean) : [];
            if (listaDetalles.length > 0) {
                detallesEl.className = estilo.detalles;
                listaDetalles.forEach((item) => {
                    const fila = document.createElement('p');
                    fila.className = 'leading-relaxed';
                    fila.textContent = item;
                    detallesEl.appendChild(fila);
                });
                detallesEl.classList.remove('hidden');
            } else {
                detallesEl.classList.add('hidden');
            }
        }

        if (ayudaEl) {
            if (ayuda) {
                ayudaEl.className = estilo.ayuda;
                ayudaEl.textContent = ayuda;
                ayudaEl.classList.remove('hidden');
            } else {
                ayudaEl.textContent = '';
                ayudaEl.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        return new Promise((resolve) => {
            this._resolverModalAccionPendiente = resolve;
        });
    },
    construirContenidoErrorAccion: function (mensaje, recuperacion = '') {
        const tituloBase = String(mensaje || 'No se pudo completar la acción.').trim();
        const detalleBase = String(recuperacion || '').trim();
        const detalleNormalizado = detalleBase
            .replace(/^Error interno del analisis:\s*/i, '')
            .replace(/^Error interno del análisis:\s*/i, '')
            .trim();

        const contenido = {
            titulo: tituloBase,
            resumen: detalleNormalizado || 'Revisá la información e intentá nuevamente.',
            detalles: [],
            ayuda: ''
        };

        const coincideAudioVideo = /archivo de audio no corresponde al video/i.test(detalleNormalizado)
            || /porcentaje de cambio no coincide/i.test(detalleNormalizado);

        if (coincideAudioVideo) {
            const video = detalleNormalizado.match(/Video\s*:\s*([^\n]+)/i)?.[1]?.trim();
            const audio = detalleNormalizado.match(/Audio\s*:\s*([^\n]+)/i)?.[1]?.trim();
            const archivoAudio = detalleNormalizado.match(/Archivo de audio\s*:\s*([^\n]+)/i)?.[1]?.trim();

            contenido.titulo = 'El audio no coincide con este video';
            contenido.resumen = 'El archivo de audio seleccionado no corresponde a la condición experimental detectada en el video.';
            contenido.detalles = [
                video ? `Porcentaje detectado en el video: ${video}` : null,
                audio ? `Porcentaje detectado en el audio: ${audio}` : null,
                archivoAudio ? `Archivo de audio asociado: ${archivoAudio}` : null
            ].filter(Boolean);
            contenido.ayuda = 'Probá volver a cargar el video y verificá que la condición experimental coincida con el audio.';
            return contenido;
        }

        const coincideOtraPista = /video parece corresponder a otra pista/i.test(detalleNormalizado)
            || /tempo detectado en el video/i.test(detalleNormalizado);

        if (coincideOtraPista) {
            const pistaEsperada = detalleNormalizado.match(/Pista esperada:\s*([^\n]+)/i)?.[1]?.trim();
            const tempoDetectado = detalleNormalizado.match(/Tempo detectado en el video:\s*([^\n]+)/i)?.[1]?.trim();
            const diferencia = detalleNormalizado.match(/Diferencia detectada:\s*([^\n]+)/i)?.[1]?.trim();

            contenido.titulo = 'El video no coincide con esta pista';
            contenido.resumen = 'El tempo detectado en el video no coincide con el estímulo esperado para esta pista.';
            contenido.detalles = [
                pistaEsperada ? `Pista esperada: ${pistaEsperada}` : null,
                tempoDetectado ? `Tempo detectado: ${tempoDetectado}` : null,
                diferencia ? `Diferencia detectada: ${diferencia}` : null
            ].filter(Boolean);
            contenido.ayuda = 'Verificá que el video corresponda al audio correcto y volvé a subirlo en esta misma pista.';
            return contenido;
        }

        if (/análisis sigue en curso/i.test(detalleNormalizado) || /analisis sigue en curso/i.test(detalleNormalizado)) {
            contenido.titulo = 'El análisis todavía sigue en curso';
            contenido.resumen = 'Ese video no se puede eliminar mientras el procesamiento no haya terminado.';
            contenido.detalles = detalleNormalizado ? [detalleNormalizado] : [];
            contenido.ayuda = 'Esperá a que finalice el análisis y luego intentá nuevamente.';
            return contenido;
        }

        if (/archivo está siendo usado por otro proceso/i.test(detalleNormalizado) || /archivo esta siendo usado por otro proceso/i.test(detalleNormalizado)) {
            contenido.titulo = 'El archivo está en uso';
            contenido.resumen = 'Windows no permitió eliminar el video porque todavía está siendo usado por otro proceso.';
            contenido.detalles = detalleNormalizado ? [detalleNormalizado] : [];
            contenido.ayuda = 'Esperá unos instantes y volvé a intentar. Si el análisis quedó colgado, reiniciar el servidor puede liberar el archivo.';
            return contenido;
        }

        const errorFaltante = /\[WinError 2\]/i.test(detalleNormalizado) || /no puede encontrar el archivo especificado/i.test(detalleNormalizado);
        if (errorFaltante) {
            contenido.titulo = 'Falta un archivo necesario para el análisis';
            contenido.resumen = 'No se encontró uno de los archivos que el sistema necesita para procesar este video.';
            contenido.detalles = detalleNormalizado ? [detalleNormalizado] : [];
            contenido.ayuda = 'Revisá que el video siga cargado correctamente y volvé a intentar. Si persiste, puede faltar un recurso interno de análisis.';
            return contenido;
        }

        if (/No hay resultados disponibles para graficar/i.test(detalleNormalizado)) {
            contenido.titulo = 'El análisis no generó resultados válidos';
            contenido.resumen = 'El sistema no pudo obtener datos suficientes para completar esta pista.';
            contenido.detalles = detalleNormalizado ? [detalleNormalizado] : [];
            contenido.ayuda = 'Podés revisar el archivo cargado y volver a analizar esta misma pista.';
            return contenido;
        }

        if (detalleNormalizado) {
            contenido.detalles = [detalleNormalizado];
        }

        return contenido;
    },
    mostrarModalErrorAccion: function (mensaje, recuperacion = '') {
        const contenido = this.construirContenidoErrorAccion(mensaje, recuperacion);
        return this.mostrarModalAvisoAccion({
            tipo: 'error',
            titulo: contenido.titulo,
            resumen: contenido.resumen,
            detalles: contenido.detalles,
            ayuda: contenido.ayuda
        });
    },
    mostrarErrorAccion: function (mensaje, recuperacion = '') {
        this.mostrarModalErrorAccion(mensaje, recuperacion);
    },
    validarFormularioAdulto: function () {
        const form = document.getElementById('evaluationFormMedicion');
        if (!form) return true;
        this.limpiarErroresValidacionFormulario(form);

        const errores = [];
        const campos = [
            { id: 'dat-nombre', mensaje: 'El nombre y apellido es obligatorio.', validar: valor => String(valor || '').trim().length > 0 },
            { id: 'dat-fecha', mensaje: 'Ingresá una fecha válida.', validar: valor => this.esFechaValida(valor) },
            { id: 'dat-dominancia', mensaje: 'Seleccioná la mano hábil.', validar: valor => String(valor || '').trim().length > 0 },
            { id: 'dat-mano-inicio', mensaje: 'Seleccioná la mano que inicia la prueba.', validar: valor => String(valor || '').trim().length > 0 },
            { id: 'dat-email', mensaje: 'Ingresá un e-mail válido.', validar: valor => this.esEmailValido(valor), opcional: true },
            { id: 'dat-fecha-nacimiento', mensaje: 'Ingresá una fecha de nacimiento válida en formato dd/mm/aaaa.', validar: valor => this.esFechaNacimientoTextoValidaOpcional(valor), opcional: true },
            { id: 'dat-edad', mensaje: 'La edad debe ser numérica.', validar: valor => this.esNumeroEnteroValidoOpcional(valor), opcional: true },
            { id: 'dat-formacion-musical-anios', mensaje: 'La formación musical en años debe ser numérica.', validar: valor => this.esNumeroEnteroValidoOpcional(valor), opcional: true },
            { id: 'dat-mano-md-mayor', mensaje: 'Este campo debe ser numérico.', validar: valor => this.esNumeroValidoOpcional(valor), opcional: true },
            { id: 'dat-mano-md-indice', mensaje: 'Este campo debe ser numérico.', validar: valor => this.esNumeroValidoOpcional(valor), opcional: true },
            { id: 'dat-mano-mi-mayor', mensaje: 'Este campo debe ser numérico.', validar: valor => this.esNumeroValidoOpcional(valor), opcional: true },
            { id: 'dat-mano-mi-indice', mensaje: 'Este campo debe ser numérico.', validar: valor => this.esNumeroValidoOpcional(valor), opcional: true }
        ];

        campos.forEach(({ id, mensaje, validar, opcional }) => {
            const campo = document.getElementById(id);
            if (!campo) return;
            campo.removeAttribute('aria-invalid');
            const valor = campo.value;
            if (opcional && !String(valor || '').trim()) return;
            if (!validar(valor)) {
                errores.push({ campo, mensaje });
            }
        });

        errores.forEach(({ campo, mensaje }) => this.mostrarErrorCampo(campo, mensaje));
        if (errores.length > 0 && errores[0].campo) {
            errores[0].campo.focus();
        }
        return errores.length === 0;
    },
    esFechaNacimientoTextoValidaOpcional: function (valor) {
        const texto = String(valor || "").trim();
        if (!texto) return true;
        if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
            const [anioTxt, mesTxt, diaTxt] = texto.split('-');
            const anio = Number(anioTxt);
            const mes = Number(mesTxt);
            const dia = Number(diaTxt);
            const fecha = new Date(anio, mes - 1, dia);
            return fecha.getFullYear() === anio && fecha.getMonth() === (mes - 1) && fecha.getDate() === dia;
        }
        const match = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) return false;
        const dia = Number(match[1]);
        const mes = Number(match[2]);
        const anio = Number(match[3]);
        const fecha = new Date(anio, mes - 1, dia);
        return fecha.getFullYear() === anio && fecha.getMonth() === (mes - 1) && fecha.getDate() === dia;
    },
    esNumeroEnteroValidoOpcional: function (valor) {
        const texto = String(valor || "").trim();
        if (!texto) return true;
        return /^\d+$/.test(texto);
    },
    validarFormularioEdicionPaciente: function () {
        const form = document.getElementById('detalle-paciente-form');
        if (!form) return true;
        this.limpiarErroresValidacionFormulario(form);
        const errores = [];
        const evaluar = (name, mensaje, validar, opcional = false) => {
            const campo = form.querySelector(`[name="${name}"]`);
            if (!campo) return;
            campo.removeAttribute('aria-invalid');
            const valor = campo.value;
            if (opcional && !String(valor || '').trim()) return;
            if (!validar(valor)) {
                errores.push({ campo, mensaje });
            }
        };
        evaluar('nombre', 'El nombre y apellido es obligatorio.', valor => String(valor || '').trim().length > 0);
        evaluar('email', 'Ingresá un e-mail válido.', valor => this.esEmailValido(valor), true);
        ['md_mayor', 'md_indice', 'mi_mayor', 'mi_indice'].forEach(name => {
            evaluar(name, 'Este campo debe ser numérico.', valor => this.esNumeroValidoOpcional(valor), true);
        });
        errores.forEach(({ campo, mensaje }) => this.mostrarErrorCampo(campo, mensaje));
        if (errores.length > 0 && errores[0].campo) {
            errores[0].campo.focus();
        }
        return errores.length === 0;
    },
    validarFormularioPacienteNino: function (moduleKey) {
        const prefix = `bnpm-${moduleKey}-new-`;
        const root = document.getElementById(`${prefix}name`).closest('section');
        if (root) this.limpiarErroresValidacionFormulario(root);
        const nombre = document.getElementById(`${prefix}name`);
        const fechaEvaluación = document.getElementById(`${prefix}evaluation-date`);
        const edad = document.getElementById(`${prefix}age`);
        const errores = [];
        if (!nombre || !String(nombre.value || '').trim()) {
            errores.push({ campo: nombre, mensaje: 'El nombre y apellido es obligatorio.' });
        }
        if (!fechaEvaluación || !this.esFechaValida(fechaEvaluación.value)) {
            errores.push({ campo: fechaEvaluación, mensaje: 'Ingresá una fecha válida.' });
        }
        if (edad && !this.esNumeroValidoOpcional(edad.value)) {
            errores.push({ campo: edad, mensaje: 'Este campo debe ser numérico.' });
        }
        errores.forEach(({ campo, mensaje }) => this.mostrarErrorCampo(campo, mensaje));
        errores[0].campo.focus();
        return errores.length === 0;
    },
    validarArchivoConsentimiento: function (file) {
        if (!file) return 'El consentimiento debe ser un archivo PDF, JPG o PNG.';
        const extensionesValidas = ['pdf', 'jpg', 'jpeg', 'png'];
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        if (!extensionesValidas.includes(extension)) {
            return 'El consentimiento debe ser un archivo PDF, JPG o PNG.';
        }
        if (file.size > MAX_CONSENT_FILE_SIZE_BYTES) {
            return 'El consentimiento supera el tamaño máximo permitido de 10 MB.';
        }
        return '';
    },
    validarArchivoVideo: function (file) {
        if (!file) return 'El archivo debe ser un video en un formato permitido.';
        const extensionesValidas = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'];
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        const mimeValido = String(file.type || '').startsWith('video/');
        if (!mimeValido && !extensionesValidas.includes(extension)) {
            return 'El archivo debe ser un video en un formato permitido.';
        }
        if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
            return 'El video supera el tamaño máximo permitido de 250 MB.';
        }
        return '';
    },
    estaAccionCargando: function (clave) {
        return !!this.uiLoadingStates[clave];
    },
    setAccionCargando: function (clave, activo) {
        if (!clave) return;
        if (activo) {
            this.uiLoadingStates[clave] = true;
            return;
        }
        delete this.uiLoadingStates[clave];
    },
    marcarBotonEnCarga: function (boton, texto) {
        if (!(boton instanceof HTMLElement)) return null;
        if (!boton.dataset.loadingOriginalHtml) {
            boton.dataset.loadingOriginalHtml = boton.innerHTML;
        }
        boton.classList.add('track-action-loading', 'inline-flex', 'items-center', 'justify-center', 'gap-2');
        boton.setAttribute('aria-busy', 'true');
        boton.disabled = true;
        boton.innerHTML = this.construirContenidoCargando(texto);
        return boton;
    },
    restaurarBotonEnCarga: function (boton) {
        if (!(boton instanceof HTMLElement)) return;
        const originalHtml = boton.dataset.loadingOriginalHtml;
        if (originalHtml) {
            boton.innerHTML = originalHtml;
        }
        boton.classList.remove('track-action-loading', 'inline-flex', 'items-center', 'justify-center', 'gap-2');
        boton.removeAttribute('aria-busy');
        boton.disabled = false;
        delete boton.dataset.loadingOriginalHtml;
    },
    marcarFormularioAdultoComoModificado: function () {
        this.formularioAdultoTieneCambios = true;
    },
    resetearFormularioAdultoModificado: function () {
        this.formularioAdultoTieneCambios = false;
    },
    hayCambiosSinGuardarEnAdulto: function () {
        return !!this.formularioAdultoTieneCambios || protocolo.pasoActual > 1 || protocolo.playlistFinal.length > 0 || protocolo.resultadosPistas.length > 0;
    },
    marcarEdicionPacienteComoModificada: function () {
        this.pacienteDetalleEdicionTieneCambios = true;
    },
    resetearEdicionPacienteComoModificada: function () {
        this.pacienteDetalleEdicionTieneCambios = false;
    },
    confirmarSalidaSinGuardar: function (mensaje = 'Tenés cambios sin guardar. ¿Querés salir sin guardar?') {
        return confirm(mensaje);
    },
    puedeAbandonarVistaActual: function (vistaDestino = null) {
        const vistaProtocoloVisible = !document.getElementById('vista-protocolo').classList.contains('hidden');
        const vistaDetallePacienteVisible = !document.getElementById('vista-paciente-detalle').classList.contains('hidden');

        if (vistaProtocoloVisible && !this.suprimirConfirmacionSalidaAdulto && vistaDestino !== 'protocolo' && this.hayCambiosSinGuardarEnAdulto()) {
            return this.confirmarSalidaSinGuardar('Tenés cambios sin guardar en la evaluación clínica. ¿Querés salir sin guardar?');
        }

        if (vistaDetallePacienteVisible && this.pacienteDetalleModoEdicion && this.pacienteDetalleEdicionTieneCambios) {
            return this.confirmarSalidaSinGuardar('Tenés cambios sin guardar en la edición del paciente. ¿Querés salir sin guardar?');
        }

        return true;
    },
    hayCambiosPendientesGlobales: function () {
        const vistaProtocoloVisible = !document.getElementById('vista-protocolo').classList.contains('hidden');
        const vistaDetallePacienteVisible = !document.getElementById('vista-paciente-detalle').classList.contains('hidden');
        return (vistaProtocoloVisible && this.hayCambiosSinGuardarEnAdulto()) || (vistaDetallePacienteVisible && this.pacienteDetalleModoEdicion && this.pacienteDetalleEdicionTieneCambios);
    },
    verificarConexion: async function () {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        if (dot) {
            dot.className = "w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse";
        }
        if (text) {
            text.textContent = "Verificando...";
            text.className = "text-white/80 font-medium";
        }
        try {
            const health = await fetch(CONFIG.HEALTH_URL, { cache: 'no-store' });
            if (health.ok) {
                if (dot) {
                    dot.className = "w-2.5 h-2.5 rounded-full bg-green-500";
                }
                if (text) {
                    text.textContent = "Servidor Conectado";
                    text.className = "text-white/80 font-medium text-green-300";
                }
            }

            const respuesta = await fetch(CONFIG.API_URL);
            if (respuesta.ok) {
                this.pacientes = await respuesta.json();
                if (dot) {
                    dot.className = "w-2.5 h-2.5 rounded-full bg-green-500";
                }
                if (text) {
                    text.textContent = "Servidor Conectado";
                    text.className = "text-white/80 font-medium text-green-300";
                }
                this.renderizarTablaPacientes(this.pacientes);
                return;
            }
            if (respuesta.status === 401) {
                window.location.href = CONFIG.LOGIN_URL;
                return;
            }
            throw new Error('Respuesta no válida del servidor.');
        } catch (error) {
            if (dot) {
                dot.className = "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse";
            }
            if (text) {
                text.textContent = "Servidor Apagado";
                text.className = "text-white/80 font-medium";
            }
        }
    },
    cambiarVista: function (vistaId) {
        document.querySelectorAll('.vista-seccion').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('block');
        });

        const vistaActiva = document.getElementById(`vista-${vistaId}`);
        if (vistaActiva) {
            vistaActiva.classList.remove('hidden');
            vistaActiva.classList.add('block');
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-white/20');
            btn.classList.add('hover:bg-white/10');
        });
        const navId = ['protocolo', 'evaluacion-nino', 'bnpm-modulo-a', 'bnpm-modulo-b'].includes(vistaId)
             ?'evaluaciones'
            : vistaId === 'paciente-detalle'
                 ?'pacientes'
            : vistaId;
        const btnActivo = document.getElementById(`nav-${navId}`);
        if (btnActivo) {
            btnActivo.classList.add('bg-white/20');
            btnActivo.classList.remove('hover:bg-white/10');
        }

        if (vistaId === 'pacientes') this.verificarConexion();
        if (vistaId === 'protocolo') protocolo.reiniciar();

        lucide.createIcons();
    },
    abrirEvaluaciónAdulto: function (origen = null) {
        this.origenEvaluaciónAdulto = origen || this.origenEvaluaciónAdulto || 'evaluaciones';
        this.cambiarVista('protocolo');
        this.aplicarPrefillEvaluaciónAdultoPendiente();
    },
    cancelarEvaluaciónAdulto: function () {
        if (!this.puedeAbandonarVistaActual(this.origenEvaluaciónAdulto || 'evaluaciones')) {
            return;
        }
        this.prefillEvaluaciónAdultoPendiente = null;
        this.formularioAdultoTieneCambios = false;
        this.suprimirConfirmacionSalidaAdulto = false;
        protocolo.reiniciar();
        this.cambiarVista(this.origenEvaluaciónAdulto || 'evaluaciones');
    },
    esPacienteAdulto: function (paciente) {
        return !this.esPacienteNino(paciente);
    },
    normalizarTextoPaciente: function (valor) {
        return String(valor || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    },
    obtenerFechaActualLocalISO: function () {
        const ahora = new Date();
        const offset = ahora.getTimezoneOffset() * 60000;
        return new Date(ahora.getTime() - offset).toISOString().slice(0, 10);
    },
    parsearFechaClinica: function (valor) {
        if (!valor) return null;
        const texto = String(valor).trim();
        const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (matchIso) {
            const anio = Number(matchIso[1]);
            const mes = Number(matchIso[2]);
            const dia = Number(matchIso[3]);
            const fecha = new Date(anio, mes - 1, dia);
            return Number.isNaN(fecha.getTime()) ?null : fecha;
        }
        const fecha = new Date(texto);
        return Number.isNaN(fecha.getTime()) ?null : fecha;
    },
    formatearFechaPaciente: function (valor) {
        if (!valor) return 'Sin fecha';
        const fecha = this.parsearFechaClinica(valor);
        return !fecha || Number.isNaN(fecha.getTime()) ?'Sin fecha' : fecha.toLocaleDateString('es-AR');
    },
    obtenerTimestampPaciente: function (paciente) {
        if (!paciente || !paciente.fecha) return 0;
        const fecha = this.parsearFechaClinica(paciente.fecha);
        return fecha ?fecha.getTime() : 0;
    },
    obtenerInfoActividadRegistro: function (registro) {
        const mejor = { timestamp: 0, value: '' };
        const revisarFecha = (valor) => {
            if (!valor) return;
            const fecha = this.parsearFechaClinica(valor);
            const timestamp = fecha ?fecha.getTime() : Number.NaN;
            if (Number.isNaN(timestamp) || timestamp < mejor.timestamp) return;
            mejor.timestamp = timestamp;
            mejor.value = valor;
        };

        [
            registro.updatedAt,
            registro.updated_at,
            registro.modifiedAt,
            registro.modified_at,
            registro.fecha_actualizacion,
            registro.fechaModificacion,
            registro.fecha_modificacion,
            registro.createdAt,
            registro.created_at,
            registro.fecha_creacion,
            registro.fecha
        ].forEach(revisarFecha);

        const evaluaciones = Array.isArray(registro.evaluaciones_detalladas) ?registro.evaluaciones_detalladas : [];
        evaluaciones.forEach((evaluacion) => {
            [
                evaluacion.updatedAt,
                evaluacion.updated_at,
                evaluacion.modifiedAt,
                evaluacion.modified_at,
                evaluacion.fecha_actualizacion,
                evaluacion.fechaModificacion,
                evaluacion.fecha_modificacion,
                evaluacion.createdAt,
                evaluacion.created_at,
                evaluacion.fecha_creacion,
                evaluacion.fecha
            ].forEach(revisarFecha);
        });

        return mejor;
    },
    obtenerTimestampActividadRegistro: function (registro) {
        return this.obtenerInfoActividadRegistro(registro).timestamp;
    },
    obtenerClavePacienteAgrupado: function (paciente) {
        const tipo = this.esPacienteNino(paciente) ?'nino' : 'adulto';
        const nombre = this.normalizarTextoPaciente(paciente.nombre || 'sin-nombre');
        const email = this.normalizarTextoPaciente(paciente.email || '');
        const nacimiento = this.normalizarTextoPaciente(paciente.fecha_nacimiento || '');
        return [tipo, nombre || 'sin-nombre', email || nacimiento || 'sin-identificador'].join('::');
    },
    agruparPacientes: function (datos) {
        const grupos = new Map();

        (datos || []).forEach((paciente, index) => {
            const clave = this.obtenerClavePacienteAgrupado(paciente);
            const tipo = this.esPacienteNino(paciente) ?'nino' : 'adulto';
            if (!grupos.has(clave)) {
                grupos.set(clave, {
                    clave,
                    tipo,
                    registros: []
                });
            }
            grupos.get(clave).registros.push({
                ...paciente,
                _index: index
            });
        });

        return [...grupos.values()]
            .map(grupo => {
                const registros = [...grupo.registros].sort((a, b) => this.obtenerTimestampPaciente(b) - this.obtenerTimestampPaciente(a));
                const ultimo = registros[0] || {};
                const registrosPorActividad = [...grupo.registros].sort((a, b) => this.obtenerTimestampActividadRegistro(b) - this.obtenerTimestampActividadRegistro(a));
                const ultimoConActividad = registrosPorActividad[0] || ultimo;
                const actividad = this.obtenerInfoActividadRegistro(ultimoConActividad);
                return {
                    ...grupo,
                    registros,
                    ultimo,
                    ultimoConActividad,
                    nombre: ultimo.nombre || 'Paciente sin nombre',
                    email: ultimo.email || '',
                    diagnostico: ultimo.diagnostico || '',
                    fechaUltimaEvaluación: ultimo.fecha || '',
                    fechaUltimaActividad: actividad.value || ultimo.fecha || '',
                    timestampUltimaActividad: actividad.timestamp || this.obtenerTimestampPaciente(ultimo),
                    cantidadEvaluaciónes: registros.length
                };
            })
            .sort((a, b) => this.obtenerTimestampPaciente(b.ultimo) - this.obtenerTimestampPaciente(a.ultimo));
    },
    pacienteCoincideFiltroTipo: function (paciente) {
        return this.pacientesFiltroTipo === 'nino'
             ?this.esPacienteNino(paciente)
            : this.esPacienteAdulto(paciente);
    },
    obtenerGrupoPacientePorClave: function (clave) {
        const grupos = this.pacientesAgrupados || this.agruparPacientes(this.pacientes || []);
        return grupos.find(grupo => grupo.clave === clave) || null;
    },
    actualizarTabsPacientes: function (grupos) {
        const adultos = (grupos || []).filter(grupo => grupo.tipo !== 'nino').length;
        const ninos = (grupos || []).filter(grupo => grupo.tipo === 'nino').length;
        const tabAdulto = document.getElementById('pacientes-tab-adulto');
        const tabNino = document.getElementById('pacientes-tab-nino');
        const resumen = document.getElementById('pacientes-tab-resumen');
        if (tabAdulto) {
            tabAdulto.className = this.pacientesFiltroTipo === 'adulto'
                 ?'px-4 py-2 rounded-full text-sm font-semibold border border-primary bg-primary text-white transition'
                : 'px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition';
            tabAdulto.textContent = `Adultos (${adultos})`;
        }
        if (tabNino) {
            tabNino.className = this.pacientesFiltroTipo === 'nino'
                 ?'px-4 py-2 rounded-full text-sm font-semibold border border-action bg-action text-white transition'
                : 'px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition';
            tabNino.textContent = `Niños/as (${ninos})`;
        }
        if (resumen) {
            resumen.textContent = this.pacientesFiltroTipo === 'nino'
                 ?`${ninos} paciente(s) nino/a`
                : `${adultos} paciente(s) adulto`;
        }
    },
    cambiarFiltroPacientes: function (tipo) {
        this.pacientesFiltroTipo = tipo === 'nino' ?'nino' : 'adulto';
        this.renderizarTablaPacientes(this.pacientes);
    },
    abrirNuevoPacienteDesdeListado: function () {
        if (this.pacientesFiltroTipo === 'nino') {
            this.abrirEvaluaciónNino();
            return;
        }
        this.abrirEvaluaciónAdulto('paciente-detalle');
    },
    renderizarTablaPacientes: function (datos) {
        const tbody = document.getElementById('tabla-pacientes-body');
        const msjVacio = document.getElementById('msj-sin-pacientes');
        const tablaContainer = document.querySelector('.table-container table');
        const textoBusqueda = this.normalizarTextoPaciente(document.getElementById('filtro-pacientes').value || '');

        tbody.innerHTML = '';
        this.pacientesAgrupados = this.agruparPacientes(datos || []);

        const gruposFiltrados = this.pacientesAgrupados.filter(grupo => {
            const coincideTipo = this.pacientesFiltroTipo === 'nino' ?grupo.tipo === 'nino' : grupo.tipo !== 'nino';
            if (!coincideTipo) return false;
            if (!textoBusqueda) return true;
            return [
                grupo.nombre,
                grupo.email,
                grupo.diagnostico,
                grupo.ultimo.investigador,
                grupo.ultimo.derivacion
            ].some(valor => this.normalizarTextoPaciente(valor).includes(textoBusqueda));
        }).sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' }));
        this.actualizarTabsPacientes(this.pacientesAgrupados);

        if (!gruposFiltrados.length) {
            msjVacio.classList.remove('hidden');
            tablaContainer.classList.add('hidden');
            const etiquetaTipo = this.pacientesFiltroTipo === 'nino' ?'niños/as' : 'adultos';
            msjVacio.querySelector('p').textContent = textoBusqueda
                 ?`No hay pacientes ${etiquetaTipo} que coincidan con la búsqueda.`
                : `No hay pacientes ${etiquetaTipo} registrados aun.`;
            return;
        }

        msjVacio.classList.add('hidden');
        tablaContainer.classList.remove('hidden');
        gruposFiltrados.forEach(grupo => {
            const claveCodificada = encodeURIComponent(grupo.clave);
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 transition-colors";
            tr.innerHTML = `
                <td class="font-bold text-gray-800">${grupo.nombre}</td>
                <td class="text-gray-600">${grupo.tipo === 'nino' ?'Niño/a' : 'Adulto'}</td>
                <td class="text-gray-600">${grupo.diagnostico || '-'}</td>
                <td class="font-medium text-gray-600">${this.formatearFechaPaciente(grupo.fechaUltimaEvaluación)}</td>
                <td class="text-gray-600">${grupo.cantidadEvaluaciónes}</td>
                <td class="text-center">
                    <div class="flex flex-wrap items-center justify-center gap-2">
                        <button onclick="app.abrirFichaPacientePorClave('${claveCodificada}')" class="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Ver detalle</button>
                        <button onclick="app.editarPacienteDesdeListado('${claveCodificada}')" class="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Editar</button>
                        <button onclick="app.iniciarNuevaEvaluaciónPaciente('${claveCodificada}')" class="bg-action/10 text-action hover:bg-action/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Nueva evaluación</button>
                        <button onclick="app.verEvaluaciónesPacienteDesdeListado('${claveCodificada}')" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Ver evaluaciones</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
    },
    configurarBuscador: function () {
        document.getElementById('filtro-pacientes').addEventListener('input', (e) => {
            this.renderizarTablaPacientes(this.pacientes);
        });
    },
    volverAListadoPacientes: function () {
        if (!this.puedeAbandonarVistaActual('pacientes')) return;
        this.pacienteDetalleActual = null;
        this.pacienteDetalleModoEdicion = false;
        this.resetearEdicionPacienteComoModificada();
        this.cambiarVista('pacientes');
        this.renderizarTablaPacientes(this.pacientes);
    },
    abrirFichaPacientePorClave: function (claveCodificada) {
        const clave = decodeURIComponent(claveCodificada || '');
        if (!this.obtenerGrupoPacientePorClave(clave)) {
            this.mostrarErrorAccion(
                'No encontramos este paciente. Puede haber sido eliminado o no estar disponible.',
                'Volve al listado de pacientes y selecciona otro registro.'
            );
            this.volverAListadoPacientes();
            return;
        }
        this.pacienteDetalleActual = { clave };
        this.pacienteDetalleModoEdicion = false;
        this.renderizarFichaPacienteDetalle();
        this.cambiarVista('paciente-detalle');
    },
    editarPacienteDesdeListado: function (claveCodificada) {
        const clave = decodeURIComponent(claveCodificada || '');
        if (!this.obtenerGrupoPacientePorClave(clave)) {
            this.mostrarErrorAccion(
                'No encontramos este paciente. Puede haber sido eliminado o no estar disponible.',
                'Volve al listado de pacientes y selecciona otro registro.'
            );
            this.volverAListadoPacientes();
            return;
        }
        this.pacienteDetalleActual = { clave };
        this.pacienteDetalleModoEdicion = true;
        this.renderizarFichaPacienteDetalle();
        this.cambiarVista('paciente-detalle');
    },
    verEvaluaciónesPacienteDesdeListado: function (claveCodificada) {
        this.abrirFichaPacientePorClave(claveCodificada);
        requestAnimationFrame(() => {
            document.getElementById('detalle-paciente-evaluaciones-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    },
    iniciarNuevaEvaluaciónPaciente: function (claveCodificada) {
        const clave = decodeURIComponent(claveCodificada || '');
        const grupo = this.obtenerGrupoPacientePorClave(clave);
        if (!grupo) return;

        if (grupo.tipo === 'nino') {
            const index = grupo.ultimo._index;
            if (index == null) {
                this.abrirEvaluaciónNino();
                return;
            }
            this.bnpmPacienteSeleccionadoA = String(index);
            this.bnpmPacienteSeleccionadoB = String(index);
            this.abrirEvaluaciónNino();
            return;
        }

        this.prefillEvaluaciónAdultoPendiente = {
            nombre: grupo.ultimo.nombre || '',
            email: grupo.ultimo.email || '',
            investigador: grupo.ultimo.investigador || '',
            medicacion: grupo.ultimo.medicacion || '',
            psicopatologia: grupo.ultimo.psicopatologia || '',
            diagnostico: grupo.ultimo.diagnostico || '',
            dominancia: grupo.ultimo.dominancia || '',
            manoInicio: grupo.ultimo.manoInicio || 'Derecha',
            medidasManos: grupo.ultimo.medidasManos || {}
        };
        this.abrirEvaluaciónAdulto();
    },
    aplicarPrefillEvaluaciónAdultoPendiente: function () {
        const prefill = this.prefillEvaluaciónAdultoPendiente;
        if (!prefill) return;

        const asignar = (id, valor) => {
            const input = document.getElementById(id);
            if (input) input.value = valor || '';
        };

        protocolo.reiniciar();
        asignar('dat-nombre', prefill.nombre);
        asignar('dat-fecha', this.obtenerFechaActualLocalISO());
        asignar('dat-email', prefill.email);
        asignar('dat-medicacion', prefill.medicacion);
        asignar('dat-psicopatologia', prefill.psicopatologia);
        asignar('dat-diagnostico', prefill.diagnostico);
        asignar('dat-fecha-nacimiento', prefill.fecha_nacimiento);
        asignar('dat-edad', prefill.edad);
        asignar('dat-formacion-musical-anios', prefill.formacion_musical_anios);
        asignar('dat-tipo-formacion-musical', prefill.tipo_formacion_musical);
        asignar('dat-modalidad-formacion-musical', prefill.modalidad_formacion_musical);
        asignar('dat-dominancia', prefill.dominancia);
        asignar('dat-mano-inicio', prefill.manoInicio || 'Derecha');
        asignar('dat-mano-md-mayor', prefill.medidasManos.md_mayor || '');
        asignar('dat-mano-md-indice', prefill.medidasManos.md_indice || '');
        asignar('dat-mano-mi-mayor', prefill.medidasManos.mi_mayor || '');
        asignar('dat-mano-mi-indice', prefill.medidasManos.mi_indice || '');
        this.prefillEvaluaciónAdultoPendiente = null;
        this.resetearFormularioAdultoModificado();
    },
    construirItemFichaPaciente: function (label, value) {
        return `
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">${label}</div>
                <div class="mt-1 text-sm font-semibold text-slate-800 break-words">${value || 'No disponible'}</div>
            </div>
        `;
    },
    obtenerEstadoEvaluaciónRegistro: function (registro) {
        if (this.esPacienteNino(registro)) {
            if (registro.bnpm.moduloB) return 'Módulo B guardado';
            if (registro.bnpm.moduloA) return 'Módulo A guardado';
            return 'Registro inicial';
        }

        const evaluaciones = Array.isArray(registro.evaluaciones_detalladas) ?registro.evaluaciones_detalladas : [];
        if (!evaluaciones.length) return 'Sin pistas';
        const conAnalisis = evaluaciones.some(ev => this.obtenerResultadoAnalisisPista(registro._index, ev.nro_pista));
        return conAnalisis ?'Con resultados' : 'Evaluación registrada';
    },
    normalizarUrlConsentimiento: function (valor, indexPaciente = null) {
        if (!valor) return '';
        const valorNormalizado = String(valor).trim();
        if (valorNormalizado && !valorNormalizado.startsWith('/') && !/^https:\/\//i.test(valorNormalizado) && indexPaciente != null) {
            return `${this.obtenerOrigenBackend()}/consentimientos/paciente_${indexPaciente}/${encodeURIComponent(valorNormalizado)}`;
        }
        try {
            const url = new URL(valorNormalizado, this.obtenerOrigenBackend());
            return url.href;
        } catch (error) {
            if (valorNormalizado.startsWith('/')) {
                return `${this.obtenerOrigenBackend()}${valorNormalizado}`;
            }
            return valorNormalizado;
        }
    },
    tieneConsentimientoFirmado: function (registro) {
        return Boolean(registro && registro.consentFileUrl);
    },
    mostrarBloqueoConsentimiento: function () {
        this.mostrarModalAvisoAccion({
            tipo: 'warning',
            titulo: 'Falta el consentimiento informado',
            resumen: 'Para analizar los videos, primero debés cargar el consentimiento informado firmado.',
            ayuda: 'Cargá el consentimiento correspondiente a esta evaluación y luego volvé a intentar.'
        });
    },
    mostrarBloqueoResultados: function () {
        this.mostrarModalAvisoAccion({
            tipo: 'info',
            titulo: 'Todavía no hay resultados disponibles',
            resumen: 'Esta evaluación aún no tiene resultados de análisis disponibles.',
            ayuda: 'Cuando el análisis esté completo, vas a poder abrir observaciones y descargar el PDF.'
        });
    },
    subirConsentimientoFirmado: async function (indexPaciente, inputFile, reemplazarExistente = false) {
        const file = inputFile.files[0];
        if (!file) return;
        if (reemplazarExistente && !confirm('Ya existe un consentimiento firmado cargado. ¿Querés reemplazarlo?')) {
            inputFile.value = '';
            return;
        }

        const errorArchivo = this.validarArchivoConsentimiento(file);
        if (errorArchivo) {
            this.mostrarModalAvisoAccion({
                tipo: 'warning',
                titulo: 'No se pudo cargar el consentimiento',
                resumen: errorArchivo,
                ayuda: 'Verificá el archivo y volvé a seleccionarlo.'
            });
            inputFile.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('consentimiento', file);
        const loadingKey = `consent-upload-${indexPaciente}`;
        const label = inputFile.closest('label');
        this.setAccionCargando(loadingKey, true);
        if (label) {
            label.dataset.loadingOriginalHtml = label.innerHTML;
            label.classList.add('pointer-events-none', 'opacity-80');
            label.innerHTML = `${this.construirContenidoCargando('Subiendo archivo...')}<input type="file" class="hidden" disabled>`;
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/consentimiento`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                this.mostrarErrorAccion(
                    data.error || 'No se pudo cargar el consentimiento firmado. Intenta nuevamente.',
                    'Verificá que el archivo sea PDF, JPG o PNG y volve a seleccionarlo.'
                );
                inputFile.value = '';
                return;
            }

            await this.mostrarModalAvisoAccion({
                tipo: 'success',
                titulo: 'Consentimiento cargado correctamente',
                resumen: 'El consentimiento informado ya quedó asociado a esta evaluación.'
            });
            await this.verificarConexion();
            this.renderizarFichaPacienteDetalle();
        } catch (error) {
            this.mostrarErrorAccion(
                'La carga del consentimiento se interrumpio.',
                'Revisá la conexión, seleccioná nuevamente el archivo e intentá otra vez.'
            );
        } finally {
            this.setAccionCargando(loadingKey, false);
            inputFile.value = '';
            this.renderizarFichaPacienteDetalle();
        }
    },
    abrirDetalleOperativoEvaluación: function (indexPaciente) {
        const registro = this.pacientes[indexPaciente];
        if (!registro) return;
        if (!this.esPacienteNino(registro) && !this.tieneConsentimientoFirmado(registro)) {
            this.mostrarBloqueoConsentimiento();
            return;
        }
        if (this.esPacienteNino(registro)) {
            this.abrirPacienteNinoDesdeRegistro(indexPaciente);
            return;
        }
        this.verDetallePaciente(indexPaciente);
    },
    abrirPrimerResultadoEvaluación: async function (indexPaciente) {
        const registro = this.pacientes[indexPaciente];
        if (!registro || this.esPacienteNino(registro)) {
            this.abrirDetalleOperativoEvaluación(indexPaciente);
            return;
        }
        if (!this.tieneConsentimientoFirmado(registro)) {
            this.mostrarBloqueoConsentimiento();
            return;
        }
        this.abrirObservacionesEvaluacion(indexPaciente);
    },
    obtenerPayloadEdicionPaciente: function (grupo, formData) {
        const base = {
            nombre: formData.get('nombre') || '',
            email: formData.get('email') || '',
            investigador: formData.get('investigador') || '',
            diagnostico: formData.get('diagnostico') || '',
            psicopatologia: formData.get('psicopatologia') || '',
            medicacion: formData.get('medicacion') || '',
            dominancia: formData.get('dominancia') || '',
            manoInicio: formData.get('manoInicio') || '',
            consultation_reason: formData.get('consultation_reason') || '',
            evaluator_name: formData.get('evaluator_name') || '',
            matricula_profesional: formData.get('matricula_profesional') || '',
            disposicion_durante_evaluacion: formData.get('disposicion_durante_evaluacion') || '',
            nivel_cooperacion: formData.get('nivel_cooperacion') || '',
            atencion_orientada_tarea: formData.get('atencion_orientada_tarea') || '',
            comprension_consignas: formData.get('comprension_consignas') || '',
            indicadores_fatiga: formData.get('indicadores_fatiga') || '',
            regulacion_emocional: formData.get('regulacion_emocional') || '',
            persistencia_dificultades: formData.get('persistencia_dificultades') || '',
            integrated_observations: formData.get('integrated_observations') || '',
            medidasManos: {
                md_mayor: formData.get('md_mayor') || '',
                md_indice: formData.get('md_indice') || '',
                mi_mayor: formData.get('mi_mayor') || '',
                mi_indice: formData.get('mi_indice') || ''
            }
        };

        if (grupo.tipo === 'nino') {
            return {
                ...base,
                fecha_nacimiento: formData.get('fecha_nacimiento') || '',
                edad: formData.get('edad') || '',
                derivacion: formData.get('derivacion') || '',
                observaciones_iniciales: formData.get('observaciones_iniciales') || ''
            };
        }

        return base;
    },
    renderizarFormularioEdicionPaciente: function (grupo) {
        const formHost = document.getElementById('detalle-paciente-edicion-form');
        if (!formHost) return;
        this.resetearEdicionPacienteComoModificada();

        const registro = grupo.ultimo || {};
        const medidas = registro.medidasManos || {};
        const selectOpciones = (actual, opciones, placeholder = 'Seleccioná...') => `
            <option value="">${placeholder}</option>
            ${opciones.map(valor => `<option value="${valor}" ${actual === valor ?'selected' : ''}>${valor}</option>`).join('')}
        `;

        formHost.innerHTML = `
            <form id="detalle-paciente-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Nombre y apellido</span>
                    <input name="nombre" type="text" value="${this.escapeHtml(registro.nombre || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">E-mail</span>
                    <input name="email" type="email" value="${this.escapeHtml(registro.email || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Diagnóstico</span>
                    <input name="diagnostico" type="text" value="${this.escapeHtml(registro.diagnostico || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Music therapist researcher</span>
                    <input name="investigador" type="text" value="${this.escapeHtml(registro.investigador || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block md:col-span-2">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Psicopatología</span>
                    <input name="psicopatologia" type="text" value="${this.escapeHtml(registro.psicopatologia || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block md:col-span-2">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Medicación</span>
                    <textarea name="medicacion" rows="2" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary resize-none">${this.escapeHtml(registro.medicacion || '')}</textarea>
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Mano hábil</span>
                    <select name="dominancia" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                        <option value="">Seleccione...</option>
                        ${['Diestro', 'Zurdo', 'Ambidiestro'].map(valor => `<option value="${valor}" ${registro.dominancia === valor ?'selected' : ''}>${valor}</option>`).join('')}
                    </select>
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Mano que inicia</span>
                    <select name="manoInicio" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                        <option value="">Seleccione...</option>
                        ${['Derecha', 'Izquierda'].map(valor => `<option value="${valor}" ${registro.manoInicio === valor ?'selected' : ''}>${valor}</option>`).join('')}
                    </select>
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Mano derecha Mayor</span>
                    <input name="md_mayor" type="text" value="${this.escapeHtml(medidas.md_mayor || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Mano derecha Indice</span>
                    <input name="md_indice" type="text" value="${this.escapeHtml(medidas.md_indice || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Mano izquierda Mayor</span>
                    <input name="mi_mayor" type="text" value="${this.escapeHtml(medidas.mi_mayor || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                <label class="block">
                    <span class="block text-sm font-semibold text-slate-700 mb-1">Mano izquierda Indice</span>
                    <input name="mi_indice" type="text" value="${this.escapeHtml(medidas.mi_indice || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                </label>
                ${grupo.tipo !== 'nino' ?`
                    <div class="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 class="text-base font-bold text-primary mb-3">Informe final</h4>
                        <p class="text-sm text-slate-600 mb-4">Estos campos se usan para completar “Observaciones generales” y los datos profesionales antes de generar el PDF.</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label class="block md:col-span-2">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Motivo de consulta a Musicoterapia</span>
                                <textarea name="consultation_reason" rows="2" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary resize-none">${this.escapeHtml(registro.consultation_reason || registro.motivo_consulta || '')}</textarea>
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Evaluador/a</span>
                                <input name="evaluator_name" type="text" value="${this.escapeHtml(registro.evaluator_name || registro.evaluador || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Matrícula profesional</span>
                                <input name="matricula_profesional" type="text" value="${this.escapeHtml(registro.matricula_profesional || registro.matricula || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Disposición durante la evaluación</span>
                                <select name="disposicion_durante_evaluacion" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.disposicion_durante_evaluacion, ['Óptima', 'Buena', 'Escasa'])}
                                </select>
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Nivel de cooperación</span>
                                <select name="nivel_cooperacion" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.nivel_cooperacion, ['Adecuado', 'Fluctuante', 'Limitado'])}
                                </select>
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Atención orientada a la tarea</span>
                                <select name="atencion_orientada_tarea" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.atencion_orientada_tarea, ['Estable', 'Moderada', 'Fluctuante', 'Inadecuada'])}
                                </select>
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Comprensión de consignas</span>
                                <select name="comprension_consignas" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.comprension_consignas, ['Adecuada', 'Moderada', 'Fluctuante', 'Inadecuada'])}
                                </select>
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Indicadores de fatiga</span>
                                <select name="indicadores_fatiga" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.indicadores_fatiga, ['Ausencia', 'Presencia leve', 'Presencia significativa'])}
                                </select>
                            </label>
                            <label class="block">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Regulación emocional durante la tarea</span>
                                <select name="regulacion_emocional" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.regulacion_emocional || registro.regulacion, ['Conservada', 'Fluctuante', 'Inestable'])}
                                </select>
                            </label>
                            <label class="block md:col-span-2">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Persistencia frente a dificultades</span>
                                <select name="persistencia_dificultades" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                                    ${selectOpciones(registro.persistencia_dificultades, ['Adecuada', 'Parcial', 'Reducida'])}
                                </select>
                            </label>
                            <label class="block md:col-span-2">
                                <span class="block text-sm font-semibold text-slate-700 mb-1">Aspectos relevantes observados durante la ejecución</span>
                                <textarea name="integrated_observations" rows="4" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary resize-none">${this.escapeHtml(registro.integrated_observations || registro.observaciones_iniciales || '')}</textarea>
                            </label>
                        </div>
                    </div>
                ` : ''}
                ${grupo.tipo === 'nino' ?`
                    <label class="block">
                        <span class="block text-sm font-semibold text-slate-700 mb-1">Fecha de nacimiento</span>
                        <input name="fecha_nacimiento" type="date" value="${this.escapeHtml(registro.fecha_nacimiento || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                    </label>
                    <label class="block">
                        <span class="block text-sm font-semibold text-slate-700 mb-1">Edad</span>
                        <input name="edad" type="text" value="${this.escapeHtml(registro.edad || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                    </label>
                    <label class="block md:col-span-2">
                        <span class="block text-sm font-semibold text-slate-700 mb-1">Derivacion</span>
                        <input name="derivacion" type="text" value="${this.escapeHtml(registro.derivacion || '')}" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary">
                    </label>
                    <label class="block md:col-span-2">
                        <span class="block text-sm font-semibold text-slate-700 mb-1">Observaciónes iniciales</span>
                        <textarea name="observaciones_iniciales" rows="3" class="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-primary resize-none">${this.escapeHtml(registro.observaciones_iniciales || '')}</textarea>
                    </label>
                ` : ''}
            </form>
        `;
        document.getElementById('detalle-paciente-form').addEventListener('input', () => this.marcarEdicionPacienteComoModificada());
        document.getElementById('detalle-paciente-form').addEventListener('change', () => this.marcarEdicionPacienteComoModificada());
    },
    cancelarEdicionPaciente: function () {
        if (this.pacienteDetalleEdicionTieneCambios && !this.confirmarSalidaSinGuardar('Tenés cambios sin guardar en la edición del paciente. ¿Querés salir sin guardar?')) {
            return;
        }
        this.resetearEdicionPacienteComoModificada();
        this.pacienteDetalleModoEdicion = false;
        this.renderizarFichaPacienteDetalle();
    },
    mostrarAlertaDetallePaciente: function (mensaje, tipo = 'success') {
        const alerta = document.getElementById('detalle-paciente-alerta');
        if (!alerta) return;
        alerta.textContent = mensaje;
        alerta.className = tipo === 'error'
             ?'rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
            : 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800';
        alerta.classList.remove('hidden');
    },
    guardarEdicionPacienteDetalle: async function () {
        const clave = this.pacienteDetalleActual.clave;
        const grupo = this.obtenerGrupoPacientePorClave(clave);
        const form = document.getElementById('detalle-paciente-form');
        if (!grupo || !form) return;

        const payload = this.obtenerPayloadEdicionPaciente(grupo, new FormData(form));
        const actualizaciones = await Promise.all(
            grupo.registros.map(registro =>
                fetch(`${CONFIG.API_URL}/${registro._index}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(() => null)
            )
        );

        if (actualizaciones.some(resp => !resp || !resp.ok)) {
            this.mostrarAlertaDetallePaciente('No se pudo guardar el paciente. Revisa los datos e intenta nuevamente.', 'error');
            return;
        }

        await this.verificarConexion();
        this.pacienteDetalleModoEdicion = false;
        this.pacienteDetalleActual = { clave: this.obtenerClavePacienteAgrupado({ ...grupo.ultimo, ...payload }) };
        this.renderizarFichaPacienteDetalle();
        this.mostrarAlertaDetallePaciente('La información del paciente se actualizó correctamente.');
    },
    renderizarFichaPacienteDetalle: async function () {
        const clave = this.pacienteDetalleActual.clave;
        const grupo = this.obtenerGrupoPacientePorClave(clave);
        if (!grupo) {
            this.mostrarErrorAccion(
                'No encontramos este paciente. Puede haber sido eliminado o no estar disponible.',
                'Volve al listado de pacientes para continuar.'
            );
            this.volverAListadoPacientes();
            return;
        }

        const registro = grupo.ultimo || {};
        const titulo = document.getElementById('detalle-paciente-titulo');
        const subtitulo = document.getElementById('detalle-paciente-subtitulo');
        const accionesTop = document.getElementById('detalle-paciente-acciones-top');
        const general = document.getElementById('detalle-paciente-general');
        const clinica = document.getElementById('detalle-paciente-clinica');
        const mediciones = document.getElementById('detalle-paciente-mediciones');
        const body = document.getElementById('detalle-paciente-evaluaciones-body');
        const vacio = document.getElementById('detalle-paciente-evaluaciones-vacio');
        const resumen = document.getElementById('detalle-paciente-evaluaciones-resumen');
        const edicion = document.getElementById('detalle-paciente-edicion');
        const alerta = document.getElementById('detalle-paciente-alerta');

        if (alerta && !alerta.dataset.keepVisible) {
            alerta.classList.add('hidden');
        }

        titulo.textContent = grupo.nombre;
        subtitulo.textContent = `${grupo.tipo === 'nino' ? 'Paciente niño/a' : 'Paciente adulto'} · Última evaluación ${this.formatearFechaPaciente(grupo.fechaUltimaEvaluación)}`;

        accionesTop.innerHTML = `
            <button type="button" onclick="app.iniciarNuevaEvaluaciónPaciente('${encodeURIComponent(grupo.clave)}')"
                class="bg-action text-white px-4 py-2 rounded-lg font-semibold hover:bg-action/90 transition">${grupo.tipo === 'nino' ? 'Abrir módulos' : 'Nueva evaluación'}</button>
            <button type="button" onclick="app.pacienteDetalleModoEdicion = true; app.renderizarFichaPacienteDetalle();"
                class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 transition">Editar información</button>
        `;

        general.innerHTML = [
            ['Nombre y apellido', grupo.nombre],
            ['E-mail', registro.email || 'No disponible'],
            ['Tipo de paciente', grupo.tipo === 'nino' ? 'Niño/a' : 'Adulto'],
            ['Fecha de última evaluación', this.formatearFechaPaciente(grupo.fechaUltimaEvaluación)]
        ].map(([label, value]) => this.construirItemFichaPaciente(label, this.escapeHtml(String(value || '')))).join('');

        const itemsClinicos = grupo.tipo === 'nino'
            ?[
                ['Diagnóstico', registro.diagnostico || 'No disponible'],
                ['Derivación', registro.derivacion || 'No disponible'],
                ['Observaciónes iniciales', registro.observaciones_iniciales || 'No disponible'],
                ['Fecha de nacimiento', registro.fecha_nacimiento || 'No disponible'],
                ['Edad', registro.edad || 'No disponible'],
                ['Investigador', registro.investigador || 'No disponible']
            ]
            : [
                ['Diagnóstico', registro.diagnostico || 'No disponible'],
                ['Psicopatología', registro.psicopatologia || 'No disponible'],
                ['Medicación', registro.medicacion || 'No disponible'],
                ['Music therapist researcher', registro.investigador || 'No disponible'],
                ['Mano hábil', registro.dominancia || 'No disponible'],
                ['Mano que inicia la prueba', registro.manoInicio || 'No disponible']
            ];
        clinica.innerHTML = itemsClinicos
            .map(([label, value]) => this.construirItemFichaPaciente(label, this.escapeHtml(String(value || ''))))
            .join('');

        const medidas = registro.medidasManos || {};
        mediciones.innerHTML = `
            <div class="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <h4 class="font-bold text-slate-800 mb-3">Mano derecha</h4>
                <div class="grid grid-cols-2 gap-3">
                    ${this.construirItemFichaPaciente('Mayor', this.escapeHtml(String(medidas.md_mayor || 'No disponible')))}
                    ${this.construirItemFichaPaciente('Índice', this.escapeHtml(String(medidas.md_indice || 'No disponible')))}
                </div>
            </div>
            <div class="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <h4 class="font-bold text-slate-800 mb-3">Mano izquierda</h4>
                <div class="grid grid-cols-2 gap-3">
                    ${this.construirItemFichaPaciente('Mayor', this.escapeHtml(String(medidas.mi_mayor || 'No disponible')))}
                    ${this.construirItemFichaPaciente('Índice', this.escapeHtml(String(medidas.mi_indice || 'No disponible')))}
                </div>
            </div>
        `;

        resumen.textContent = `${grupo.cantidadEvaluaciónes} evaluación(es) registradas`;
        body.innerHTML = '';

        if (!grupo.registros.length) {
            vacio.classList.remove('hidden');
        } else {
            vacio.classList.add('hidden');
            grupo.registros.forEach(item => {
                const estado = this.obtenerEstadoEvaluaciónRegistro(item);
                const tieneConsentimiento = this.tieneConsentimientoFirmado(item);
                const tieneResultados = Array.isArray(item.evaluaciones_detalladas) && item.evaluaciones_detalladas.some(ev => this.obtenerResultadoAnalisisPista(item._index, ev.nro_pista));
                const botones = this.esPacienteNino(item)
                    ?`
                        <div class="flex flex-wrap items-center justify-center gap-2">
                            <button onclick="app.abrirDetalleOperativoEvaluación(${item._index})" class="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Abrir módulos</button>
                            <button onclick="app.descargarPdfsPacienteNino(${item._index})" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition">PDF</button>
                        </div>
                    `
                    : `
                        <div class="flex flex-wrap items-center justify-center gap-2">
                            ${tieneConsentimiento
                                 ?`<a href="${this.escapeHtml(this.normalizarUrlConsentimiento(item.consentFileUrl))}" target="_blank" rel="noopener noreferrer" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Ver consentimiento</a><label title="Formatos permitidos: PDF, JPG o PNG" class="cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-2">Reemplazar consentimiento<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/png,image/jpeg" class="hidden" onchange="app.subirConsentimientoFirmado(${item._index}, this, true)"></label>`
                                : `<label title="Formatos permitidos: PDF, JPG o PNG" class="cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-2">Cargar consentimiento firmado<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/png,image/jpeg" class="hidden" onchange="app.subirConsentimientoFirmado(${item._index}, this)"></label>`
                            }
                            <button onclick="${tieneConsentimiento ?`app.abrirDetalleOperativoEvaluación(${item._index})` : `app.mostrarBloqueoConsentimiento()`}" class="${tieneConsentimiento ?'bg-action/10 text-action hover:bg-action/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} px-3 py-1.5 rounded-lg text-xs font-semibold transition">Analizar videos</button>
                            <button onclick="${tieneConsentimiento ?(tieneResultados ?`app.abrirPrimerResultadoEvaluación(${item._index})` : `app.mostrarBloqueoResultados()`) : `app.mostrarBloqueoConsentimiento()`}" class="${tieneConsentimiento && tieneResultados ?'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} px-3 py-1.5 rounded-lg text-xs font-semibold transition" ${tieneConsentimiento && tieneResultados ?'' : 'disabled'}>Observaciones</button>
                            <button onclick="${tieneConsentimiento ?(tieneResultados ?`app.generarPDF(app.pacientes[${item._index}])` : `app.mostrarBloqueoResultados()`) : `app.mostrarBloqueoConsentimiento()`}" class="${tieneConsentimiento && tieneResultados ?'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'} px-3 py-1.5 rounded-lg text-xs font-semibold transition" ${tieneConsentimiento && tieneResultados ?'' : 'disabled'}>PDF</button>
                        </div>
                    `;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="font-medium text-gray-600">${this.formatearFechaPaciente(item.fecha)}</td>
                    <td class="font-semibold text-gray-800">${this.esPacienteNino(item) ?'Evaluación Nino/a' : 'Protocolo de Evaluación de Sincronización Sensorio-Motora (PESSM)'}</td>
                    <td class="text-gray-600">${estado}</td>
                    <td class="text-gray-600">${this.escapeHtml(item.diagnostico || '-')}</td>
                    <td class="text-center">${botones}</td>
                `;
                body.appendChild(tr);
            });
        }

        if (this.pacienteDetalleModoEdicion) {
            edicion.classList.remove('hidden');
            this.renderizarFormularioEdicionPaciente(grupo);
        } else {
            edicion.classList.add('hidden');
        }

        lucide.createIcons();

        const adultosConPistas = grupo.registros.filter(item => !this.esPacienteNino(item) && Array.isArray(item.evaluaciones_detalladas) && item.evaluaciones_detalladas.length);
        const pistasSinCacheAntes = adultosConPistas.flatMap(item =>
            item.evaluaciones_detalladas
                .filter(ev => !this.obtenerResultadoAnalisisPista(item._index, ev.nro_pista))
                .map(ev => ({ indexPaciente: item._index, pista: ev.nro_pista }))
        );
        await Promise.all(
            adultosConPistas.map(item => this.precargarAnalisisDisponiblesPaciente(item._index, item.evaluaciones_detalladas))
        );
        if (pistasSinCacheAntes.some(({ indexPaciente, pista }) => this.obtenerResultadoAnalisisPista(indexPaciente, pista))) {
            this.renderizarFichaPacienteDetalle();
            return;
        }

        if (body.children.length) {
            [...grupo.registros].forEach((item, idx) => {
                if (this.esPacienteNino(item)) return;
                const fila = body.children[idx];
                const estadoCelda = fila.children[2];
                if (estadoCelda) {
                    estadoCelda.textContent = this.obtenerEstadoEvaluaciónRegistro(item);
                }
            });
        }
    },

    generarPDF: function (paciente) {
        if (!window.jspdf) {
            alert("Error: Las librerías de PDF no estan cargadas. Revisa tu index.html");
            return;
        }
        if (this.esPacienteAdulto(paciente) && !this.tieneConsentimientoFirmado(paciente)) {
            this.mostrarBloqueoConsentimiento();
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageW = doc.internal.pageSize.getWidth();
        const fechaFormat = paciente.fecha ?this.formatearFechaPaciente(paciente.fecha) : 'N/A';
        const PRIMARY = [74, 92, 146]; // #4a5c92
        const ACTION = [59, 141, 119]; // #3b8d77
        const DARK = [30, 41, 59]; // slate-800
        const LIGHT_BG = [248, 250, 252]; // slate-50
        const MID_GRAY = [100, 116, 139]; // slate-500

        // ----- HEADER -----
        doc.setFillColor(...PRIMARY);
        doc.rect(0, 0, pageW, 38, 'F');
        doc.setFillColor(...ACTION);
        doc.rect(0, 38, pageW, 3, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Music Therapy Tools", 14, 17);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Plataforma de herramientas para musicoterapeutas", 14, 25);
        doc.setFontSize(9);
        doc.text(`Reporte generado: ${new Date().toLocaleDateString('es-AR')}`, 14, 33);

        doc.setFontSize(10);
        doc.text(`Fecha de evaluación: ${fechaFormat}`, pageW - 14, 25, { align: 'right' });
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(paciente.nombre || 'Paciente', pageW - 14, 17, { align: 'right' });

        let y = 50;
        doc.setTextColor(...DARK);

        // ----- SECCIÓN: DATOS DEL PACIENTE -----
        doc.setFillColor(...LIGHT_BG);
        doc.roundedRect(14, y, pageW - 28, 52, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, pageW - 28, 52, 3, 3, 'S');

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...PRIMARY);
        doc.text("Datos del Paciente", 20, y + 9);
        doc.setDrawColor(...ACTION);
        doc.setLineWidth(0.5);
        doc.line(20, y + 12, 80, y + 12);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MID_GRAY);

        const datosCol1 = [
            ['Investigador', paciente.investigador || 'N/A'],
            ['E-mail', paciente.email || 'N/A'],
            ['Diagnóstico', paciente.diagnostico || 'N/A'],
        ];
        const datosCol2 = [
            ['Psicopatología', paciente.psicopatologia || 'Ninguna'],
            ['Medicación', paciente.medicacion || 'Ninguna'],
            ['Mano hábil / Mano inicio', `${paciente.dominancia || 'N/A'} ?? ${paciente.manoInicio || 'N/A'}`],
        ];

        datosCol1.forEach((d, i) => {
            const posY = y + 20 + i * 11;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...DARK);
            doc.text(`${d[0]}:`, 22, posY);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...MID_GRAY);
            doc.text(d[1], 58, posY);
        });

        datosCol2.forEach((d, i) => {
            const posY = y + 20 + i * 11;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...DARK);
            doc.text(`${d[0]}:`, pageW / 2 + 5, posY);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...MID_GRAY);
            doc.text(d[1], pageW / 2 + 50, posY);
        });

        y += 60;

        // ----- SECCIÓN: MEDIDAS DE MANOS -----
        const med = paciente.medidasManos || {};
        const hayMedidas = med.md_mayor || med.md_indice || med.mi_mayor || med.mi_indice;

        if (hayMedidas) {
            y += 4;
            doc.autoTable({
                startY: y,
                head: [['', 'Mayor - muñeca (cm)', 'Índice (cm)']],
                body: [
                    ['Mano Derecha (MD)', med.md_mayor || '?', med.md_indice || '?'],
                    ['Mano Izquierda (MI)', med.mi_mayor || '?', med.mi_indice || '?'],
                ],
                theme: 'grid',
                headStyles: { fillColor: PRIMARY, fontSize: 8, fontStyle: 'bold', halign: 'center' },
                bodyStyles: { fontSize: 8, halign: 'center' },
                columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
                styles: { cellPadding: 3 },
                margin: { left: 14, right: 14 },
                tableWidth: pageW - 28,
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        // ----- SECCIÓN: RESULTADOS POR PISTA -----
        if (paciente.evaluaciones_detalladas && paciente.evaluaciones_detalladas.length > 0) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...PRIMARY);
            doc.text("Resultados por Pista · Protocolo de 26 Audios", 14, y + 4);
            doc.setDrawColor(...ACTION);
            doc.setLineWidth(0.5);
            doc.line(14, y + 7, 120, y + 7);

            const filasTabla = paciente.evaluaciones_detalladas.map(ev => [
                ev.nro_pista,
                ev.mano_evaluada,
                ev.archivo.split('/').pop(),
                ev.rhythm_identification,
                ev.tempo_variations,
                ev.rhythmic_accuracy
            ]);

            doc.autoTable({
                startY: y + 11,
                head: [['N°', 'Mano', 'Archivo', 'Ident. Ritmo', 'Var. Tempo', 'Precisión Rítmica']],
                body: filasTabla,
                theme: 'striped',
                headStyles: {
                    fillColor: PRIMARY,
                    textColor: [255, 255, 255],
                    fontSize: 7.5,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 3,
                },
                bodyStyles: {
                    fontSize: 7,
                    cellPadding: 2.5,
                    textColor: DARK,
                },
                alternateRowStyles: { fillColor: [241, 245, 249] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10 },
                    1: { halign: 'center', cellWidth: 22 },
                    2: { cellWidth: 48 },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                },
                styles: { overflow: 'linebreak' },
                margin: { left: 14, right: 14 },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index >= 3) {
                        const val = data.cell.raw;
                        if (val === 'Consistente') data.cell.styles.textColor = ACTION;
                        else if (val === 'Inconsistente') data.cell.styles.textColor = [234, 88, 12];
                        else if (val === 'Nunca') data.cell.styles.textColor = [220, 38, 38];
                        else if (val === 'Rara vez') data.cell.styles.textColor = [202, 138, 4];
                    }
                }
            });
        } else {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(...MID_GRAY);
            doc.text("Este paciente no cuenta con evaluaciones detalladas registradas.", 14, y + 4);
        }

        // ----- FOOTER -----
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const pageH = doc.internal.pageSize.getHeight();
            doc.setDrawColor(...PRIMARY);
            doc.setLineWidth(0.3);
            doc.line(14, pageH - 14, pageW - 14, pageH - 14);
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...MID_GRAY);
            doc.text("Music Therapy Tools · Plataforma de herramientas para musicoterapeutas", 14, pageH - 9);
            doc.text(`Página ${i} de ${totalPages}`, pageW - 14, pageH - 9, { align: 'right' });
        }

        const nombreArchivo = `Reporte_${(paciente.nombre || 'Paciente').replace(/\s+/g, '_')}_${fechaFormat.replace(/\//g, '-')}.pdf`;
        doc.save(nombreArchivo);
    },

    generarPDFLegacy: null,

    // ==========================================
    // FUNCIONES DE MODAL Y VIDEOS
    // ==========================================
    _modalPacienteIndex: null,

    verDetallePaciente: async function (index) {
        const p = this.pacientes[index];
        if (!p) return;
        this._modalPacienteIndex = index;

        // Rellenar header
        document.getElementById('modal-titulo').textContent = p.nombre || 'Paciente';
        document.getElementById('modal-subtitulo').textContent =
            `${p.diagnostico || ''} . ${p.dominancia || ''} . ${p.fecha ?this.formatearFechaPaciente(p.fecha) : ''}`;

        // Info rápida
        const infoDiv = document.getElementById('modal-info');
        infoDiv.innerHTML = `
            <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Investigador</span><span class="font-semibold text-gray-800">${p.investigador || 'N/A'}</span></div>
            <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Mano hábil</span><span class="font-semibold text-gray-800">${p.dominancia || 'N/A'}</span></div>
            <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Mano Inicio</span><span class="font-semibold text-gray-800">${p.manoInicio || 'N/A'}</span></div>
            <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Medicación</span><span class="font-semibold text-gray-800">${p.medicacion || 'Ninguna'}</span></div>
        `;

        // Construir tabla; se llenará después con el estado de videos
        const tbody = document.getElementById('modal-tabla-body');
        tbody.innerHTML = '';

        const evals = p.evaluaciones_detalladas || [];
        evals.forEach((ev, i) => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 transition-colors";
            tr.innerHTML = `
                <td class="text-center font-bold text-primary">${ev.nro_pista}</td>
                <td class="text-center"><span class="px-2 py-0.5 rounded text-xs font-bold ${ev.mano_evaluada === 'Derecha' ?'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">${ev.mano_evaluada}</span></td>
                <td class="text-xs font-mono text-gray-600">${ev.archivo.split('/').pop()}</td>
                <td class="text-center text-sm">${ev.rhythm_identification}</td>
                <td class="text-center text-sm">${ev.tempo_variations}</td>
                <td class="text-center text-sm">${ev.rhythmic_accuracy}</td>
                <td class="text-center video-cell" id="video-cell-${ev.nro_pista}">
                    <span class="text-gray-400 text-xs">Cargando...</span>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Mostrar modal
        document.getElementById('modal-detalle').classList.remove('hidden');
        lucide.createIcons();

        // Cargar estado de videos
        await this.cargarEstadoVideos(index, evals);
    },

    cargarEstadoVideos: async function (index, evals) {
        try {
            const resp = await fetch(`${CONFIG.API_URL}/${index}/videos`);
            const data = await resp.json();
            const videos = data.videos || {};

            let countVideos = 0;

            evals.forEach(ev => {
                const cell = document.getElementById(`video-cell-${ev.nro_pista}`);
                if (!cell) return;
                const pista = ev.nro_pista;

                if (videos[pista]) {
                    countVideos++;
                    cell.innerHTML = `
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="app.verVideo('${videos[pista]}', ${pista})" class="bg-action/10 text-action hover:bg-action/20 p-1.5 rounded-lg transition" title="Ver video">
                                <i data-lucide="play-circle" class="w-4 h-4"></i>
                            </button>

                            <button onclick="app.analizarVideo(${index}, ${pista})" class="bg-purple-100 text-purple-600 hover:bg-purple-200 p-1.5 rounded-lg transition" title="Analizar con Python">
                                <i data-lucide="activity" class="w-4 h-4"></i>
                            </button>




                            <button onclick="app.eliminarVideo(${index}, ${pista})" class="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition" title="Eliminar video">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            <span class="text-green-600 text-[10px] font-bold ml-1">?</span>
                        </div>
                    `;
                } else {
                    cell.innerHTML = `
                        <label class="cursor-pointer inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition" title="Cargá el video correspondiente a esta prueba. Formatos de video permitidos por el sistema.">
                            <i data-lucide="upload" class="w-3.5 h-3.5"></i> Subir
                            <input type="file" accept="video/*" class="hidden" onchange="app.subirVideo(${index}, ${pista}, this)">
                        </label>
                    `;
                }
            });

            document.getElementById('modal-contador-videos').textContent = `${countVideos} de ${evals.length} videos`;
            lucide.createIcons();
        } catch (error) {
            console.error("Error cargando videos:", error);
        }
    },

    subirVideo: async function (indexPaciente, nroPista, inputFile, reemplazarExistente = false) {
        const file = inputFile.files[0];
        if (!file) return;
        if (reemplazarExistente && !confirm('Ya existe un video cargado para esta pista. ¿Querés reemplazarlo? Esta acción eliminará también el análisis previo asociado.')) {
            inputFile.value = '';
            return;
        }
        const errorArchivo = this.validarArchivoVideo(file);
        if (errorArchivo) {
            this.mostrarModalAvisoAccion({
                tipo: 'warning',
                titulo: 'No se pudo cargar este video',
                resumen: errorArchivo,
                ayuda: 'Elegí un archivo compatible y volvé a intentarlo en esta misma pista.'
            });
            inputFile.value = '';
            return;
        }

        const cell = document.getElementById(`video-cell-${nroPista}`);
        cell.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span class="text-xs text-gray-500">Subiendo...</span>
            </div>
        `;

        const formData = new FormData();
        formData.append('video', file);

        try {
            const resp = await fetch(`${CONFIG.API_URL}/${indexPaciente}/videos/${nroPista}`, {
                method: 'POST',
                body: formData
            });

            if (resp.ok) {
                this.invalidarAnalisisPersistido(indexPaciente, nroPista);
                const p = this.pacientes[indexPaciente];
                this.renderizarAnalisisDisponibles(indexPaciente, p.evaluaciones_detalladas || []);
                await this.cargarEstadoVideos(indexPaciente, p.evaluaciones_detalladas || []);
            } else {
                cell.innerHTML = '<span class="text-red-500 text-xs font-medium">No se pudo cargar. Reintenta.</span>';
                this.mostrarErrorAccion(
                    'No se pudo cargar este video.',
                    'Verificá que el archivo sea un video válido y volve a intentarlo en esta misma pista.'
                );
            }
        } catch (error) {
            console.error("Error:", error);
            cell.innerHTML = '<span class="text-red-500 text-xs font-medium">Carga interrumpida. Reintenta.</span>';
            this.mostrarErrorAccion(
                'La carga del video se interrumpio.',
                'Revisá la conexión y volvé a intentar desde esta misma fila.'
            );
        }
    },

    verVideo: function (rutaVideo, nroPista) {
        document.getElementById('modal-video-titulo').textContent = `Pista ${nroPista}`;
        const player = document.getElementById('modal-video-player');
        player.src = rutaVideo;
        document.getElementById('modal-video').classList.remove('hidden');
        player.play().catch(() => { });
    },

    eliminarVideo: async function (indexPaciente, nroPista) {
        if (!confirm(`¿Eliminar el video de la pista ${nroPista}`)) return;

        try {
            const resp = await fetch(`${CONFIG.API_URL}/${indexPaciente}/videos/${nroPista}`, {
                method: 'DELETE'
            });
            if (resp.ok) {
                const p = this.pacientes[indexPaciente];
                this.invalidarAnalisisPersistido(indexPaciente, nroPista);
                this.renderizarAnalisisDisponibles(indexPaciente, p.evaluaciones_detalladas || []);
                await this.cargarEstadoVideos(indexPaciente, p.evaluaciones_detalladas || []);
            } else {
                this.mostrarErrorAccion(
                    'No se pudo eliminar el video.',
                    'Intenta nuevamente. Si el problema continua, recargá la vista del paciente.'
                );
            }
        } catch (error) {
            this.mostrarErrorAccion(
                'No se pudo eliminar el video por un problema de conexión.',
                'Revisa la conexion e intenta nuevamente.'
            );
        }
    },

    // ==========================================
    // NUEVA FUNCIÓN: LLAMADA A PYTHON (MOTOR DE TESIS)
    // ==========================================
    analizarVideo: async function(indexPaciente, nroPista) {
        if (this.obtenerResultadoAnalisisPista(indexPaciente, nroPista) && !confirm('Esta evaluación ya tiene resultados. ¿Querés volver a analizarla?')) {
            return;
        }
        alert(`Iniciando análisis de la pista ${nroPista} con Python. Esto demorará unos segundos...`);

        try {
            const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/analizar/${nroPista}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                console.log("✓ RESULTADO DEL ANÁLISIS DE PYTHON:", data);
                const metadata = data.metadata_extraida || {};
                const video = (data.analisis && data.analisis.video) || {};
                const resumen = [
                    `Archivo: ${data.archivo || 'Sin nombre'}`,
                    `Tipo: ${metadata.tipo_metronomo || 'No detectado'}`,
                    `Mano: ${metadata.mano || 'No detectada'}`,
                    `Sujeto: ${metadata.sujeto || 'No detectado'}`,
                    `Duración: ${video.duracion_segundos ??'No disponible'} s`,
                    `FPS: ${video.fps ??'No disponible'}`
                ].join('\n');

                await this.mostrarModalAvisoAccion({
                    tipo: 'success',
                    titulo: `Análisis completado para la pista ${nroPista}`,
                    resumen: 'El resultado quedó guardado internamente para el informe final.',
                    detalles: resumen.split('\n')
                });
                this.verResultadosAnalisis(data, nroPista);
            } else {
                const detalleTexto = this.formatearDetalleError(data);
                console.error("✖ Error del servidor:", data);
                console.error("✖ Detalle del error:", detalleTexto);
                this.mostrarErrorAccion(
                    data.error || data.message || 'No se pudo completar el análisis del video.',
                    detalleTexto
                );
            }
        } catch (error) {
            console.error("Error de conexión al analizar:", error);
            this.mostrarErrorAccion(
                'No se pudo conectar con el servidor para analizar el video.',
                'Revisá la conexión y volvé a intentarlo en unos segundos.'
            );
        }
    },
    // ==========================================

    cerrarModal: function () {
        document.getElementById('modal-detalle').classList.add('hidden');
        this._modalPacienteIndex = null;
    },

    cerrarVideoModal: function () {
        const player = document.getElementById('modal-video-player');
        player.pause();
        player.src = '';
        document.getElementById('modal-video').classList.add('hidden');
    },

    formatearDetalleError: function (data) {
        const detalle = data && data.detalle;
        if (!detalle) {
            return 'Sin detalle adicional.';
        }
        if (typeof detalle === 'string') {
            return detalle;
        }
        try {
            return JSON.stringify(detalle, null, 2);
        } catch (error) {
            return String(detalle);
        }
    },

    normalizarUrlGrafico: function (grafico, baseUrl = '') {
        if (!grafico) {
            return '';
        }

        const valor = String(grafico).replace(/\\/g, '/');

    if (/^https:\/\//i.test(valor)) {
        return valor;
    }

    if (valor.startsWith('/')) {
        return `${this.obtenerOrigenBackend()}${valor}`;
    }

    if (/^[A-Za-z]:\//.test(valor)) {
        const marca = '/analysis_outputs/';
        const indice = valor.toLowerCase().indexOf(marca);
        if (indice >= 0) {
            return `${this.obtenerOrigenBackend()}${valor.slice(indice)}`;
        }
    }

        if (baseUrl) {
            const baseNormalizada = String(baseUrl).replace(/\\/g, '/');
            const baseSinArchivo = baseNormalizada.replace(/\/analysis_results\.json(:\.*)$/i, '/');
            if (/^https:\/\//i.test(baseSinArchivo)) {
                return `${baseSinArchivo}${valor.replace(/^\/+/, '')}`;
            }
            if (baseSinArchivo.startsWith('/')) {
                return `${this.obtenerOrigenBackend()}${baseSinArchivo}${valor.replace(/^\/+/, '')}`;
            }
        }

        return valor;
    },

    verResultadosAnalisis: function (data, nroPista) {
        const metadata = data.metadata_extraida || {};
        const video = (data.analisis && data.analisis.video) || {};
        const graficos = Array.isArray(data.graficos) ?data.graficos : [];

    document.getElementById('modal-analisis-titulo').textContent = `Resultados del análisis - Pista ${nroPista}`;
        document.getElementById('modal-analisis-subtitulo').textContent =
            `${metadata.tipo_metronomo || 'Tipo no detectado'} · ${metadata.mano || 'Mano no detectada'} · Sujeto ${metadata.sujeto || 'N/D'}`;

        document.getElementById('modal-analisis-resumen').textContent = [
            `Archivo: ${data.archivo || 'Sin nombre'}`,
            `Tipo: ${metadata.tipo_metronomo || 'No detectado'}`,
            `Mano: ${metadata.mano || 'No detectada'}`,
            `Sujeto: ${metadata.sujeto || 'No detectado'}`,
            `Duración: ${video.duracion_segundos ??'No disponible'} s`,
            `FPS: ${video.fps ??'No disponible'}`,
            `Gráficos generados: ${graficos.length}`
        ].join('\n');

        const galeria = document.getElementById('modal-analisis-galeria');
        galeria.innerHTML = '';

        if (!graficos.length) {
            galeria.innerHTML = `
                <div class="col-span-full bg-white border rounded-2xl p-8 text-center text-gray-500">
                    No se generaron gráficos visibles para esta corrida.
                </div>
            `;
        } else {
            graficos.forEach((grafico, idx) => {
                const ext = grafico.split('.').pop().toLowerCase();
                const card = document.createElement('div');
                card.className = 'bg-white rounded-2xl border shadow-sm overflow-hidden';

                if (ext === 'html') {
                    card.innerHTML = `
                        <div class="px-4 py-3 border-b bg-gray-50 font-semibold text-sm text-gray-700">
                            Gráfico interactivo ${idx + 1}
                        </div>
                        <iframe src="${grafico}" class="w-full" style="height:420px;border:0;"></iframe>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="px-4 py-3 border-b bg-gray-50 font-semibold text-sm text-gray-700">
                            Gráfico ${idx + 1}
                        </div>
                        <img src="${grafico}" alt="Gráfico de análisis ${idx + 1}" class="w-full h-auto bg-white">
                    `;
                }

                galeria.appendChild(card);
            });
        }

        document.getElementById('modal-analisis').classList.remove('hidden');
        lucide.createIcons();
    },

    cerrarAnalisisModal: function () {
        document.getElementById('modal-analisis').classList.add('hidden');
    }
};

app.analisisPersistidos = {};
app.analisisEnCurso = {};
app.analisisActivo = null;
app.visorAnalisis = null;

app.obtenerIdentificadorPacienteAnalisis = function (indexPaciente) {
    const paciente = this.pacientes && Number.isInteger(Number(indexPaciente))
        ? this.pacientes[Number(indexPaciente)]
        : null;
    const patientId = paciente && paciente.id ? String(paciente.id).trim() : '';
    return patientId || `index_${indexPaciente}`;
};

app.crearClaveAnalisis = function (indexPaciente, nroPista) {
    return `paciente_${this.obtenerIdentificadorPacienteAnalisis(indexPaciente)}_pista_${nroPista}`;
};

app.estaAnalisisEnCurso = function (indexPaciente, nroPista) {
    return Boolean(this.analisisEnCurso[this.crearClaveAnalisis(indexPaciente, nroPista)]);
};

app.actualizarEstadoAnalisisEnCurso = function (indexPaciente, nroPista, activo) {
    const clave = this.crearClaveAnalisis(indexPaciente, nroPista);
    if (activo) {
        this.analisisEnCurso[clave] = true;
    } else {
        delete this.analisisEnCurso[clave];
    }
};

app.formatearFechaHora = function (valor) {
    if (!valor) return 'No disponible';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return 'No disponible';
    return fecha.toLocaleString('es-AR');
};

app.extraerNombreArchivo = function (valor) {
    return String(valor || '').split('/').pop().split('\\').pop();
};

app.obtenerOrigenBackend = function () {
    try {
        const apiUrl = new URL(CONFIG.API_URL, window.location.href);
        return apiUrl.origin;
    } catch (error) {
        if (window.location && /^https:$/i.test(window.location.protocol)) {
            return window.location.origin;
        }
        return 'http://localhost:3000';
    }
};

app.crearRutaManifestAnalisis = function (indexPaciente, nroPista) {
    return `${this.obtenerOrigenBackend()}/analysis_outputs/paciente_${indexPaciente}/pista_${nroPista}/analysis_results.json`;
};

app.leerAnalisisPersistidos = function () {
    try {
        return JSON.parse(localStorage.getItem(ANALYSIS_STORAGE_KEY) || '{}');
    } catch (error) {
        return {};
    }
};

app.guardarAnalisisPersistidos = function () {
    localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(this.analisisPersistidos || {}));
};

app.tituloGraficoDesdeNombre = function (nombre, indice) {
    const base = this.extraerNombreArchivo(nombre).replace(/\.[^.]+$/, '');
    const limpio = base
        .replace(/^grafico[_-]/i, 'Gráfico ')
        .replace(/[_-]+/g, ' ')
        .replace(/\b(ms|iti|fft|bpm|2d|3d)\b/gi, txt => txt.toUpperCase())
        .trim();
    if (!limpio) return `Gráfico ${indice + 1}`;
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
};

app.categorizarGrafico = function (nombre, indice) {
    const normalizado = `${indice + 1} ${String(nombre || '').toLowerCase()}`;
    const regla = ANALYSIS_CATEGORY_RULES.find(item => item.tests.some(test => normalizado.includes(test)));
    return regla || ANALYSIS_CATEGORY_RULES[ANALYSIS_CATEGORY_RULES.length - 1];
};

app.normalizarGraficoAnalisis = function (grafico, indice, baseUrl = '') {
    const url = this.normalizarUrlGrafico(grafico, baseUrl);
    const nombre = this.extraerNombreArchivo(url || grafico) || `grafico_${indice + 1}`;
    const categoria = this.categorizarGrafico(nombre, indice);
    const extension = nombre.split('.').pop().toLowerCase();
    const esImagen = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
    const esDocumento = ['html', 'htm', 'json', 'pdf', 'txt', 'csv'].includes(extension);
    return {
        id: `${indice}-${nombre}`,
        index: indice,
        url,
        nombre,
        titulo: this.tituloGraficoDesdeNombre(nombre, indice),
        categoria: categoria.label,
        categoriaKey: categoria.key,
        extension,
        tipo: extension === 'html' || extension === 'htm'
             ?'html'
            : (esImagen ?'imagen' : (esDocumento ?'documento' : 'archivo'))
    };
};

app.obtenerRecursosAnalisis = function (data) {
    const candidatos = [
        ...(Array.isArray(data.graficos) ?data.graficos : []),
        ...(Array.isArray(data.generated_files) ?data.generated_files : [])
    ].filter(Boolean);

    const vistos = new Set();
    return candidatos.filter(item => {
        const clave = String(item).replace(/\\/g, '/');
        const nombre = this.extraerNombreArchivo(clave).toLowerCase();
        if (nombre === 'audio_video_extraido.wav') return false;
        if (nombre.endsWith('_datos_sesion.json')) return false;
        if (!clave || vistos.has(clave)) return false;
        vistos.add(clave);
        return true;
    });
};

app.normalizarResultadoAnalisis = function (data, nroPista, context = {}) {
    const metadata = data.metadata_extraida || data.metadata || {};
    const video = (data.analisis && data.analisis.video) || {};
    const cuantificadores = data.cuantificadores || {};
    const metricasVideo = data.metricas_video || {};
    const tramos = Array.isArray(data.tramos) ?data.tramos : [];
    const comparacionMetodos = data.comparacion_metodos || {};
    const recursos = this.obtenerRecursosAnalisis(data);
    const graficos = recursos
        .map((grafico, indice) => this.normalizarGraficoAnalisis(grafico, indice, context.manifestUrl || ''));
    const evaluacion = context.evaluacion || {};
    const paciente = context.paciente || {};
    return {
        clave: this.crearClaveAnalisis(context.indexPaciente, nroPista),
        indexPaciente: context.indexPaciente,
        nroPista,
        pacienteNombre: paciente.nombre || context.pacienteNombre || 'Paciente',
        fechaAnalisis: context.fechaAnalisis || data.fechaAnalisis || new Date().toISOString(),
        estado: graficos.length ? 'Disponible' : 'Completado sin gráficos',
        archivo: data.archivo || evaluacion.archivo || 'Sin nombre',
        manoEvaluada: evaluacion.mano_evaluada || metadata.mano || 'No detectada',
        metadata,
        video,
        cuantificadores,
        metricasVideo,
        tramos,
        comparacionMetodos,
        graficos,
        cantidadGraficos: graficos.length,
        manifestUrl: context.manifestUrl || this.crearRutaManifestAnalisis(context.indexPaciente, nroPista),
        categoriaActiva: 'todas',
        origen: context.origen || 'runtime'
    };
};

app.obtenerVideosPaciente = async function (indexPaciente) {
    this.videosPorPacienteCache = this.videosPorPacienteCache || {};
    if (this.videosPorPacienteCache[indexPaciente]) {
        return this.videosPorPacienteCache[indexPaciente];
    }

    try {
        const resp = await fetch(`${CONFIG.API_URL}/${indexPaciente}/videos`);
        const data = await resp.json();
        const videos = data.videos || {};
        this.videosPorPacienteCache[indexPaciente] = videos;
        return videos;
    } catch (error) {
        return {};
    }
};

app.leerUint64Seguro = function (view, offset) {
    const high = view.getUint32(offset);
    const low = view.getUint32(offset + 4);
    return high * 4294967296 + low;
};

app.extraerMetadataMp4 = function (arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const decoder = new TextDecoder('ascii');

    const leerTipo = (offset) => decoder.decode(new Uint8Array(arrayBuffer, offset, 4));
    const leerCajas = (start, end) => {
        const boxes = [];
        let offset = start;
        while (offset + 8 <= end) {
            let size = view.getUint32(offset);
            const type = leerTipo(offset + 4);
            let headerSize = 8;
            if (size === 1 && offset + 16 <= end) {
                size = this.leerUint64Seguro(view, offset + 8);
                headerSize = 16;
            } else if (size === 0) {
                size = end - offset;
            }
            if (!size || size < headerSize) break;
            boxes.push({
                type,
                start: offset,
                size,
                headerSize,
                contentStart: offset + headerSize,
                contentEnd: offset + size
            });
            offset += size;
        }
        return boxes;
    };

    const buscarCaja = (boxes, type) => boxes.find(box => box.type === type);
    const topLevel = leerCajas(0, arrayBuffer.byteLength);
    const moov = buscarCaja(topLevel, 'moov');
    if (!moov) return null;

    const moovChildren = leerCajas(moov.contentStart, moov.contentEnd);
    const tracks = moovChildren.filter(box => box.type === 'trak');

    for (const trak of tracks) {
        const trakChildren = leerCajas(trak.contentStart, trak.contentEnd);
        const mdia = buscarCaja(trakChildren, 'mdia');
        if (!mdia) continue;

        const mdiaChildren = leerCajas(mdia.contentStart, mdia.contentEnd);
        const hdlr = buscarCaja(mdiaChildren, 'hdlr');
        const mdhd = buscarCaja(mdiaChildren, 'mdhd');
        const minf = buscarCaja(mdiaChildren, 'minf');
        if (!hdlr || !mdhd || !minf) continue;

        const handlerType = leerTipo(hdlr.contentStart + 8);
        if (handlerType !== 'vide') continue;

        const mdhdVersion = view.getUint8(mdhd.contentStart);
        const timescale = mdhdVersion === 1
             ?view.getUint32(mdhd.contentStart + 20)
            : view.getUint32(mdhd.contentStart + 12);
        const duration = mdhdVersion === 1
             ?this.leerUint64Seguro(view, mdhd.contentStart + 24)
            : view.getUint32(mdhd.contentStart + 16);

        const minfChildren = leerCajas(minf.contentStart, minf.contentEnd);
        const stbl = buscarCaja(minfChildren, 'stbl');
        if (!stbl || !timescale || !duration) {
            return {
                duracion_segundos: timescale ?Number((duration / timescale).toFixed(3)) : null,
                fps: null
            };
        }

        const stblChildren = leerCajas(stbl.contentStart, stbl.contentEnd);
        const stts = buscarCaja(stblChildren, 'stts');
        let totalSamples = 0;

        if (stts) {
            const entryCount = view.getUint32(stts.contentStart + 4);
            let cursor = stts.contentStart + 8;
            for (let i = 0; i < entryCount; i++) {
                totalSamples += view.getUint32(cursor);
                cursor += 8;
            }
        }

        const duracionSegundos = duration / timescale;
        return {
            duracion_segundos: Number(duracionSegundos.toFixed(3)),
            fps: totalSamples > 0 && duracionSegundos > 0 ?Number((totalSamples / duracionSegundos).toFixed(3)) : null
        };
    }

    return null;
};

app.extraerDuracionDesdeVideo = function (url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => resolve(Number.isFinite(video.duration) ?Number(video.duration.toFixed(3)) : null);
        video.onerror = () => resolve(null);
        video.src = url;
    });
};

app.completarMetadatosVideoFaltantes = async function (indexPaciente, nroPista, videoActual) {
    const video = { ...(videoActual || {}) };
    if (video.duracion_segundos != null && video.fps != null) {
        return video;
    }

    this.videoMetadataCache = this.videoMetadataCache || {};
    const cacheKey = `${indexPaciente}-${nroPista}`;
    if (this.videoMetadataCache[cacheKey]) {
        return { ...video, ...this.videoMetadataCache[cacheKey] };
    }

    const videos = await this.obtenerVideosPaciente(indexPaciente);
    const rutaVideo = videos[String(nroPista)] || videos[nroPista];
    if (!rutaVideo) return video;

    let metadata = null;
    try {
        const response = await fetch(rutaVideo);
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            metadata = this.extraerMetadataMp4(buffer);
        }
    } catch (error) {
    }

    if (!metadata || metadata.duracion_segundos == null) {
        const duracion = await this.extraerDuracionDesdeVideo(rutaVideo);
        metadata = {
            ...(metadata || {}),
            duracion_segundos: duracion
        };
    }

    this.videoMetadataCache[cacheKey] = metadata || {};
    return { ...video, ...(metadata || {}) };
};

app.persistirResultadoAnalisis = function (resultado) {
    if (!resultado || resultado.indexPaciente == null || resultado.nroPista == null) return;
    this.analisisPersistidos[resultado.clave] = resultado;
    this.guardarAnalisisPersistidos();
};

app.invalidarAnalisisPersistido = function (indexPaciente, nroPista) {
    const clave = this.crearClaveAnalisis(indexPaciente, nroPista);
    delete this.analisisPersistidos[clave];
    if (this.videoMetadataCache) {
        delete this.videoMetadataCache[`${indexPaciente}:${nroPista}`];
    }
    if (this.analisisActivo && this.analisisActivo.indexPaciente === indexPaciente && String(this.analisisActivo.nroPista) === String(nroPista)) {
        this.cerrarAnalisisModal();
        this.analisisActivo = null;
    }
    this.guardarAnalisisPersistidos();
};

app.cargarAnalisisGuardado = async function (indexPaciente, nroPista, opciones = {}) {
    const clave = this.crearClaveAnalisis(indexPaciente, nroPista);
    const existente = this.analisisPersistidos[clave] || null;
    if (!opciones.forzar && this.analisisPersistidos[clave]) {
        return this.analisisPersistidos[clave];
    }

    const manifestUrl = this.crearRutaManifestAnalisis(indexPaciente, nroPista);
    try {
        const response = await fetch(manifestUrl, { cache: 'no-store' });
        if (!response.ok) return this.analisisPersistidos[clave] || null;
        const manifest = await response.json();
        const paciente = this.pacientes[indexPaciente] || {};
        const evaluacion = (paciente.evaluaciones_detalladas || []).find(ev => String(ev.nro_pista) === String(nroPista)) || {};
        const resultado = this.normalizarResultadoAnalisis(
            {
                archivo: this.extraerNombreArchivo(manifest.video_path),
                metadata_extraida: manifest.metadata || {},
                analisis: { video: existente && existente.video ?existente.video : {} },
                cuantificadores: manifest.cuantificadores || {},
                metricas_video: manifest.metricas_video || {},
                tramos: manifest.tramos || [],
                comparacion_metodos: manifest.comparacion_metodos || {},
                graficos: manifest.generated_plots || [],
                generated_files: manifest.generated_files || []
            },
            nroPista,
            {
                indexPaciente,
                paciente,
                evaluacion,
                manifestUrl,
                origen: 'manifest',
                fechaAnalisis: (existente && existente.fechaAnalisis) || new Date().toISOString()
            }
        );
        resultado.video = await this.completarMetadatosVideoFaltantes(indexPaciente, nroPista, resultado.video);
        this.persistirResultadoAnalisis(resultado);
        return resultado;
    } catch (error) {
        return this.analisisPersistidos[clave] || null;
    }
};

app.esperarResultadoAnalisis = async function (indexPaciente, nroPista, opciones = {}) {
    const timeoutMs = Number(opciones.timeoutMs || 90000);
    const intervalMs = Number(opciones.intervalMs || 5000);
    const startedAt = Date.now();

    while ((Date.now() - startedAt) < timeoutMs) {
        const resultado = await this.cargarAnalisisGuardado(indexPaciente, nroPista, { forzar: true });
        if (resultado) {
            return resultado;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return null;
};

app.consultarEstadoAnalisisServidor = async function (indexPaciente, nroPista) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/analizar/${nroPista}/estado`, { cache: 'no-store' });
        if (!response.ok) {
            return { status: 'unknown' };
        }
        return await response.json();
    } catch (_) {
        return { status: 'unknown' };
    }
};

app.monitorearAnalisisServidor = async function (indexPaciente, nroPista, opciones = {}) {
    const timeoutMs = Number(opciones.timeoutMs || 20 * 60 * 1000);
    const intervalMs = Number(opciones.intervalMs || 5000);
    const startedAt = Date.now();

    while ((Date.now() - startedAt) < timeoutMs) {
        const estado = await this.consultarEstadoAnalisisServidor(indexPaciente, nroPista);
        if (estado.status === 'completed') {
            const resultado = await this.cargarAnalisisGuardado(indexPaciente, nroPista, { forzar: true });
            return { status: 'completed', resultado };
        }
        if (estado.status === 'error') {
            return { status: 'error', message: estado.message || estado.error || 'No se pudo completar el análisis del video.' };
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return { status: 'timeout' };
};

app.obtenerManifiestosAnalisisPaciente = async function (indexPaciente) {
    try {
        const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/analisis`, { cache: 'no-store' });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data.analisis) ?data.analisis : [];
    } catch (error) {
        return [];
    }
};

app.precargarAnalisisDisponiblesPaciente = async function (indexPaciente, evals) {
    const manifiestos = await this.obtenerManifiestosAnalisisPaciente(indexPaciente);
    const pistasDisponibles = new Set(manifiestos.map(item => String(item.nro_pista)));
    await Promise.all(
        (evals || [])
            .filter(ev => pistasDisponibles.has(String(ev.nro_pista)))
            .map(ev => this.cargarAnalisisGuardado(indexPaciente, ev.nro_pista))
    );
    return pistasDisponibles;
};

app.renderizarAnalisisDisponibles = function (indexPaciente, evals) {
    const contenedor = document.getElementById('modal-analisis-disponibles');
    const contador = document.getElementById('modal-analisis-contador');
    if (!contenedor || !contador) return;

    const registros = (evals || [])
        .map(ev => this.analisisPersistidos[this.crearClaveAnalisis(indexPaciente, ev.nro_pista)])
        .filter(Boolean)
        .sort((a, b) => new Date(b.fechaAnalisis) - new Date(a.fechaAnalisis));

    contador.textContent = registros.length ?`${registros.length} disponibles` : 'Sin resultados guardados';

    if (!registros.length) {
        contenedor.innerHTML = `
            <div class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-500 text-center">
                Todavía no hay analisis persistidos para este paciente. Cuando ejecutes uno, va a quedar accesible desde acá si el manifiesto del resultado sigue disponible.
            </div>
        `;
        return;
    }

    contenedor.innerHTML = registros.map(item => `
        <div class="analysis-available-item">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Pista ${item.nroPista}</p>
                    <h5 class="font-semibold text-slate-800 mt-1 text-sm break-all">${item.archivo}</h5>
                    <p class="text-xs text-slate-500 mt-1">${item.metadata.tipo_metronomo || 'Tipo no detectado'} · ${item.manoEvaluada || 'Mano no detectada'} · Observaciones clínicas</p>
                </div>
                <span class="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">${item.estado}</span>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
                <span class="text-xs text-slate-500">${this.formatearFechaHora(item.fechaAnalisis)}</span>
                <div class="flex items-center gap-2">
                    <button onclick="app.abrirAnalisisPersistido(${indexPaciente}, ${item.nroPista})" class="bg-primary text-white hover:bg-primary/90 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Observaciones</button>
                    <button onclick="app.descargarPdfAnalisisPersistido(${indexPaciente}, ${item.nroPista})" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition">PDF</button>
                </div>
            </div>
        </div>
    `).join('');
};

app.adjuntarAccionesAnalisisACelda = function (indexPaciente, nroPista) {
    const cell = document.getElementById(`video-cell-${nroPista}`);
    const resultado = this.analisisPersistidos[this.crearClaveAnalisis(indexPaciente, nroPista)];
    if (!cell || !resultado || cell.querySelector(`[data-analysis-action="${nroPista}"]`)) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'mt-2 flex items-center justify-center gap-1';
    wrapper.innerHTML = `
        <button data-analysis-action="${nroPista}" onclick="app.abrirAnalisisPersistido(${indexPaciente}, ${nroPista})" class="bg-primary/10 text-primary hover:bg-primary/20 p-1.5 rounded-lg transition" title="Completar observaciones de la evaluación">
            <i data-lucide="clipboard-list" class="w-4 h-4"></i>
        </button>
        <button onclick="app.descargarPdfAnalisisPersistido(${indexPaciente}, ${nroPista})" class="bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition" title="Descargar PDF del análisis">
            <i data-lucide="file-down" class="w-4 h-4"></i>
        </button>
    `;
    cell.appendChild(wrapper);
    lucide.createIcons();
};

app.cargarAnalisisDisponibles = async function (indexPaciente, evals) {
    const contador = document.getElementById('modal-analisis-contador');
    if (contador) contador.textContent = 'Buscando...';
    await this.precargarAnalisisDisponiblesPaciente(indexPaciente, evals);
    this.renderizarAnalisisDisponibles(indexPaciente, evals);
    (evals || []).forEach(ev => this.adjuntarAccionesAnalisisACelda(indexPaciente, ev.nro_pista));
};

app.abrirAnalisisPersistido = async function (indexPaciente, nroPista) {
    const resultado = await this.cargarAnalisisGuardado(indexPaciente, nroPista, { forzar: true });
    if (!resultado) {
        this.mostrarErrorAccion(
            'No encontramos resultados para esta evaluación.',
            'Puede que el análisis no se haya completado o que ya no esté disponible. Podés volver al detalle y reintentar el análisis.'
        );
        return;
    }
    this.abrirObservacionesEvaluacion(indexPaciente, { nroPista });
};

app.descargarPdfAnalisisPersistido = async function (indexPaciente, nroPista) {
    const resultado = await this.cargarAnalisisGuardado(indexPaciente, nroPista, { forzar: true });
    if (!resultado) {
        this.mostrarErrorAccion(
            'El PDF todavía no está disponible porque esta evaluación no tiene resultados generados.',
            'Volvé al detalle del paciente y ejecutá o reintentá el análisis antes de descargar el PDF.'
        );
        return;
    }
    await this.descargarPdfAnalisis(resultado);
};

app.renderizarResumenAnalisis = function (resultado) {
    const metadata = resultado.metadata || {};
    const resumen = document.getElementById('modal-analisis-resumen');
    document.getElementById('modal-analisis-titulo').textContent = `Resultados del análisis - Pista ${resultado.nroPista}`;
    document.getElementById('modal-analisis-subtitulo').textContent = `${resultado.pacienteNombre || 'Paciente'} · ${this.formatearFechaHora(resultado.fechaAnalisis)}`;
    document.getElementById('modal-analisis-encabezado').textContent = `${metadata.tipo_metronomo || 'Tipo no detectado'} · ${metadata.mano || resultado.manoEvaluada || 'Mano no detectada'} · Sujeto ${metadata.sujeto || 'N/D'}`;
    document.getElementById('modal-analisis-archivo').textContent = `Archivo: ${resultado.archivo || 'No disponible'}`;
    document.getElementById('modal-analisis-estado').textContent = resultado.estado || 'Disponible';

    const items = [
        ['Paciente', resultado.pacienteNombre || 'No disponible'],
        ['Pista / evaluación', `Pista ${resultado.nroPista}`],
        ['Tipo', metadata.tipo_metronomo || 'No detectado'],
        ['Mano', metadata.mano || resultado.manoEvaluada || 'No detectada'],
        ['Estado', resultado.estado || 'Disponible'],
        ['Gráficos generados', String(resultado.cantidadGraficos || 0)]
    ];

    resumen.innerHTML = items.map(([label, value]) => `
        <div class="analysis-summary-card">
            <div class="analysis-summary-card-label">${label}</div>
            <div class="analysis-summary-card-value">${value}</div>
        </div>
    `).join('');
};

app.renderizarTabsAnalisis = function (resultado) {
    const tabs = document.getElementById('modal-analisis-categorias');
    const categorias = [
        { key: 'todas', label: `Todas (${resultado.graficos.length})` },
        ...ANALYSIS_CATEGORY_RULES
            .map(cat => ({
                key: cat.key,
                label: `${cat.label} (${resultado.graficos.filter(g => g.categoriaKey === cat.key).length})`
            }))
            .filter(cat => cat.key === 'todas' || resultado.graficos.some(g => g.categoriaKey === cat.key))
    ];

    tabs.innerHTML = categorias.map(cat => `
        <button class="analysis-tab ${resultado.categoriaActiva === cat.key ?'active' : ''}" onclick="app.cambiarCategoriaAnalisis('${cat.key}')">${cat.label}</button>
    `).join('');
};

app.obtenerGraficosFiltrados = function () {
    if (!this.analisisActivo) return [];
    if (this.analisisActivo.categoriaActiva === 'todas') return this.analisisActivo.graficos;
    return this.analisisActivo.graficos.filter(g => g.categoriaKey === this.analisisActivo.categoriaActiva);
};

app.renderizarGaleriaAnalisis = function () {
    const galeria = document.getElementById('modal-analisis-galeria');
    const graficos = this.obtenerGraficosFiltrados();

    if (!graficos.length) {
        galeria.innerHTML = `
            <div class="analysis-quick-launch text-center text-gray-500">
                No hay graficos en esta categoría para este analisis.
            </div>
        `;
        return;
    }

    const categoria = this.analisisActivo && this.analisisActivo.categoriaActiva === 'todas'
         ? 'Todos los gráficos'
        : graficos[0].categoria;

    galeria.innerHTML = `
        <div class="analysis-quick-launch">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Categoría activa</p>
                    <h4 class="text-lg font-semibold text-slate-800 mt-1">${categoria}</h4>
                    <p class="analysis-muted mt-1">${graficos.length} grafico(s). Al elegir una categoría se abre directo el visor grande y podes recorrerlos con anterior / siguiente.</p>
                </div>
                <button onclick="app.abrirPrimerGraficoActivo()" class="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold transition">Abrir visor</button>
            </div>
        </div>
    `;
};

app.cambiarCategoriaAnalisis = function (categoriaKey, abrirVisor = false) {
    if (!this.analisisActivo) return;
    this.analisisActivo.categoriaActiva = categoriaKey;
    this.renderizarTabsAnalisis(this.analisisActivo);
    this.renderizarGaleriaAnalisis();
    if (abrirVisor) {
        this.abrirPrimerGraficoActivo();
    }
};

app.abrirPrimerGraficoActivo = function () {
    const graficos = this.obtenerGraficosFiltrados();
    if (!graficos.length) {
        this.mostrarModalAvisoAccion({
            tipo: 'info',
            titulo: 'El análisis finalizó sin gráficos visibles',
            resumen: 'Este backend no devolvió gráficos ni recursos visuales para abrir.',
            ayuda: 'El resultado igual quedó guardado y puede seguir disponible para el informe final.'
        });
        return;
    }
    this.abrirVisorAnalisis(graficos[0].id);
};

app.renderizarResumenAnalisis = function (resultado) {
    const metadata = resultado.metadata || {};
    const resumen = document.getElementById('modal-analisis-resumen');
    document.getElementById('modal-analisis-titulo').textContent = `Resultados del análisis - Pista ${resultado.nroPista}`;
    document.getElementById('modal-analisis-subtitulo').textContent = `${resultado.pacienteNombre || 'Paciente'} · ${this.formatearFechaHora(resultado.fechaAnalisis)}`;
    document.getElementById('modal-analisis-encabezado').textContent = `${metadata.tipo_metronomo || 'Tipo no detectado'} · ${metadata.mano || resultado.manoEvaluada || 'Mano no detectada'} · Sujeto ${metadata.sujeto || 'N/D'}`;
    document.getElementById('modal-analisis-archivo').textContent = `Archivo: ${resultado.archivo || 'No disponible'}`;
    document.getElementById('modal-analisis-estado').textContent = resultado.estado || 'Disponible';

    const items = [
        ['Paciente', resultado.pacienteNombre || 'No disponible'],
        ['Pista / evaluación', `Pista ${resultado.nroPista}`],
        ['Tipo', metadata.tipo_metronomo || 'No detectado'],
        ['Mano', metadata.mano || resultado.manoEvaluada || 'No detectada'],
        ['Recursos disponibles', String(resultado.cantidadGraficos || 0)],
        ['Estado', resultado.estado || 'Disponible']
    ];

    resumen.innerHTML = items.map(([label, value]) => `
        <div class="analysis-summary-card">
            <div class="analysis-summary-card-label">${label}</div>
            <div class="analysis-summary-card-value">${value}</div>
        </div>
    `).join('');
};

app.renderizarTabsAnalisis = function (resultado) {
    const tabs = document.getElementById('modal-analisis-categorias');
    const categorias = [
        { key: 'todas', label: `Todas (${resultado.graficos.length})` },
        ...ANALYSIS_CATEGORY_RULES
            .map(cat => ({
                key: cat.key,
                label: `${cat.label} (${resultado.graficos.filter(g => g.categoriaKey === cat.key).length})`
            }))
            .filter(cat => cat.key === 'todas' || resultado.graficos.some(g => g.categoriaKey === cat.key))
    ];

    tabs.innerHTML = categorias.map(cat => `
        <button class="analysis-tab ${resultado.categoriaActiva === cat.key ?'active' : ''}" onclick="app.cambiarCategoriaAnalisis('${cat.key}')">${cat.label}</button>
    `).join('');
};

app.renderizarGaleriaAnalisis = function () {
    const galeria = document.getElementById('modal-analisis-galeria');
    const graficos = this.obtenerGraficosFiltrados();

    if (!graficos.length) {
        galeria.innerHTML = `
            <div class="analysis-empty-state text-center text-gray-500">
                El analisis finalizo correctamente, pero este backend no devolvió gráficos.
            </div>
        `;
        return;
    }

    galeria.innerHTML = `
        <div class="analysis-gallery-grid">
            ${graficos.map(item => `
                <article class="analysis-graph-card">
                    <button onclick="app.abrirVisorAnalisis('${item.id}')" class="analysis-graph-thumb" title="Abrir ${item.titulo}">
                        ${item.tipo === 'html'
                            ?`<div class="analysis-graph-placeholder">
                                <span class="analysis-graph-placeholder-badge">Interactivo</span>
                                <span class="analysis-graph-placeholder-title">${item.titulo}</span>
                                </div>`
                            : item.tipo === 'imagen'
                                 ?`<img src="${item.url}" alt="${item.titulo}" loading="lazy">`
                                : `<div class="analysis-graph-placeholder">
                                    <span class="analysis-graph-placeholder-badge">${item.extension.toUpperCase()}</span>
                                    <span class="analysis-graph-placeholder-title">${item.titulo}</span>
                                   </div>`}
                    </button>
                    <div class="analysis-graph-card-body">
                        <div class="min-w-0">
                            <p class="analysis-graph-category">${item.categoria}</p>
                            <h4 class="analysis-graph-title">${item.titulo}</h4>
                            <p class="analysis-muted truncate mt-1">${item.nombre}</p>
                        </div>
                        <button onclick="app.abrirVisorAnalisis('${item.id}')" class="analysis-open-btn">Abrir</button>
                    </div>
                </article>
            `).join('')}
        </div>
    `;
};

app.cambiarCategoriaAnalisis = function (categoriaKey) {
    if (!this.analisisActivo) return;
    this.analisisActivo.categoriaActiva = categoriaKey;
    this.renderizarTabsAnalisis(this.analisisActivo);
    this.renderizarGaleriaAnalisis();
};

app.abrirResultadosAnalisis = function (data, nroPista, context = {}) {
    const resultado = context.reutilizarNormalizado
         ?{ ...data, categoriaActiva: data.categoriaActiva || 'todas' }
        : this.normalizarResultadoAnalisis(data, nroPista, context);

    this.analisisActivo = resultado;
    this.persistirResultadoAnalisis(resultado);
    this.renderizarResumenAnalisis(resultado);
    this.renderizarCuantificadoresWeb(resultado);

    document.getElementById('btn-analisis-pdf').onclick = () => this.descargarPdfAnalisis(this.analisisActivo);

    document.getElementById('modal-analisis').classList.remove('hidden');
    lucide.createIcons();
};

app.abrirVisorAnalisis = function (graficoId) {
    const graficos = this.obtenerGraficosFiltrados();
    const indice = graficos.findIndex(item => item.id === graficoId);
    if (indice < 0) return;
    this.visorAnalisis = { indice, graficos };
    this.actualizarVisorAnalisis();
    document.getElementById('modal-analisis-visor').classList.remove('hidden');
};

app.actualizarVisorAnalisis = function () {
    if (!this.visorAnalisis || !this.visorAnalisis.graficos.length) return;
    const actual = this.visorAnalisis.graficos[this.visorAnalisis.indice];
    document.getElementById('visor-analisis-categoria').textContent = `${actual.categoria} · ${this.visorAnalisis.indice + 1} de ${this.visorAnalisis.graficos.length}`;
    document.getElementById('visor-analisis-titulo').textContent = actual.titulo;
    document.getElementById('visor-analisis-contenido').innerHTML = actual.tipo === 'html'
         ?`<div class="analysis-viewer-stage"><iframe src="${actual.url}" class="analysis-viewer-frame"></iframe></div>`
        : actual.tipo === 'imagen'
             ?`<div class="analysis-viewer-stage"><img src="${actual.url}" alt="${actual.titulo}"></div>`
            : actual.tipo === 'documento'
                 ?`<div class="analysis-viewer-stage"><iframe src="${actual.url}" class="analysis-viewer-frame"></iframe></div>`
                : `<div class="analysis-viewer-stage"><div class="analysis-viewer-file">
                    <p class="font-semibold mb-2">Este recurso no tiene vista previa embebida.</p>
                    <a href="${actual.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all">Abrir archivo original</a>
                   </div></div>`;
    document.getElementById('btn-visor-anterior').onclick = () => {
        this.visorAnalisis.indice = (this.visorAnalisis.indice - 1 + this.visorAnalisis.graficos.length) % this.visorAnalisis.graficos.length;
        this.actualizarVisorAnalisis();
    };
    document.getElementById('btn-visor-siguiente').onclick = () => {
        this.visorAnalisis.indice = (this.visorAnalisis.indice + 1) % this.visorAnalisis.graficos.length;
        this.actualizarVisorAnalisis();
    };
    lucide.createIcons();
};

app.cerrarVisorAnalisis = function () {
    document.getElementById('modal-analisis-visor').classList.add('hidden');
};

app.cargarImagenComoDataUrl = function (src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = src;
    });
};

app.capturarGraficoHtml = function (src) {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '-10000px';
        iframe.style.top = '0';
        iframe.style.width = '1600px';
        iframe.style.height = '900px';
        iframe.src = src;
        document.body.appendChild(iframe);

        const limpiar = () => iframe.remove();
        iframe.onload = async () => {
            try {
                const plot = iframe.contentDocument && iframe.contentDocument.querySelector('.js-plotly-plot');
                const Plotly = iframe.contentWindow && iframe.contentWindow.Plotly;
                if (plot && Plotly && typeof Plotly.toImage === 'function') {
                    const dataUrl = await Plotly.toImage(plot, { format: 'png', width: 1600, height: 900 });
                    limpiar();
                    resolve(dataUrl);
                    return;
                }
            } catch (error) {
            }
            limpiar();
            resolve(null);
        };
        iframe.onerror = () => {
            limpiar();
            resolve(null);
        };
    });
};

app.extraerImagenPdfGrafico = async function (grafico) {
    if (grafico.tipo === 'html') {
        return this.capturarGraficoHtml(grafico.url);
    }
    if (grafico.tipo === 'imagen') {
        return this.cargarImagenComoDataUrl(grafico.url);
    }
    return null;
};

app.generarPDFLegacy = app.generarPDF.bind(app);

app.obtenerIndexPacienteDesdeRegistro = function (paciente) {
    if (!paciente) return -1;
    if (Number.isInteger(paciente._index)) return paciente._index;
    return this.pacientes.indexOf(paciente);
};

app.formatearValorInformeAnalisis = function (valor) {
    if (valor == null || valor === '') return 'No registrado';
    if (typeof valor === 'number') {
        return Number.isInteger(valor) ?String(valor) : String(Number(valor.toFixed(3)));
    }
    if (typeof valor === 'boolean') {
        return valor ?'Sí' : 'No';
    }
    return String(valor);
};

app.formatearEtiquetaInformeAnalisis = function (valor) {
    return String(valor || '')
        .replace(/[_/]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
};

app.recolectarEscalaresInformeAnalisis = function (valor, prefijo = '', filas = []) {
    if (valor == null) return filas;
    if (Array.isArray(valor)) return filas;
    if (typeof valor === 'object') {
        Object.entries(valor).forEach(([clave, subvalor]) => {
            const siguiente = prefijo ?`${prefijo} / ${clave}` : clave;
            this.recolectarEscalaresInformeAnalisis(subvalor, siguiente, filas);
        });
        return filas;
    }
    filas.push([
        this.formatearEtiquetaInformeAnalisis(prefijo),
        this.formatearValorInformeAnalisis(valor)
    ]);
    return filas;
};

app.construirFilasInformeAnalisis = function (resultado) {
    const filas = [];
    this.recolectarEscalaresInformeAnalisis(resultado.cuantificadores || {}, '', filas);

    const metricasSeleccionadas = {};
    [
        'tiempo_apoyo_ms',
        'tiempo_alzada_ms',
        'smoothness_real',
        'harmony_real',
        'curvature_real',
        'smoothness_relativo',
        'harmony_relativo',
        'curvature_relativo',
        'beats_antes_reaccion',
        'calidad_tracking',
        'pct_fuera_escala_MM',
        'pct_fuera_escala_FI',
        'resolucion_temporal_video_ms'
    ].forEach(clave => {
        if (resultado.metricasVideo && resultado.metricasVideo[clave] != null) {
            metricasSeleccionadas[clave] = resultado.metricasVideo[clave];
        }
    });
    this.recolectarEscalaresInformeAnalisis(metricasSeleccionadas, 'Metricas de video', filas);
    this.recolectarEscalaresInformeAnalisis(resultado.comparacionMetodos || {}, 'Comparacion de metodos', filas);
    return filas;
};

app.cargarResultadosAnalisisPaciente = async function (indexPaciente) {
    const paciente = this.pacientes[indexPaciente];
    const evaluaciones = Array.isArray(paciente && paciente.evaluaciones_detalladas)
         ? [...paciente.evaluaciones_detalladas].sort((a, b) => Number(a.nro_pista) - Number(b.nro_pista))
        : [];

    const resultados = await Promise.all(
        evaluaciones.map(ev => this.cargarAnalisisGuardado(indexPaciente, ev.nro_pista, { forzar: true }))
    );

    return resultados.filter(Boolean).sort((a, b) => Number(a.nroPista) - Number(b.nroPista));
};

app.normalizarManoInformeAnalisis = function (valor) {
    const mano = String(valor || '').trim().toUpperCase();
    if (['MD', 'D', 'DERECHA', 'RIGHT'].includes(mano)) return 'Derecha';
    if (['MI', 'I', 'IZQUIERDA', 'LEFT'].includes(mano)) return 'Izquierda';
    return valor ?String(valor) : 'No registrada';
};

app.obtenerValorOpcionInformeAnalisis = function (valor, opciones) {
    if (valor == null || valor === '') return opciones.join(' / ');
    return String(valor);
};

app.obtenerCondicionExperimentalInformeAnalisis = function (resultado) {
    const metadata = (resultado && resultado.metadata) || {};
    if (metadata.porcentaje_cambio != null) return `${metadata.porcentaje_cambio}%`;
    if (metadata.bpm != null) return `${metadata.bpm} bpm`;
    if (metadata.bpm_1 != null && metadata.bpm_2 != null) return `${metadata.bpm_1} a ${metadata.bpm_2} bpm`;
    return 'No registrada';
};

app.obtenerCvInformeAnalisis = function (resultado) {
    const tramos = Array.isArray(resultado && resultado.tramos) ?resultado.tramos : [];
    const tramoConCv = tramos.find(item => item && item.cv_pct != null);
    if (tramoConCv) return Number(tramoConCv.cv_pct);

    const stats = resultado && resultado.cuantificadores && resultado.cuantificadores.temporal_basico
         ? resultado.cuantificadores.temporal_basico.stats_por_bpm
        : [];
    const statConCv = Array.isArray(stats) ?stats.find(item => item && item.cv_pct != null) : null;
    return statConCv ?Number(statConCv.cv_pct) : null;
};

app.obtenerEtiquetaCvInformeAnalisis = function (cv) {
    if (cv == null || Number.isNaN(Number(cv))) return 'No disponible';
    const valor = Number(cv);
    if (valor < 5) return 'Bajo';
    if (valor < 10) return 'Moderado';
    return 'Alto';
};

app.formatearCuantificadorWeb = function (valor, unidad = '') {
    if (valor == null || valor === '' || !Number.isFinite(Number(valor))) return 'No disponible';
    return `${this.formatearValorInformeAnalisis(Number(valor))}${unidad ? ` ${unidad}` : ''}`;
};

app.obtenerFilasCuantificadoresWeb = function (resultado) {
    const temporalBasico = resultado && resultado.cuantificadores
        ? resultado.cuantificadores.temporal_basico || {}
        : {};
    const asincroniaVideo = temporalBasico.asincronia_video || {};
    const mediaMs = asincroniaVideo.mean_ms != null ? Number(asincroniaVideo.mean_ms) : null;
    const sigmaMs = asincroniaVideo.std_ms != null ? Number(asincroniaVideo.std_ms) : null;
    const cvPct = this.obtenerCvInformeAnalisis(resultado);
    const etiquetaCv = this.obtenerEtiquetaCvInformeAnalisis(cvPct);

    return [
        {
            nombre: 'Asincronía media (mu)',
            resultado: this.formatearCuantificadorWeb(mediaMs, 'ms'),
            esperado: '+/- 30 ms',
            valoracion: 'Sesgo temporal: negativo = anticipación; positivo = atraso.'
        },
        {
            nombre: 'Variabilidad temporal (desvío estándar)',
            resultado: this.formatearCuantificadorWeb(sigmaMs, 'ms'),
            esperado: '<60 ms',
            valoracion: 'Inestabilidad del ritmo; mayor desvío = menor precisión temporal.'
        },
        {
            nombre: 'Coeficiente de variación (CV)',
            resultado: cvPct != null
                ? `${this.formatearCuantificadorWeb(cvPct, '%')} (${etiquetaCv})`
                : 'No disponible',
            esperado: 'Más bajo = mayor estabilidad',
            valoracion: 'Alta CV indica control motor inestable. Bajo CV indica control motor estable.'
        }
    ];
};

app.renderizarCuantificadoresWeb = function (resultado) {
    const cuerpo = document.getElementById('modal-analisis-cuantificadores-filas');
    if (!cuerpo) return;

    cuerpo.innerHTML = '';
    this.obtenerFilasCuantificadoresWeb(resultado).forEach((fila) => {
        const tr = document.createElement('tr');
        [fila.nombre, fila.resultado, fila.esperado, fila.valoracion].forEach((valor, indice) => {
            const td = document.createElement('td');
            td.className = `px-3 py-3 align-top ${indice === 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}`;
            td.textContent = valor;
            tr.appendChild(td);
        });
        cuerpo.appendChild(tr);
    });
};

app.tieneCuantificadoresAnalisis = function (resultado) {
    return Boolean(resultado && this.construirFilasInformeAnalisis(resultado).length);
};

app.observacionesEvaluacionActual = null;

app.abrirObservacionesEvaluacion = function (indexPaciente, opciones = {}) {
    const registro = this.pacientes[indexPaciente];
    if (!registro || this.esPacienteNino(registro)) {
        return;
    }

    const modal = document.getElementById('modal-observaciones-evaluacion');
    const form = document.getElementById('form-observaciones-evaluacion');
    if (!modal || !form) return;

    this.observacionesEvaluacionActual = { indexPaciente, nroPista: opciones.nroPista || null };
    document.getElementById('modal-observaciones-titulo').textContent = 'Observaciones de la evaluación';
    document.getElementById('modal-observaciones-subtitulo').textContent =
        `${registro.nombre || 'Paciente'} · ${registro.fecha ?this.formatearFechaPaciente(registro.fecha) : 'Sin fecha'}`;

    const setValue = (name, value) => {
        const field = form.elements.namedItem(name);
        if (field) field.value = value || '';
    };

    setValue('disposicion_durante_evaluacion', registro.disposicion_durante_evaluacion);
    setValue('nivel_cooperacion', registro.nivel_cooperacion);
    setValue('atencion_orientada_tarea', registro.atencion_orientada_tarea);
    setValue('comprension_consignas', registro.comprension_consignas);
    setValue('indicadores_fatiga', registro.indicadores_fatiga);
    setValue('regulacion_emocional', registro.regulacion_emocional || registro.regulacion);
    setValue('persistencia_dificultades', registro.persistencia_dificultades);
    setValue('integrated_observations', registro.integrated_observations || '');

    modal.classList.remove('hidden');
    lucide.createIcons();
};

app.verResultadosVideo = async function (indexPaciente, nroPista) {
    const resultado = await this.cargarAnalisisGuardado(indexPaciente, nroPista, { forzar: true });
    if (!this.tieneCuantificadoresAnalisis(resultado)) {
        this.mostrarErrorAccion(
            'No hay resultados disponibles para este video.',
            'El análisis puede no haberse completado o sus resultados ya no estar disponibles.'
        );
        return;
    }

    this.abrirResultadosAnalisis(resultado, nroPista, { reutilizarNormalizado: true });
};

app.cerrarModalObservacionesEvaluacion = function () {
    const modal = document.getElementById('modal-observaciones-evaluacion');
    if (modal) modal.classList.add('hidden');
    this.observacionesEvaluacionActual = null;
};

app.guardarObservacionesEvaluacion = async function () {
    const contexto = this.observacionesEvaluacionActual;
    const form = document.getElementById('form-observaciones-evaluacion');
    if (!contexto || !form) return;

    const payload = {
        disposicion_durante_evaluacion: form.elements.namedItem('disposicion_durante_evaluacion').value || '',
        nivel_cooperacion: form.elements.namedItem('nivel_cooperacion').value || '',
        atencion_orientada_tarea: form.elements.namedItem('atencion_orientada_tarea').value || '',
        comprension_consignas: form.elements.namedItem('comprension_consignas').value || '',
        indicadores_fatiga: form.elements.namedItem('indicadores_fatiga').value || '',
        regulacion_emocional: form.elements.namedItem('regulacion_emocional').value || '',
        persistencia_dificultades: form.elements.namedItem('persistencia_dificultades').value || '',
        integrated_observations: form.elements.namedItem('integrated_observations').value || '',
    };

    const response = await fetch(`${CONFIG.API_URL}/${contexto.indexPaciente}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => null);

    if (!response || !response.ok) {
        this.mostrarErrorAccion(
            'No se pudieron guardar las observaciones.',
            'Revisá la conexión y volvé a intentarlo.'
        );
        return;
    }

    if (this.pacientes[contexto.indexPaciente]) {
        Object.assign(this.pacientes[contexto.indexPaciente], payload);
    }
    await this.verificarConexion();
    this.cerrarModalObservacionesEvaluacion();
    if (this.pacienteDetalleActual && this.pacienteDetalleActual.clave) {
        this.mostrarAlertaDetallePaciente('Observaciones de la evaluación guardadas correctamente.');
    }
};

app.generarInformeEvaluacionFinal = async function (indexPaciente) {
    if (!window.jspdf) {
        alert('No se pudo preparar el informe final.');
        return;
    }

    const paciente = this.pacientes[indexPaciente];
    if (!paciente) {
        alert('No se encontro el paciente para generar el informe.');
        return;
    }
    if (this.esPacienteAdulto(paciente) && !this.tieneConsentimientoFirmado(paciente)) {
        this.mostrarBloqueoConsentimiento();
        return;
    }

    const resultados = await this.cargarResultadosAnalisisPaciente(indexPaciente);
    if (!resultados.length) {
        this.generarPDFLegacy(paciente);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const PRIMARY = [74, 92, 146];
    const ACTION = [59, 141, 119];
    const DARK = [30, 41, 59];
    const MID = [100, 116, 139];
    const BODY_FONT_SIZE = 9;
    const TABLE_FONT_SIZE = 8.5;
    let y = 22;

    const ensureSpace = (height = 16) => {
        if (y + height <= pageH - 18) return;
        doc.addPage();
        y = 22;
    };

    const addSectionTitle = (titulo) => {
        ensureSpace(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...PRIMARY);
        doc.text(titulo, margin, y);
        doc.setDrawColor(...ACTION);
        doc.setLineWidth(0.4);
        doc.line(margin, y + 2, pageW - margin, y + 2);
        y += 8;
    };

    const addParagraph = (texto) => {
        const contenido = String(texto || '').trim();
        if (!contenido) return;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(BODY_FONT_SIZE);
        doc.setTextColor(...DARK);
        const lineas = doc.splitTextToSize(contenido, pageW - margin * 2);
        ensureSpace(lineas.length * 4 + 2);
        doc.text(lineas, margin, y);
        y += lineas.length * 4 + 3;
    };

    const addBulletList = (items = []) => {
        items.filter(Boolean).forEach((item) => {
            const texto = `• ${String(item).trim()}`;
            const lineas = doc.splitTextToSize(texto, pageW - margin * 2 - 3);
            ensureSpace(lineas.length * 4 + 1);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(BODY_FONT_SIZE);
            doc.setTextColor(...DARK);
            doc.text(lineas, margin + 3, y);
            y += lineas.length * 4 + 1;
        });
        y += 2;
    };

    const addSubsectionTitle = (titulo) => {
        ensureSpace(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...PRIMARY);
        doc.text(titulo, margin, y);
        y += 6;
    };

    const addTable = (head, body, options = {}) => {
        if (!body.length) return;
        ensureSpace(18);
        doc.autoTable({
            startY: y,
            head,
            body,
            theme: options.theme || 'grid',
            styles: {
                font: 'helvetica',
                fontStyle: 'normal',
                fontSize: TABLE_FONT_SIZE,
                cellPadding: 2.5,
                overflow: 'linebreak',
                textColor: DARK,
                valign: 'middle',
            },
            headStyles: {
                fillColor: PRIMARY,
                textColor: [255, 255, 255],
                font: 'helvetica',
                fontStyle: 'bold',
                fontSize: TABLE_FONT_SIZE,
            },
            margin: { left: margin, right: margin },
            ...options,
        });
        y = doc.lastAutoTable.finalY + 5;
    };

    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 30, 'F');
    doc.setFillColor(...ACTION);
    doc.rect(0, 30, pageW, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Informe de Evaluacion Musicoterapeutica', margin, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Music Therapy Tools · PESSM', margin, 22);
    doc.text(
        `${paciente.nombre || 'Paciente'} · ${paciente.fecha ?this.formatearFechaPaciente(paciente.fecha) : 'Sin fecha'}`,
        pageW - margin,
        22,
        { align: 'right' }
    );
    y = 42;

    const formacionMusical = [
        paciente.formacion_musical_anios ?`${paciente.formacion_musical_anios} año(s)` : '',
        paciente.tipo_formacion_musical || '',
        paciente.modalidad_formacion_musical || '',
    ].filter(Boolean).join(' · ');
    const tareasIzquierda = resultados.filter(
        item => this.normalizarManoInformeAnalisis(item.manoEvaluada || item.metadata.mano) === 'Izquierda'
    ).length;
    const tareasDerecha = resultados.filter(
        item => this.normalizarManoInformeAnalisis(item.manoEvaluada || item.metadata.mano) === 'Derecha'
    ).length;

    addSectionTitle('Datos del paciente');
    addTable(
        [['Campo', 'Valor']],
        [
            ['Nombre completo', this.formatearValorInformeAnalisis(paciente.nombre)],
            ['Fecha de nacimiento', this.formatearValorInformeAnalisis(paciente.fecha_nacimiento)],
            ['Edad', this.formatearValorInformeAnalisis(paciente.edad)],
            ['Diagnóstico médico', this.formatearValorInformeAnalisis(paciente.diagnostico)],
            ['Medicación actual', this.formatearValorInformeAnalisis(paciente.medicacion)],
            ['Motivo de consulta a Musicoterapia', this.formatearValorInformeAnalisis(paciente.consultation_reason || paciente.motivo_consulta)],
            ['Fecha de evaluación', this.formatearValorInformeAnalisis(paciente.fecha ?this.formatearFechaPaciente(paciente.fecha) : null)],
            ['Evaluador/a', this.formatearValorInformeAnalisis(paciente.evaluator_name || paciente.evaluador)],
            ['Matrícula profesional', this.formatearValorInformeAnalisis(paciente.matricula_profesional || paciente.matricula)],
            ['Mano dominante', this.formatearValorInformeAnalisis(paciente.dominancia)],
            ['Formación musical', this.formatearValorInformeAnalisis(formacionMusical)],
        ]
    );

    ensureSpace(70);
    addSectionTitle('Instrumento utilizado');
    addParagraph(
        'Se administró el Protocolo de Evaluación de Sincronización Sensorio-Motora (PESSM), diseñado para evaluar la capacidad de sincronización temporal, estabilidad rítmica, adaptación dinámica y organización sensorio-motora durante tareas rítmicas estructuradas.'
    );
    addParagraph('El protocolo integra:');
    addBulletList([
        'métricas temporales objetivas derivadas del análisis computacional de asincronías,',
        'indicadores de adaptación dinámica,',
        'análisis de variabilidad temporal,',
        'observaciones clínicas musicoterapéuticas.'
    ]);
    addParagraph('Las tareas consistieron en sincronización motora con estímulos auditivos bajo diferentes condiciones experimentales:');
    addBulletList([
        'secuencias isócronas,',
        'aceleraciones graduales,',
        'desaceleraciones graduales,',
        'perturbaciones abruptas del tempo.'
    ]);
    addParagraph(
        'La adquisición de datos se realizó mediante registro computacional de eventos temporales y análisis de trackeo del movimiento.'
    );

    ensureSpace(95);
    addSectionTitle('Observaciones generales de la evaluación');
    addParagraph(
        `La evaluación se realizó en un contexto controlado y con registro computacional de respuestas motoras sincronizadas al estímulo auditivo. El paciente mantuvo una disposición (${this.obtenerValorOpcionInformeAnalisis(paciente.disposicion_durante_evaluacion, ['Óptima', 'Buena', 'Escasa'])}) y un nivel de cooperación (${this.obtenerValorOpcionInformeAnalisis(paciente.nivel_cooperacion, ['Adecuado', 'Fluctuante', 'Limitado'])}) durante la administración del protocolo. Durante la evaluación se observó:`
    );
    addTable(
        [['Aspecto observado', 'Registro clínico']],
        [
            ['Atención orientada a la tarea', this.obtenerValorOpcionInformeAnalisis(paciente.atencion_orientada_tarea, ['Estable', 'Moderada', 'Fluctuante', 'Inadecuada'])],
            ['Comprensión de consignas', this.obtenerValorOpcionInformeAnalisis(paciente.comprension_consignas, ['Adecuada', 'Moderada', 'Fluctuante', 'Inadecuada'])],
            ['Indicadores de fatiga', this.obtenerValorOpcionInformeAnalisis(paciente.indicadores_fatiga, ['Ausencia', 'Presencia leve', 'Presencia significativa'])],
            ['Regulación emocional durante la tarea', this.obtenerValorOpcionInformeAnalisis(paciente.regulacion_emocional || paciente.regulacion, ['Conservada', 'Fluctuante', 'Inestable'])],
            ['Persistencia frente a dificultades', this.obtenerValorOpcionInformeAnalisis(paciente.persistencia_dificultades, ['Adecuada', 'Parcial', 'Reducida'])],
        ]
    );
    addParagraph('Logró responder a:');
    addBulletList([
        `${tareasIzquierda} tarea(s) con mano izquierda.`,
        `${tareasDerecha} tarea(s) con mano derecha.`
    ]);
    addParagraph('Se observaron además los siguientes aspectos relevantes durante la ejecución:');
    addParagraph(this.formatearValorInformeAnalisis(paciente.observaciones_iniciales || paciente.integrated_observations));

    ensureSpace(40);
    addSectionTitle('Resultado temporal básico');

    resultados.forEach((resultado, indice) => {
        const manoNormalizada = this.normalizarManoInformeAnalisis(resultado.manoEvaluada || resultado.metadata.mano);
        const mediaAsincronia = resultado && resultado.cuantificadores && resultado.cuantificadores.temporal_basico
             ? resultado.cuantificadores.temporal_basico.asincronia_video
            : {};
        const mediaMs = mediaAsincronia && mediaAsincronia.mean_ms != null ?Number(mediaAsincronia.mean_ms) : null;
        const sigmaMs = mediaAsincronia && mediaAsincronia.std_ms != null ?Number(mediaAsincronia.std_ms) : null;
        const cvPct = this.obtenerCvInformeAnalisis(resultado);
        const etiquetaCv = this.obtenerEtiquetaCvInformeAnalisis(cvPct);

        ensureSpace(110);
        addSubsectionTitle(`Video ${indice + 1}`);
        addTable(
            [['Campo', 'Valor']],
            [
                ['Tipo de ejercicio', this.formatearValorInformeAnalisis(resultado.metadata.tipo_metronomo)],
                ['Mano utilizada', this.formatearValorInformeAnalisis(manoNormalizada)],
                ['Condición experimental', this.formatearValorInformeAnalisis(this.obtenerCondicionExperimentalInformeAnalisis(resultado))],
                ['Duración del video', this.formatearValorInformeAnalisis(resultado.video.duracion_segundos != null ?`${resultado.video.duracion_segundos} s` : null)],
                ['FPS', this.formatearValorInformeAnalisis(resultado.video.fps)],
            ]
        );

        addSubsectionTitle('Precisión perceptivo-motora y estabilidad temporal');
        addParagraph(
            'Este dominio evalúa la capacidad de sincronización básica entre el estímulo auditivo y la respuesta motora, considerando precisión temporal, estabilidad rítmica y regularidad del pulso interno.'
        );
        addTable(
            [['Cuantificador', 'Resultado', 'Valor esperado', 'Valoración clínica']],
            [
                [
                    'Asincronía media (mu)',
                    mediaMs != null ?`${this.formatearValorInformeAnalisis(mediaMs)} ms` : 'No disponible',
                    '+/- 30 ms',
                    'Sesgo temporal: negativo = anticipación; positivo = atraso.'
                ],
                [
                    'Variabilidad temporal (desvío estándar)',
                    sigmaMs != null ?`${this.formatearValorInformeAnalisis(sigmaMs)} ms` : 'No disponible',
                    '<60 ms',
                    'Inestabilidad del ritmo; mayor desvío = menor precisión temporal.'
                ],
                [
                    'Coeficiente de variación (CV)',
                    cvPct != null ?`${this.formatearValorInformeAnalisis(cvPct)} % (${etiquetaCv})` : 'No disponible',
                    'Más bajo = mayor estabilidad',
                    'Alta CV indica control motor inestable. Bajo CV indica control motor estable.'
                ],
            ],
            {
                theme: 'grid',
                columnStyles: {
                    0: { cellWidth: 46 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 38, textColor: [220, 38, 38] },
                    3: { cellWidth: 52 }
                }
            }
        );

        if (indice < resultados.length - 1) {
            ensureSpace(pageH);
        }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setDrawColor(...PRIMARY);
        doc.setLineWidth(0.3);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...MID);
        doc.text('Music Therapy Tools · Informe final consolidado', margin, pageH - 7);
        doc.text(`Página ${page} de ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' });
    }

    const fechaBase = paciente.fecha ?String(paciente.fecha).slice(0, 10) : new Date().toISOString().slice(0, 10);
    doc.save(`Informe_Evaluacion_${(paciente.nombre || 'Paciente').replace(/\s+/g, '_')}_${fechaBase}.pdf`);
};

app.generarPDF = async function (paciente) {
    if (!paciente || !this.esPacienteAdulto(paciente)) {
        return this.generarPDFLegacy(paciente);
    }

    const indexPaciente = this.obtenerIndexPacienteDesdeRegistro(paciente);
    if (indexPaciente < 0) {
        return this.generarPDFLegacy(paciente);
    }

    const resultados = await this.cargarResultadosAnalisisPaciente(indexPaciente);
    if (!resultados.length) {
        return this.generarPDFLegacy(paciente);
    }

    return this.generarInformeEvaluacionFinal(indexPaciente);
};

app.descargarPdfAnalisis = async function (resultado) {
    if (!resultado || resultado.indexPaciente == null) {
        alert('No se pudo preparar el informe final.');
        return;
    }
    await this.generarInformeEvaluacionFinal(resultado.indexPaciente);
};

app.verResultadosAnalisis = function (data, nroPista, context = {}) {
    return this.abrirResultadosAnalisis(data, nroPista, context);
};

app.cerrarAnalisisModal = function () {
    this.cerrarVisorAnalisis();
    document.getElementById('modal-analisis').classList.add('hidden');
};

const __appInitOriginal = app.init.bind(app);
app.init = function () {
    this.analisisPersistidos = this.leerAnalisisPersistidos();
    __appInitOriginal();
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (!document.getElementById('modal-analisis-visor').classList.contains('hidden')) {
                this.cerrarVisorAnalisis();
                return;
            }
            if (!document.getElementById('modal-analisis').classList.contains('hidden')) {
                this.cerrarAnalisisModal();
            }
        }
    });
};

const __verDetallePacienteOriginal = app.verDetallePaciente.bind(app);
app.obtenerMaximoVideoPermitidoBytes = function () {
    const hostname = String(window.location.hostname || '').toLowerCase();
    if (hostname && !['localhost', '127.0.0.1'].includes(hostname) && hostname.endsWith('musictherapytools.com')) {
        return MAX_VIDEO_FILE_SIZE_BYTES_PUBLIC;
    }
    return MAX_VIDEO_FILE_SIZE_BYTES;
};

app.obtenerMaximoVideoPermitidoMB = function () {
    return Math.round(this.obtenerMaximoVideoPermitidoBytes() / (1024 * 1024));
};

app.obtenerAyudaCargaVideo = function () {
    return `Cargá el video correspondiente a esta prueba. Formatos de video permitidos por el sistema. Tamaño máximo: ${this.obtenerMaximoVideoPermitidoMB()} MB.`;
};

app.validarArchivoVideo = function (file) {
    if (!file) return 'El archivo debe ser un video en un formato permitido.';
    const extensionesValidas = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'];
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    const mimeValido = String(file.type || '').startsWith('video/');
    if (!mimeValido && !extensionesValidas.includes(extension)) {
        return 'El archivo debe ser un video en un formato permitido.';
    }
    if (file.size > this.obtenerMaximoVideoPermitidoBytes()) {
        return `El video supera el tamaño máximo permitido de ${this.obtenerMaximoVideoPermitidoMB()} MB.`;
    }
    return '';
};

app.subirVideo = async function (indexPaciente, nroPista, inputFile, reemplazarExistente = false) {
    const file = inputFile.files[0];
    if (!file) return;
    if (reemplazarExistente && !confirm('Ya existe un video cargado para esta pista. ¿Querés reemplazarlo? Esta acción eliminará también el análisis previo asociado.')) {
        inputFile.value = '';
        return;
    }

    const errorArchivo = this.validarArchivoVideo(file);
    if (errorArchivo) {
        this.mostrarModalAvisoAccion({
            tipo: 'warning',
            titulo: 'No se pudo cargar este video',
            resumen: errorArchivo,
            ayuda: 'Elegí un archivo compatible y volvé a intentarlo en esta misma pista.'
        });
        inputFile.value = '';
        return;
    }

    const cell = document.getElementById(`video-cell-${nroPista}`);
    if (cell) {
        cell.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span class="text-xs text-gray-500">Subiendo...</span>
            </div>
        `;
    }

    const formData = new FormData();
    const paciente = this.pacientes[indexPaciente] || {};
    const evaluacion = Array.isArray(paciente.evaluaciones_detalladas)
         ? paciente.evaluaciones_detalladas.find(item => String(item.nro_pista) === String(nroPista))
        : null;
    if (evaluacion && evaluacion.archivo) {
        formData.append('audio_rel_path', evaluacion.archivo);
    }
    if (evaluacion && evaluacion.mano_evaluada) {
        formData.append('mano_evaluada', evaluacion.mano_evaluada);
    }
    if (paciente && (paciente.sujeto || paciente.codigo_sujeto)) {
        formData.append('codigoSujeto', paciente.sujeto || paciente.codigo_sujeto);
    }
    formData.append('video', file);

    try {
        const resp = await fetch(`${CONFIG.API_URL}/${indexPaciente}/videos/${nroPista}`, {
            method: 'POST',
            body: formData
        });

        if (resp.ok) {
            this.invalidarAnalisisPersistido(indexPaciente, nroPista);
            const p = this.pacientes[indexPaciente];
            this.renderizarAnalisisDisponibles(indexPaciente, p.evaluaciones_detalladas || []);
            await this.cargarEstadoVideos(indexPaciente, p.evaluaciones_detalladas || []);
            return;
        }

        let detalleServidor = '';
        try {
            const data = await resp.clone().json();
            detalleServidor = data.error || data.message || '';
        } catch (_) {
            try {
                detalleServidor = (await resp.text()).trim();
            } catch (_) {}
        }

        if (cell) {
            cell.innerHTML = '<span class="text-red-500 text-xs font-medium">No se pudo cargar. Reintentá.</span>';
        }

        if (resp.status === 413) {
            this.mostrarErrorAccion(
                'No se pudo cargar este video.',
                `El archivo supera el tamaño permitido para este acceso web. Desde ${window.location.hostname || 'este dominio'} el máximo es ${this.obtenerMaximoVideoPermitidoMB()} MB.`
            );
        } else {
            this.mostrarErrorAccion(
                'No se pudo cargar este video.',
                detalleServidor || 'Verificá que el archivo sea un video válido y volvé a intentarlo en esta misma pista.'
            );
        }
    } catch (error) {
        console.error("Error:", error);
        if (cell) {
            cell.innerHTML = '<span class="text-red-500 text-xs font-medium">Carga interrumpida. Reintentá.</span>';
        }
        this.mostrarErrorAccion(
            'La carga del video se interrumpio.',
            'Revisá la conexión y volvé a intentar desde esta misma fila.'
        );
    } finally {
        inputFile.value = '';
    }
};

app.renderizarAccionesPista = function (indexPaciente, pista, rutaVideo, tieneAnalisis) {
    const analizando = this.estaAnalisisEnCurso(indexPaciente, pista);
    if (!rutaVideo) {
        return `
            <label class="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold transition" title="${this.obtenerAyudaCargaVideo()}">
                <i data-lucide="upload" class="w-3.5 h-3.5"></i> Subir video
                <input type="file" accept="video/*" class="hidden" onchange="app.subirVideo(${indexPaciente}, ${pista}, this)">
            </label>
        `;
    }

    if (tieneAnalisis) {
        return `
            <div class="flex flex-wrap items-center justify-center gap-2">
                <button onclick="app.abrirAnalisisPersistido(${indexPaciente}, ${pista})" class="track-action-primary">Observaciones</button>
                <button onclick="app.descargarPdfAnalisisPersistido(${indexPaciente}, ${pista})" class="track-action-secondary">PDF</button>
                <button onclick="app.verVideo('${rutaVideo}', ${pista})" class="track-action-secondary">Video</button>
                <button onclick="app.eliminarVideo(${indexPaciente}, ${pista})" class="track-action-secondary">Eliminar</button>
            </div>
        `;
    }

    return `
        <div class="flex flex-wrap items-center justify-center gap-2">
            <button onclick="app.analizarVideo(${indexPaciente}, ${pista})" class="track-action-primary ${analizando ?'track-action-loading' : ''}" ${analizando ?'disabled aria-disabled="true"' : ''}>${analizando ?'<span class="track-inline-spinner"></span>Analizando...' : 'Analizar'}</button>
            <button onclick="app.verVideo('${rutaVideo}', ${pista})" class="track-action-secondary">Ver video</button>
            <button onclick="app.eliminarVideo(${indexPaciente}, ${pista})" class="track-action-secondary">Eliminar</button>
        </div>
    `;
};

app.verDetallePaciente = async function (index) {
    this.pacienteActual = { index, paciente: this.pacientes[index] || null };
    await __verDetallePacienteOriginal(index);
    const paciente = this.pacientes[index] || {};
    await this.cargarAnalisisDisponibles(index, paciente.evaluaciones_detalladas || []);
};

const __analizarVideoOriginal = app.analizarVideo.bind(app);
app.analizarVideo = async function (indexPaciente, nroPista) {
    const paciente = this.pacientes[indexPaciente] || {};
    if (this.esPacienteAdulto(paciente) && !this.tieneConsentimientoFirmado(paciente)) {
        this.mostrarBloqueoConsentimiento();
        return;
    }
    if (this.estaAnalisisEnCurso(indexPaciente, nroPista)) {
        return;
    }

    const evaluaciones = paciente.evaluaciones_detalladas || [];
    this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, true);
    this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
    await this.cargarEstadoVideos(indexPaciente, evaluaciones);

    const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/analizar/${nroPista}`, { method: 'POST' }).catch(() => null);
    if (!response) {
        this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
        await this.cargarEstadoVideos(indexPaciente, evaluaciones);
        this.mostrarErrorAccion(
            'No se pudo completar el análisis del video.',
            'Revisá la conexión y usá “Reintentar análisis” desde esta misma pista.'
        );
        return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
        await this.cargarEstadoVideos(indexPaciente, evaluaciones);
        this.mostrarErrorAccion(
            'No se pudo completar el análisis del video.',
            data.error || data.message || 'Intentá nuevamente. Si el problema continúa, volvé a cargar el video o revisá el consentimiento.'
        );
        return;
    }

    const evaluacion = evaluaciones.find(ev => String(ev.nro_pista) === String(nroPista)) || {};
    const resultado = this.normalizarResultadoAnalisis(data, nroPista, {
        indexPaciente,
        paciente,
        evaluacion,
        origen: 'runtime'
    });
    this.persistirResultadoAnalisis(resultado);
    this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
    this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
    await this.cargarEstadoVideos(indexPaciente, evaluaciones);
    this.adjuntarAccionesAnalisisACelda(indexPaciente, nroPista);
    this.notificarAnalisisCompletado(resultado);
};

const __analizarVideoConRecuperacion = app.analizarVideo.bind(app);
app.analizarVideo = async function (indexPaciente, nroPista) {
    const paciente = this.pacientes[indexPaciente] || {};
    if (this.esPacienteAdulto(paciente) && !this.tieneConsentimientoFirmado(paciente)) {
        this.mostrarBloqueoConsentimiento();
        return;
    }
    if (this.estaAnalisisEnCurso(indexPaciente, nroPista)) {
        return;
    }

    const evaluaciones = paciente.evaluaciones_detalladas || [];
    this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, true);
    this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
    await this.cargarEstadoVideos(indexPaciente, evaluaciones);

    const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/analizar/${nroPista}`, { method: 'POST' }).catch(() => null);
    if (!response) {
        const resultadoRecuperado = await this.esperarResultadoAnalisis(indexPaciente, nroPista);
        this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
        this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
        await this.cargarEstadoVideos(indexPaciente, evaluaciones);
        if (resultadoRecuperado) {
            this.adjuntarAccionesAnalisisACelda(indexPaciente, nroPista);
            this.notificarAnalisisCompletado(resultadoRecuperado);
            return;
        }
        this.mostrarErrorAccion(
            'No se pudo completar el análisis del video.',
            'La web perdió la conexion durante el proceso. Si el analisis tarda varios minutos, probalo desde localhost o reintenta desde esta misma pista.'
        );
        return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const resultadoRecuperado = await this.esperarResultadoAnalisis(indexPaciente, nroPista);
        this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
        this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
        await this.cargarEstadoVideos(indexPaciente, evaluaciones);
        if (resultadoRecuperado) {
            this.adjuntarAccionesAnalisisACelda(indexPaciente, nroPista);
            this.notificarAnalisisCompletado(resultadoRecuperado);
            return;
        }
        this.mostrarErrorAccion(
            'No se pudo completar el análisis del video.',
            data.error || data.message || 'Intentá nuevamente. Si el problema continúa, volvé a cargar el video o revisá el consentimiento.'
        );
        return;
    }

    const evaluacion = evaluaciones.find(ev => String(ev.nro_pista) === String(nroPista)) || {};
    const resultado = this.normalizarResultadoAnalisis(data, nroPista, {
        indexPaciente,
        paciente,
        evaluacion,
        origen: 'runtime'
    });
    this.persistirResultadoAnalisis(resultado);
    this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
    this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
    await this.cargarEstadoVideos(indexPaciente, evaluaciones);
    this.adjuntarAccionesAnalisisACelda(indexPaciente, nroPista);
    this.notificarAnalisisCompletado(resultado);
};

const __analizarVideoAsyncOriginal = app.analizarVideo.bind(app);
app.analizarVideo = async function (indexPaciente, nroPista) {
    const paciente = this.pacientes[indexPaciente] || {};
    if (this.esPacienteAdulto(paciente) && !this.tieneConsentimientoFirmado(paciente)) {
        this.mostrarBloqueoConsentimiento();
        return;
    }
    if (this.estaAnalisisEnCurso(indexPaciente, nroPista)) {
        return;
    }

    const evaluaciones = paciente.evaluaciones_detalladas || [];
    this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, true);
    this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
    await this.cargarEstadoVideos(indexPaciente, evaluaciones);

    const response = await fetch(`${CONFIG.API_URL}/${indexPaciente}/analizar/${nroPista}`, { method: 'POST' }).catch(() => null);
    if (!response) {
        this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
        await this.cargarEstadoVideos(indexPaciente, evaluaciones);
        this.mostrarErrorAccion(
            'No se pudo iniciar el analisis del video.',
            'Revisa la conexion y volve a intentarlo desde esta misma pista.'
        );
        return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok && response.status !== 202) {
        this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
        await this.cargarEstadoVideos(indexPaciente, evaluaciones);
        this.mostrarErrorAccion(
            'No se pudo iniciar el analisis del video.',
            data.error || data.message || 'Intenta nuevamente. Si el problema continua, revisa el video o el consentimiento.'
        );
        return;
    }

    const estadoFinal = await this.monitorearAnalisisServidor(indexPaciente, nroPista);
    this.actualizarEstadoAnalisisEnCurso(indexPaciente, nroPista, false);
    this.renderizarAnalisisDisponibles(indexPaciente, evaluaciones);
    await this.cargarEstadoVideos(indexPaciente, evaluaciones);

    if (estadoFinal.status === 'completed' && estadoFinal.resultado) {
        this.adjuntarAccionesAnalisisACelda(indexPaciente, nroPista);
        this.notificarAnalisisCompletado(estadoFinal.resultado);
        return;
    }

    if (estadoFinal.status === 'error') {
        this.mostrarErrorAccion(
            'No se pudo completar el análisis del video.',
            estadoFinal.message || 'Intenta nuevamente desde esta misma pista.'
        );
        return;
    }

    this.mostrarErrorAccion(
        'El analisis sigue en curso.',
        'Podés cerrar esta ventana y volver más tarde. Cuando termine, los resultados quedarán guardados en esta misma evaluación.'
    );
};

// ==========================================
// MÓDULO DEL PROTOCOLO
// ==========================================

// NUEVA FUNCIÓN: Obtiene el valor de los inputs de forma 100% segura
const obtenerValorSeguro = (id) => {
    const elemento = document.getElementById(id);
    return elemento ?elemento.value : "";
};

const protocolo = {
    // agregadoGemini
    analizarVideo: async function(pistaNumero) {
        if (!app.pacienteActual) return;
        const index = app.pacienteActual.index;
        
        alert(`Iniciando análisis de la pista ${pistaNumero} con Python. Esto demorará unos segundos...`);

        try {
            const response = await fetch(`${CONFIG.API_URL}/${index}/analizar/${pistaNumero}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                console.log("✓ RESULTADO DEL ANÁLISIS:", data);
                const metadata = data.metadata_extraida || {};
                const video = (data.analisis && data.analisis.video) || {};
                await this.mostrarModalAvisoAccion({
                    tipo: 'success',
                    titulo: `Análisis completado para la pista ${pistaNumero}`,
                    resumen: 'El resultado quedó guardado internamente para el informe final.',
                    detalles: [
                        `Archivo: ${data.archivo || 'Sin nombre'}`,
                        `Tipo: ${metadata.tipo_metronomo || 'No detectado'}`,
                        `Mano: ${metadata.mano || 'No detectada'}`,
                        `Duración: ${video.duracion_segundos ?? 'No disponible'} s`
                    ]
                });
                app.verResultadosAnalisis(data, pistaNumero);
            } else {
                const detalleTexto = app.formatearDetalleError(data);
                console.error("✖ Error del servidor:", data);
                console.error("✖ Detalle del error:", detalleTexto);
                this.mostrarErrorAccion(
                    data.error || data.message || 'No se pudo completar el análisis del video.',
                    detalleTexto
                );
            }
        } catch (error) {
            console.error("Error al analizar:", error);
            this.mostrarErrorAccion(
                'No se pudo conectar con el servidor para analizar el video.',
                'Revisá la conexión y volvé a intentarlo en unos segundos.'
            );
        }
    }, // hasta aca
    pasoActual: 1,
    playlistFinal: [],
    indiceAudioActual: 0,
    resultadosPistas: [],
    checklistPorPaso: {
        1: ['paso-1-materiales', 'paso-1-espacio'],
        2: ['paso-2-preparacion']
    },

    obtenerCheckboxesChecklist: function (blockId) {
        return Array.from(document.querySelectorAll(`#${blockId} input[type="checkbox"]`));
    },

    checklistBloqueCompleto: function (blockId) {
        const checkboxes = this.obtenerCheckboxesChecklist(blockId);
        return checkboxes.length > 0 && checkboxes.every(checkbox => checkbox.checked);
    },

    checklistPasoCompleto: function (numeroPaso) {
        const bloques = this.checklistPorPaso[numeroPaso] || [];
        return bloques.length > 0 && bloques.every(blockId => this.checklistBloqueCompleto(blockId));
    },

    actualizarTextoToggleChecklist: function (blockId) {
        const boton = document.getElementById(`toggle-${blockId}`);
        if (!boton) return;
        boton.textContent = this.checklistBloqueCompleto(blockId) ?'Desmarcar todos' : 'Marcar todos';
    },

    actualizarEstadoChecklistPaso: function (numeroPaso) {
        const boton = document.getElementById(`btn-paso-${numeroPaso}-siguiente`);
        const ayuda = document.getElementById(`ayuda-paso-${numeroPaso}-checklist`);
        const completo = this.checklistPasoCompleto(numeroPaso);

        if (boton) {
            boton.disabled = !completo;
        }
        if (ayuda) {
            ayuda.classList.toggle('hidden', completo);
        }

        (this.checklistPorPaso[numeroPaso] || []).forEach(blockId => this.actualizarTextoToggleChecklist(blockId));
    },

    actualizarEstadoChecklistAdulto: function () {
        this.actualizarEstadoChecklistPaso(1);
        this.actualizarEstadoChecklistPaso(2);
    },

    inicializarChecklistAdulto: function () {
        Object.values(this.checklistPorPaso).flat().forEach(blockId => {
            this.obtenerCheckboxesChecklist(blockId).forEach(checkbox => {
                const actualizar = () => this.actualizarEstadoChecklistAdulto();
                checkbox.onchange = actualizar;
                checkbox.addEventListener('change', actualizar);
                checkbox.addEventListener('input', actualizar);
            });
        });
        this.actualizarEstadoChecklistAdulto();
    },

    toggleChecklistBlock: function (blockId) {
        const checkboxes = this.obtenerCheckboxesChecklist(blockId);
        if (!checkboxes.length) return;
        const marcarTodos = !this.checklistBloqueCompleto(blockId);
        checkboxes.forEach(checkbox => {
            checkbox.checked = marcarTodos;
        });
        this.actualizarEstadoChecklistAdulto();
    },

    validarChecklistPaso: function (numeroPaso) {
        if (this.checklistPasoCompleto(numeroPaso)) return true;
        this.actualizarEstadoChecklistPaso(numeroPaso);
        alert('Para continuar, completa todos los ítems del checklist.');
        return false;
    },

    irPaso: function (numeroPaso) {
        if (this.pasoActual === 1 && numeroPaso === 2 && !this.validarChecklistPaso(1)) {
            return;
        }
        if (this.pasoActual === 2 && numeroPaso === 3 && !this.validarChecklistPaso(2)) {
            return;
        }
        if (this.pasoActual === 3 && numeroPaso === 4) {
            if (!app.validarFormularioAdulto()) {
                return;
            }
        }
        document.querySelectorAll('.paso-container').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('block');
        });

        document.getElementById(`paso-${numeroPaso}`).classList.remove('hidden');
        document.getElementById(`paso-${numeroPaso}`).classList.add('block');

        for (let i = 1; i <= 4; i++) {
            const ind = document.getElementById(`ind-paso-${i}`);
            if (ind) {
                ind.className = (i <= numeroPaso) ?"text-primary border-b-2 border-primary pb-1 font-bold transition-all" : "text-gray-400 font-medium transition-all";
            }
        }
        this.pasoActual = numeroPaso;
    },

    reiniciar: function () {
        const form = document.getElementById('evaluationFormMedicion');
        if (form) form.reset();

        this.inicializarChecklistAdulto();

        this.irPaso(1);
        this.playlistFinal = [];
        this.indiceAudioActual = 0;
        this.resultadosPistas = [];

        const zonaRep = document.getElementById('zona-reproductor');
        if (zonaRep) zonaRep.classList.add('hidden');

        const btnGen = document.getElementById('btn-generar-playlist');
        if (btnGen) btnGen.classList.remove('hidden');

        const btnSiguiente = document.getElementById('btn-siguiente-audio');
        if (btnSiguiente) {
            btnSiguiente.disabled = false;
            btnSiguiente.classList.remove('opacity-50', 'cursor-not-allowed');
            btnSiguiente.innerHTML = 'Guardar y Siguiente Pista <i data-lucide="skip-forward" class="w-5 h-5"></i>';
        }

        const btnAnterior = document.getElementById('btn-audio-anterior');
        if (btnAnterior) btnAnterior.disabled = true;

        this.detenerAudioActual();
        const audioPlayer = document.getElementById('stimulusAudioPlayer');
        if (audioPlayer) audioPlayer.src = '';
    },

    obtenerReproductorAudio: function () {
        return document.getElementById('stimulusAudioPlayer');
    },

    detenerAudioActual: function () {
        const reproductor = this.obtenerReproductorAudio();
        if (!reproductor) return;
        reproductor.pause();
        try {
            reproductor.currentTime = 0;
        } catch (error) {
            console.warn('No se pudo reiniciar el audio actual.', error);
        }
        reproductor.playbackRate = 1;
    },

    actualizarControlesDeAudio: function () {
        const btnAnterior = document.getElementById('btn-audio-anterior');
        if (btnAnterior) {
            btnAnterior.disabled = this.indiceAudioActual <= 0 || !this.playlistFinal.length;
        }
    },

    obtenerEvaluaciónPistaActual: function () {
        const itemActual = this.playlistFinal[this.indiceAudioActual];
        if (!itemActual) return null;
        return {
            nro_pista: this.indiceAudioActual + 1,
            archivo: itemActual.archivo,
            mano_evaluada: itemActual.mano,
            rhythm_identification: obtenerValorSeguro('skill-rhythm') || "No evaluado",
            tempo_variations: obtenerValorSeguro('skill-tempo') || "No evaluado",
            rhythmic_accuracy: obtenerValorSeguro('skill-accuracy') || "No evaluado"
        };
    },

    guardarEvaluaciónPistaActual: function () {
        const pistaEvaluada = this.obtenerEvaluaciónPistaActual();
        if (!pistaEvaluada) return null;
        const indiceExistente = this.resultadosPistas.findIndex(item => Number(item.nro_pista) === Number(pistaEvaluada.nro_pista));
        if (indiceExistente >= 0) {
            this.resultadosPistas[indiceExistente] = pistaEvaluada;
        } else {
            this.resultadosPistas.push(pistaEvaluada);
        }
        this.resultadosPistas.sort((a, b) => Number(a.nro_pista) - Number(b.nro_pista));
        return pistaEvaluada;
    },

    restaurarEvaluaciónPistaActual: function () {
        const evaluacionGuardada = this.resultadosPistas.find(item => Number(item.nro_pista) === Number(this.indiceAudioActual + 1));
        const sr = document.getElementById('skill-rhythm');
        const st = document.getElementById('skill-tempo');
        const sa = document.getElementById('skill-accuracy');

        if (sr) sr.value = evaluacionGuardada?.rhythm_identification || "No evaluado";
        if (st) st.value = evaluacionGuardada?.tempo_variations || "No evaluado";
        if (sa) sa.value = evaluacionGuardada?.rhythmic_accuracy || "No evaluado";
        this.actualizarEstadoTempoVariations();
    },

    generarBloque13: function (manoDesignada) {
        let bloque = [];
        ESTRUCTURA_DE_AUDIOS.isocronos.forEach(audio => bloque.push({ archivo: audio, mano: manoDesignada }));
        ESTRUCTURA_DE_AUDIOS.abruptos.forEach(subcategoria => {
            const elegido = subcategoria[Math.floor(Math.random() * subcategoria.length)];
            bloque.push({ archivo: elegido, mano: manoDesignada });
        });
        ESTRUCTURA_DE_AUDIOS.rampa.forEach(subcategoria => {
            const elegido = subcategoria[Math.floor(Math.random() * subcategoria.length)];
            bloque.push({ archivo: elegido, mano: manoDesignada });
        });
        return bloque.sort(() => Math.random() - 0.5);
    },

    generarPlaylistCompleta: function () {
        try {
            const manoInicio = obtenerValorSeguro('dat-mano-inicio');
            if (!manoInicio) {
                alert('Antes de generar los audios, selecciona la mano que inicia la prueba.');
                return;
            }

            const otraMano = (manoInicio === 'Derecha') ?'Izquierda' : 'Derecha';

            const bloque1 = this.generarBloque13(manoInicio);
            const bloque2 = this.generarBloque13(otraMano);

            this.playlistFinal = [...bloque1, ...bloque2];
            this.indiceAudioActual = 0;
            this.resultadosPistas = [];

            if (!this.playlistFinal.length) {
                alert('No se pudieron generar los audios de la sesión. Intentá nuevamente.');
                return;
            }

            document.getElementById('zona-reproductor').classList.remove('hidden');
            document.getElementById('btn-generar-playlist').classList.add('hidden');

            this.cargarAudioActual(false);
            this.actualizarControlesDeAudio();
        } catch (error) {
            console.error('Error al generar la sesión de audios:', error);
            alert('No se pudieron generar los audios de la sesión. Intentá nuevamente.');
        }
    },

    cargarAudioActual: function (autoplay = true) {
        const itemActual = this.playlistFinal[this.indiceAudioActual];

        const nombreLimpio = itemActual.archivo.split('/').pop();
        document.getElementById('nombre-audio-actual').textContent = nombreLimpio;
        document.getElementById('contador-audio').textContent = this.indiceAudioActual + 1;

        const btnSiguiente = document.getElementById('btn-siguiente-audio');
        if (btnSiguiente) {
            btnSiguiente.disabled = false;
            btnSiguiente.classList.remove('opacity-50', 'cursor-not-allowed');
            btnSiguiente.innerHTML = 'Guardar y Siguiente Pista <i data-lucide="skip-forward" class="w-5 h-5"></i>';
        }

        const indicador = document.getElementById('indicador-mano');
        indicador.textContent = itemActual.mano.toUpperCase();
        indicador.className = itemActual.mano === 'Derecha'
             ?"text-4xl font-black text-blue-600 tracking-wider"
            : "text-4xl font-black text-green-600 tracking-wider";

        const reproductor = document.getElementById('stimulusAudioPlayer');
        this.detenerAudioActual();

        let rutaSegura = `audios/${itemActual.archivo}`;
        rutaSegura = encodeURI(rutaSegura).replace(/\+/g, '%2B');

        reproductor.src = rutaSegura;
        reproductor.load();
        reproductor.playbackRate = 1;
        this.actualizarEstadoTempoVariations();
        this.actualizarControlesDeAudio();
        lucide.createIcons();

        if (autoplay) {
            reproductor.play().catch(e => console.log("El navegador requiere interacción previa.", e));
        }
    },

    audioActualEsIsocrono: function () {
        const itemActual = this.playlistFinal[this.indiceAudioActual];
        if (!itemActual || !itemActual.archivo) return false;

        const archivoNormalizado = String(itemActual.archivo)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        return archivoNormalizado.includes('isocrono') || ESTRUCTURA_DE_AUDIOS.isocronos.includes(itemActual.archivo);
    },

    actualizarEstadoTempoVariations: function () {
        const selectTempo = document.getElementById('skill-tempo');
        if (!selectTempo) return;

        const esIsocrono = this.audioActualEsIsocrono();
        if (esIsocrono) {
            selectTempo.value = 'No evaluado';
        }

        selectTempo.disabled = esIsocrono;
        selectTempo.classList.toggle('bg-gray-100', esIsocrono);
        selectTempo.classList.toggle('text-gray-400', esIsocrono);
        selectTempo.classList.toggle('cursor-not-allowed', esIsocrono);
        selectTempo.classList.toggle('opacity-80', esIsocrono);
        selectTempo.classList.toggle('bg-white', !esIsocrono);
        selectTempo.title = esIsocrono ?'Tempo Variations no aplica en audios isocronos.' : '';
    },

    validarEvaluaciónPistaActual: function () {
        const rhythm = document.getElementById('skill-rhythm');
        const tempo = document.getElementById('skill-tempo');
        const accuracy = document.getElementById('skill-accuracy');
        const camposPendientes = [];

        if (rhythm && (!rhythm.value || rhythm.value === 'No evaluado')) {
            camposPendientes.push(rhythm);
        }

        if (!this.audioActualEsIsocrono() && tempo && (!tempo.value || tempo.value === 'No evaluado')) {
            camposPendientes.push(tempo);
        }

        if (accuracy && (!accuracy.value || accuracy.value === 'No evaluado')) {
            camposPendientes.push(accuracy);
        }

        [rhythm, tempo, accuracy].filter(Boolean).forEach(campo => {
            campo.classList.remove('border-red-400', 'ring-2', 'ring-red-200');
        });

        if (camposPendientes.length > 0) {
            camposPendientes.forEach(campo => {
                campo.classList.add('border-red-400', 'ring-2', 'ring-red-200');
            });
            camposPendientes[0].focus();
            alert('Antes de avanzar a la siguiente pista, completá todos los campos de evaluación obligatorios.');
            return false;
        }

        return true;
    },

    siguienteAudio: function () {
        if (!this.validarEvaluaciónPistaActual()) {
            return;
        }
        this.guardarEvaluaciónPistaActual();
        this.detenerAudioActual();

        if (this.indiceAudioActual < this.playlistFinal.length - 1) {
            this.indiceAudioActual++;
            this.cargarAudioActual(true);

            this.restaurarEvaluaciónPistaActual();
        } else {
            this.actualizarControlesDeAudio();
            document.getElementById('contador-audio').textContent = "26";
            document.getElementById('nombre-audio-actual').textContent = "BATERÍA COMPLETADA";

            const btnSiguiente = document.getElementById('btn-siguiente-audio');
            btnSiguiente.disabled = true;
            btnSiguiente.classList.add('opacity-50', 'cursor-not-allowed');
            btnSiguiente.innerHTML = 'Evaluación Finalizada <i data-lucide="check-circle" class="w-5 h-5"></i>';
            lucide.createIcons();

            alert("¡Excelente! Has completado la evaluación de los 26 audios. Haz clic en 'Finalizar y Guardar Sesión Completa'.");
        }
    },

    anteriorAudio: function () {
        if (!Array.isArray(this.playlistFinal) || !this.playlistFinal.length || this.indiceAudioActual <= 0) {
            return;
        }
        this.detenerAudioActual();
        this.indiceAudioActual--;
        this.cargarAudioActual(false);
        this.restaurarEvaluaciónPistaActual();
    },

    guardarEvaluación: async function (evento) {
        evento.preventDefault();
        this.detenerAudioActual();
        if (!app.validarFormularioAdulto()) {
            return;
        }

        if (this.resultadosPistas.length < this.playlistFinal.length) {
            const confirmar = confirm(`Has evaluado ${this.resultadosPistas.length} de ${this.playlistFinal.length} pistas. ¿Seguro que deseas guardar la sesion incompleta?`);
            if (!confirmar) return;
        }

        // USO DE LA FUNCIÓN SEGURA PARA EVITAR CRASHES
        const datosCompletos = {
            fecha: obtenerValorSeguro('dat-fecha') || new Date().toISOString(),
            nombre: obtenerValorSeguro('dat-nombre'),
            email: obtenerValorSeguro('dat-email'),
            medicacion: obtenerValorSeguro('dat-medicacion'),
            psicopatologia: obtenerValorSeguro('dat-psicopatologia'),
            diagnostico: obtenerValorSeguro('dat-diagnostico'),
            fecha_nacimiento: obtenerValorSeguro('dat-fecha-nacimiento'),
            edad: obtenerValorSeguro('dat-edad'),
            formacion_musical_anios: obtenerValorSeguro('dat-formacion-musical-anios'),
            tipo_formacion_musical: obtenerValorSeguro('dat-tipo-formacion-musical'),
            modalidad_formacion_musical: obtenerValorSeguro('dat-modalidad-formacion-musical'),
            dominancia: obtenerValorSeguro('dat-dominancia'),
            tipo_registro: 'adulto',
            manoInicio: obtenerValorSeguro('dat-mano-inicio'),
            medidasManos: {
                md_mayor: obtenerValorSeguro('dat-mano-md-mayor'),
                md_indice: obtenerValorSeguro('dat-mano-md-indice'),
                mi_mayor: obtenerValorSeguro('dat-mano-mi-mayor'),
                mi_indice: obtenerValorSeguro('dat-mano-mi-indice')
            },
            evaluaciones_detalladas: this.resultadosPistas
        };
        const nombreNormalizado = app.normalizarTextoPaciente(datosCompletos.nombre);
        const fechaNormalizada = String(datosCompletos.fecha || '').slice(0, 10);
        const existeSimilar = app.pacientes.some(paciente =>
            app.esPacienteAdulto(paciente) &&
            app.normalizarTextoPaciente(paciente.nombre) === nombreNormalizado &&
            String(paciente.fecha || '').slice(0, 10) === fechaNormalizada
        );
        if (existeSimilar && !confirm('Ya existe un paciente o evaluación con nombre y fecha similares. Revisá antes de continuar. ¿Querés guardar igual?')) {
            return;
        }

        try {
            const respuesta = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCompletos)
            });

            if (respuesta.ok) {
                alert("Evaluación clínica guardada con éxito en el servidor.");
                app.resetearFormularioAdultoModificado();
                app.origenEvaluaciónAdulto = null;
                app.cambiarVista('pacientes');
            } else {
                this.mostrarErrorAccion(
                    'No se pudo guardar la evaluación clínica.',
                    'Revisa los datos cargados e intenta nuevamente.'
                );
            }
        } catch (error) {
            console.error("Error al conectar:", error);
            this.mostrarErrorAccion(
                'No se pudo guardar la evaluación clínica por un problema de conexión.',
                'Revisa la conexión con el servidor e intenta nuevamente.'
            );
        }
    }
};

protocolo.analizarVideo = async function (pistaNumero) {
    if (!app.pacienteActual || app.pacienteActual.index == null) {
        alert('No hay un paciente activo asociado para ejecutar este análisis.');
        return;
    }
    await app.analizarVideo(app.pacienteActual.index, pistaNumero);
};

app.obtenerClaseValorClinico = function (valor) {
    if (!valor || valor === 'No evaluado') return 'track-clinical-empty';
    if (valor === 'Consistente') return 'track-clinical-good';
    if (valor === 'Rara vez') return 'track-clinical-mid';
    return 'track-clinical-bad';
};

app.renderizarBadgeClinico = function (valor) {
    const texto = valor || 'No evaluado';
    return `<span class="track-clinical-badge ${this.obtenerClaseValorClinico(texto)}">${texto}</span>`;
};

app.obtenerResultadoAnalisisPista = function (indexPaciente, nroPista) {
    return this.analisisPersistidos[this.crearClaveAnalisis(indexPaciente, nroPista)] || null;
};

app.renderizarResumenOperativoModal = function (indexPaciente, evals, videos) {
    let contenedor = document.getElementById('modal-resumen-operativo');
    const host = document.querySelector('#modal-detalle .overflow-x-auto');
    if (!host) return;

    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'modal-resumen-operativo';
        contenedor.className = 'flex flex-wrap gap-2 mb-4';
        host.parentNode.insertBefore(contenedor, host);
    }

    const total = (evals || []).length;
    const videosCargados = Object.keys(videos || {}).length;
    const analizados = (evals || []).filter(ev => this.obtenerResultadoAnalisisPista(indexPaciente, ev.nro_pista)).length;
    const pendientes = total - videosCargados;

    contenedor.innerHTML = `
        <span class="track-summary-pill">${total} pistas</span>
        <span class="track-summary-pill">${videosCargados} videos cargados</span>
        <span class="track-summary-pill">${analizados} análisis listos</span>
        <span class="track-summary-pill">${pendientes} pendientes</span>
    `;
};

app.configurarTablaOperativaModal = function () {
    const bloqueAnalisis = document.getElementById('modal-analisis-disponibles');
    if (bloqueAnalisis && bloqueAnalisis.parentElement) {
        bloqueAnalisis.parentElement.style.display = 'none';
    }

    const thead = document.querySelector('#modal-detalle table thead tr');
    if (!thead) return;

    thead.innerHTML = `
        <th class="w-12">N°</th>
        <th class="w-20">Mano</th>
        <th>Archivo audio</th>
        <th>Ritmo</th>
        <th>Tempo</th>
        <th>Precisión</th>
        <th class="w-36 text-center">Estado</th>
        <th class="w-64 text-center">Acciones</th>
    `;
};

app.renderizarEstadoPista = function ({ tieneVideo, tieneAnalisis, analizando }) {
    const badges = [];
    if (!tieneVideo) {
        badges.push('<span class="track-state-badge track-state-empty">Sin video</span>');
    } else {
        badges.push('<span class="track-state-badge track-state-video">Video cargado</span>');
    }
    if (analizando) {
        badges.push('<span class="track-state-badge track-state-processing"><span class="track-inline-spinner"></span>Analizando</span>');
    }
    if (tieneAnalisis) {
        badges.push('<span class="track-state-badge track-state-analysis">Analizado</span>');
        badges.push('<span class="track-state-badge track-state-pdf">PDF disponible</span>');
    }
    return `<div class="flex flex-wrap items-center justify-center gap-1">${badges.join('')}</div>`;
};

app.renderizarAccionesPista = function (indexPaciente, pista, rutaVideo, tieneAnalisis) {
    const analizando = this.estaAnalisisEnCurso(indexPaciente, pista);
    if (!rutaVideo) {
        return `
            <label class="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold transition" title="Cargá el video correspondiente a esta prueba. Formatos de video permitidos por el sistema.">
                <i data-lucide="upload" class="w-3.5 h-3.5"></i> Subir video
                <input type="file" accept="video/*" class="hidden" onchange="app.subirVideo(${indexPaciente}, ${pista}, this)">
            </label>
        `;
    }

    if (tieneAnalisis) {
        const resultado = this.obtenerResultadoAnalisisPista(indexPaciente, pista);
        const botonResultados = this.tieneCuantificadoresAnalisis(resultado)
            ? `<button onclick="app.verResultadosVideo(${indexPaciente}, ${pista})" class="track-action-secondary" title="Ver resultados" aria-label="Ver resultados de la pista ${pista}">Resultados</button>`
            : '';
        return `
            <div class="flex flex-wrap items-center justify-center gap-2">
                <button onclick="app.analizarVideo(${indexPaciente}, ${pista})" class="track-action-primary">Reanalizar</button>
                ${botonResultados}
                <button onclick="app.verVideo('${rutaVideo}', ${pista})" class="track-action-secondary">Video</button>
                <button onclick="app.eliminarVideo(${indexPaciente}, ${pista})" class="track-action-secondary">Eliminar</button>
            </div>
        `;
    }

    return `
        <div class="flex flex-wrap items-center justify-center gap-2">
            <button onclick="app.analizarVideo(${indexPaciente}, ${pista})" class="track-action-primary ${analizando ?'track-action-loading' : ''}" ${analizando ?'disabled aria-disabled="true"' : ''}>${analizando ?'<span class="track-inline-spinner"></span>Analizando...' : 'Analizar'}</button>
            <button onclick="app.verVideo('${rutaVideo}', ${pista})" class="track-action-secondary">Ver video</button>
            <button onclick="app.eliminarVideo(${indexPaciente}, ${pista})" class="track-action-secondary">Eliminar</button>
        </div>
    `;
};

app.verDetallePaciente = async function (index) {
    const p = this.pacientes[index];
    if (!p) return;
    this._modalPacienteIndex = index;
    this.pacienteActual = { index, paciente: p };

    document.getElementById('modal-titulo').textContent = p.nombre || 'Paciente';
        document.getElementById('modal-subtitulo').textContent =
            `${p.diagnostico || ''} · ${p.dominancia || ''} · ${p.fecha ?this.formatearFechaPaciente(p.fecha) : ''}`;

    const infoDiv = document.getElementById('modal-info');
    infoDiv.innerHTML = `
        <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Investigador</span><span class="font-semibold text-gray-800">${p.investigador || 'N/A'}</span></div>
        <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Mano hábil</span><span class="font-semibold text-gray-800">${p.dominancia || 'N/A'}</span></div>
        <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Mano Inicio</span><span class="font-semibold text-gray-800">${p.manoInicio || 'N/A'}</span></div>
        <div class="bg-white px-3 py-2 rounded-lg border"><span class="text-gray-500 text-xs block">Medicación</span><span class="font-semibold text-gray-800">${p.medicacion || 'Ninguna'}</span></div>
    `;

    this.configurarTablaOperativaModal();

    const tbody = document.getElementById('modal-tabla-body');
    tbody.innerHTML = '';

    const evals = p.evaluaciones_detalladas || [];
    evals.forEach(ev => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors";
        tr.innerHTML = `
            <td class="text-center font-bold text-primary">${ev.nro_pista}</td>
            <td class="text-center"><span class="px-2 py-0.5 rounded text-xs font-bold ${ev.mano_evaluada === 'Derecha' ?'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">${ev.mano_evaluada}</span></td>
            <td class="text-xs font-mono text-gray-600 break-all max-w-[220px]">${ev.archivo.split('/').pop()}</td>
            <td class="text-center text-sm">${this.renderizarBadgeClinico(ev.rhythm_identification)}</td>
            <td class="text-center text-sm">${this.renderizarBadgeClinico(ev.tempo_variations)}</td>
            <td class="text-center text-sm">${this.renderizarBadgeClinico(ev.rhythmic_accuracy)}</td>
            <td class="text-center align-middle" id="status-cell-${ev.nro_pista}">
                <span class="text-gray-400 text-xs">Cargando...</span>
            </td>
            <td class="text-center align-middle" id="video-cell-${ev.nro_pista}">
                <span class="text-gray-400 text-xs">Cargando...</span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('modal-detalle').classList.remove('hidden');
    lucide.createIcons();

    await this.precargarAnalisisDisponiblesPaciente(index, evals);
    await this.cargarEstadoVideos(index, evals);
};

app.cargarEstadoVideos = async function (index, evals) {
    try {
        const resp = await fetch(`${CONFIG.API_URL}/${index}/videos`);
        const data = await resp.json();
        const videos = data.videos || {};
        let countVideos = 0;

        evals.forEach(ev => {
            const pista = ev.nro_pista;
            const rutaVideo = videos[pista];
            const tieneVideo = Boolean(rutaVideo);
            const tieneAnalisis = Boolean(this.obtenerResultadoAnalisisPista(index, pista));
            const analizando = this.estaAnalisisEnCurso(index, pista);
            const cell = document.getElementById(`video-cell-${pista}`);
            const statusCell = document.getElementById(`status-cell-${pista}`);

            if (tieneVideo) countVideos++;
            if (statusCell) statusCell.innerHTML = this.renderizarEstadoPista({ tieneVideo, tieneAnalisis, analizando });
            if (cell) cell.innerHTML = this.renderizarAccionesPista(index, pista, rutaVideo, tieneAnalisis);
        });

        document.getElementById('modal-contador-videos').textContent = `${countVideos} de ${evals.length} videos`;
        this.renderizarResumenOperativoModal(index, evals, videos);
        lucide.createIcons();
    } catch (error) {
        console.error("Error cargando videos:", error);
    }
};

app.cargarAnalisisDisponibles = async function (indexPaciente, evals) {
    await this.precargarAnalisisDisponiblesPaciente(indexPaciente, evals);
};

app.calcularResumenHome = function () {
    const pacientes = Array.isArray(this.pacientes) ?this.pacientes : [];
    const grupos = Array.isArray(this.pacientesAgrupados) && this.pacientesAgrupados.length
         ?this.pacientesAgrupados
        : this.agruparPacientes(pacientes);
    const totalPacientes = grupos.length;
    const evaluacionesEnCurso = grupos.filter(grupo =>
        Array.isArray(grupo.registros) &&
        grupo.registros.some(registro => Array.isArray(registro.evaluaciones_detalladas) && registro.evaluaciones_detalladas.length > 0)
    ).length;
    const analisisPendientes = 0;
    const analisisListos = 0;

    return [
        `${evaluacionesEnCurso} evaluaciones en curso`,
        `${totalPacientes} pacientes registrados`,
        `${analisisPendientes} análisis pendientes`,
        `${analisisListos} análisis listos`
    ].slice(0, 2);
};

app.obtenerItemsContinuarTrabajo = function () {
    const pacientes = (this.pacientes || [])
        .map((paciente, index) => ({ paciente, index }))
        .sort((a, b) => new Date(b.paciente.fecha || 0) - new Date(a.paciente.fecha || 0));

    const items = [];

    pacientes.slice(0, 3).forEach(({ paciente, index }) => {
        items.push({
            key: `paciente-${index}`,
            titulo: paciente.nombre || 'Paciente',
            subtitulo: 'Paciente reciente',
            estado: paciente.diagnostico || 'Sin diagnóstico',
            accion: 'Abrir',
            handler: `app.abrirPacienteDesdeHome(${index})`
        });
    });

    pacientes.forEach(({ paciente, index }) => {
        const evals = Array.isArray(paciente.evaluaciones_detalladas) ?paciente.evaluaciones_detalladas : [];
        if (!evals.length || items.length >= 6) return;
        const analizados = evals.filter(ev => this.obtenerResultadoAnalisisPista(index, ev.nro_pista)).length;
        items.push({
            key: `curso-${index}`,
            titulo: paciente.nombre || 'Paciente',
            subtitulo: 'Evaluación en curso',
            estado: `${analizados} de ${evals.length} análisis disponibles`,
            accion: 'Continuar',
            handler: `app.abrirPacienteDesdeHome(${index})`
        });
    });

    return items.slice(0, 6);
};

app.obtenerPacientesRecientesHome = function () {
    const grupos = Array.isArray(this.pacientesAgrupados) && this.pacientesAgrupados.length
         ?this.pacientesAgrupados
        : this.agruparPacientes(this.pacientes || []);

    return [...grupos]
        .sort((a, b) => (b.timestampUltimaActividad || 0) - (a.timestampUltimaActividad || 0))
        .slice(0, 6)
        .map((grupo) => {
            const identificador = grupo.email || grupo.diagnostico || `Última actividad: ${this.formatearFechaPaciente(grupo.fechaUltimaActividad)}`;
            const evaluacionesTexto = grupo.cantidadEvaluaciónes > 0
                 ? `${grupo.cantidadEvaluaciónes} evaluación(es) registradas`
                : 'Sin evaluaciones';
            const registroEstado = grupo.ultimoConActividad || grupo.ultimo || {};
            const tieneEvaluaciónes = Array.isArray(registroEstado.evaluaciones_detalladas) && registroEstado.evaluaciones_detalladas.length > 0;
            const estado = tieneEvaluaciónes ?this.obtenerEstadoEvaluaciónRegistro(registroEstado) : '';

            return {
                key: grupo.clave,
                titulo: grupo.nombre || 'Paciente',
                identificador,
                evaluacionesTexto,
                estado,
                fechaActividad: this.formatearFechaPaciente(grupo.fechaUltimaActividad),
                handler: `app.abrirFichaPacientePorClave('${encodeURIComponent(grupo.clave)}')`
            };
        });
};

app.renderizarInicioPanel = function () {
    const resumen = document.getElementById('home-resumen');
    const trabajo = document.getElementById('home-continuar-trabajo');
    if (!resumen || !trabajo) return;

    resumen.innerHTML = this.calcularResumenHome().map(item => `
        <span class="track-summary-pill">${item}</span>
    `).join('');

    const items = this.obtenerPacientesRecientesHome();
    if (!items.length) {
        trabajo.innerHTML = `
            <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                No hay pacientes recientes para mostrar.
            </div>
        `;
        return;
    }

    trabajo.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${items.map(item => `
                <article class="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div class="min-w-0">
                        <p class="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">Paciente reciente</p>
                        <h4 class="text-base font-semibold text-slate-800 mt-1 truncate">${item.titulo}</h4>
                        <p class="text-sm text-slate-500 mt-1 truncate">${item.identificador}</p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <span class="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">${item.evaluacionesTexto}</span>
                            ${item.estado ?`<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">${item.estado}</span>` : ''}
                            <span class="inline-flex items-center rounded-full bg-slate-200/70 px-2.5 py-1 text-xs font-medium text-slate-600">Actividad ${item.fechaActividad}</span>
                        </div>
                    </div>
                    <button onclick="${item.handler}" class="track-action-secondary">Abrir paciente</button>
                </article>
            `).join('')}
        </div>
    `;
};

app.abrirPacienteDesdeHome = function (index) {
    this.cambiarVista('pacientes');
    setTimeout(() => this.verDetallePaciente(index), 0);
};

app.obtenerPacientesRecientesHome = function () {
    const grupos = Array.isArray(this.pacientesAgrupados) && this.pacientesAgrupados.length
         ?this.pacientesAgrupados
        : this.agruparPacientes(this.pacientes || []);

    return [...grupos]
        .sort((a, b) => (b.timestampUltimaActividad || 0) - (a.timestampUltimaActividad || 0))
        .slice(0, 6)
        .map((grupo) => ({
            key: grupo.clave,
            titulo: grupo.nombre || 'Paciente',
            evaluacionesTexto: grupo.cantidadEvaluaciónes === 1
                 ?'1 evaluacion'
                : grupo.cantidadEvaluaciónes > 1
                     ?`${grupo.cantidadEvaluaciónes} evaluaciones`
                    : 'Sin evaluaciones',
            fechaActividad: this.formatearFechaPaciente(grupo.fechaUltimaActividad),
            handler: `app.abrirFichaPacientePorClave('${encodeURIComponent(grupo.clave)}')`
        }));
};

app.renderizarInicioPanel = function () {
    const resumen = document.getElementById('home-resumen');
    const trabajo = document.getElementById('home-continuar-trabajo');
    if (!resumen || !trabajo) return;

    const subtitulo = trabajo.previousElementSibling.querySelector('p');
    if (subtitulo) {
        subtitulo.textContent = 'Últimos pacientes con actividad';
    }

    resumen.innerHTML = this.calcularResumenHome().map(item => `
        <span class="track-summary-pill">${item}</span>
    `).join('');

    const items = this.obtenerPacientesRecientesHome();
    if (!items.length) {
        trabajo.innerHTML = `
            <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                No hay pacientes recientes para mostrar.
            </div>
        `;
        return;
    }

    trabajo.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${items.map(item => `
                <article class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                    <div class="min-w-0">
                        <h4 class="text-base font-semibold text-slate-800 truncate">${item.titulo}</h4>
                        <p class="text-sm text-slate-500 mt-1">Última actividad: ${item.fechaActividad}</p>
                        <p class="text-sm text-slate-500 mt-1">${item.evaluacionesTexto}</p>
                    </div>
                    <button onclick="${item.handler}" class="track-action-secondary">Abrir</button>
                </article>
            `).join('')}
        </div>
    `;
};

app.abrirPacienteNinoDesdeRegistro = function (index) {
    this.bnpmPacienteSeleccionadoA = String(index);
    this.bnpmPacienteSeleccionadoB = String(index);
    this.cambiarVista('evaluacion-nino');
};

const __appVerificarConexionOriginal = app.verificarConexion.bind(app);
app.verificarConexion = async function () {
    await __appVerificarConexionOriginal();
    this.renderizarInicioPanel();
};

const __appCambiarVistaOriginal = app.cambiarVista.bind(app);
app.cambiarVista = function (vistaId) {
    __appCambiarVistaOriginal(vistaId);
    if (vistaId === 'inicio') {
        this.renderizarInicioPanel();
    }
};

const BNPM_STORAGE_KEY = 'neuroMusicaBNPMV1';
const BNPM_FREQUENCY_OPTIONS = ['Nunca', 'Raramente', 'A veces', 'Frecuentemente', 'Siempre'];
const BNPM_SCALE_04 = ['0', '1', '2', '3', '4'];
const BNPM_SCALE_15 = ['1', '2', '3', '4', '5'];

const BNPM_MODULE_A_SECTIONS = [
    {
        title: 'Datos basicos',
        copy: 'Información general que contextualiza la evaluación familiar.',
        fields: [
            { type: 'text', name: 'child_name', label: 'Nombre completo del nino o niño/a' },
            { type: 'date', name: 'child_birth_date', label: 'Fecha de nacimiento' },
            { type: 'number', name: 'child_age', label: 'Edad' },
            { type: 'text', name: 'respondent_name', label: 'Quien responde' },
            { type: 'text', name: 'respondent_relation', label: 'Relación con el nino' },
            { type: 'date', name: 'form_date', label: 'Fecha' },
            { type: 'text', name: 'referral_source', label: 'Derivación' },
            { type: 'textarea', name: 'consultation_reason', label: 'Motivo de consulta', wide: true }
        ]
    },
    {
        title: '1. Silencio, ambiente sonoro en el hogar y comportamientos espontaneos',
        fields: [
            { type: 'radio', name: 'home_sound_environment', label: 'Como describirias el ambiente habitual de la casa', options: ['Muy silenciosa', 'Silencio moderado', 'Ruidos normales', 'Bastante ruidosa', 'Muy ruidosa'], wide: true },
            { type: 'radio', name: 'school_sound_environment', label: 'Como describirias el ambiente habitual de la institucion educativa', options: ['Muy silenciosa', 'Silencio moderado', 'Ruidos normales', 'Bastante ruidosa', 'Muy ruidosa'], wide: true },
            { type: 'checkbox-group', name: 'silence_behavior', label: 'Como se comporta cuando se encuentra en silencio', options: ['Se muestra tranquila', 'Se inquieta', 'Busca generar sonidos', 'Pide que pongan musica', 'No se observan cambios'], wide: true },
            { type: 'text', name: 'silence_behavior_other', label: 'Otros comportamientos observados' },
            { type: 'radio', name: 'vocalizes_in_silence', label: 'Vocaliza mas cuando el ambiente esta silencioso', options: ['Si', 'No', 'A veces'] },
            { type: 'text', name: 'vocalizes_in_silence_notes', label: 'Observaciónes sobre vocalizaciones' },
            { type: 'checkbox-group', name: 'self_stimulation_sound', label: 'Cuando no hay musica, hace alguna de estas cosas', options: ['Golpea superficies', 'Mueve objetos que suenan', 'Juguetea con el timbre de su voz', 'Busca objetos que vibren', 'Produce sonidos repetitivos'], wide: true },
            { type: 'text', name: 'self_stimulation_other', label: 'Otra conducta sonora' }
        ]
    },
    {
        title: '2. Respuestas espontaneas a la musica',
        fields: [
            { type: 'radio', name: 'music_seek_frequency', label: 'Busca musica por iniciativa propia', options: BNPM_FREQUENCY_OPTIONS },
            { type: 'checkbox-group', name: 'first_response_music', label: 'Cuando suena musica, que suele hacer primero', options: ['Se queda quieta escuchando', 'Sonrie', 'Se mueve automaticamente', 'Se acerca a la fuente sonora', 'Cambia de actividad', 'Se tapa los oidos'], wide: true },
            { type: 'text', name: 'first_response_music_other', label: 'Otra respuesta inicial' },
            { type: 'radio', name: 'attentive_listening', label: 'Parece escuchar con atencion cuando algo le interesa sonoramente', options: ['Si', 'No', 'A veces'] },
            { type: 'text', name: 'attentive_listening_examples', label: 'Ejemplos de atencion auditiva' },
            { type: 'radio', name: 'recognizes_songs', label: 'Reconoce canciones aunque no las este mirando', options: ['Si', 'No', 'No estoy seguro/a'] }
        ]
    },
    {
        title: '3. Preferencias y aversiones musicales',
        fields: [
            { type: 'checkbox-group', name: 'liked_music_types', label: 'Musica que le gusta', options: ['Infantil o canciones simples', 'Musica ritmica', 'Melodias suaves', 'Musica rapida', 'Musica lenta', 'Voces femeninas', 'Voces masculinas', 'Instrumental'], wide: true },
            { type: 'text', name: 'liked_music_other', label: 'Otra preferencia musical' },
            { type: 'textarea', name: 'favorite_songs', label: 'Canciones, artistas o estilos favoritos', wide: true },
            { type: 'textarea', name: 'disliked_music_types', label: 'Tipos de musica que rechaza o le generan molestia', wide: true },
            { type: 'checkbox-group', name: 'rejection_expression', label: 'Como expresa el rechazo', options: ['Se tapa los oidos', 'Se aleja', 'Se irrita', 'Cambia de actividad', 'Llora'], wide: true },
            { type: 'text', name: 'rejection_expression_other', label: 'Otra forma de rechazo' }
        ]
    },
    {
        title: '4. Perfil sensorial auditivo',
        fields: [
            { type: 'scale', name: 'sens_loud_sounds', label: 'Sensibilidad a sonidos fuertes (1-5)', scale: BNPM_SCALE_15 },
            { type: 'scale', name: 'sens_soft_sounds', label: 'Sensibilidad a sonidos suaves (1-5)', scale: BNPM_SCALE_15 },
            { type: 'scale', name: 'sens_loud_voices', label: 'Sensibilidad a voces fuertes (1-5)', scale: BNPM_SCALE_15 },
            { type: 'scale', name: 'sens_instruments', label: 'Sensibilidad a instrumentos musicales (1-5)', scale: BNPM_SCALE_15 },
            { type: 'checkbox-group', name: 'preferred_timbres', label: 'Que timbres prefiere', options: ['Percusion suave', 'Percusion fuerte', 'Piano', 'Cuerdas', 'Sonidos metalicos', 'Campanas', 'Voz humana', 'Vibracion'], wide: true },
            { type: 'text', name: 'preferred_timbres_other', label: 'Otros timbres preferidos' },
            { type: 'textarea', name: 'avoided_timbres', label: 'Timbres que evita', wide: true }
        ]
    },
    {
        title: '5. Movimiento y ritmo',
        fields: [
            { type: 'radio', name: 'moves_with_music', label: 'Se mueve cuando escucha musica', options: BNPM_FREQUENCY_OPTIONS },
            { type: 'checkbox-group', name: 'movement_behaviors', label: 'Comportamientos observados', options: ['Balanceo', 'Aplausos', 'Saltos', 'Movimientos de cabeza', 'Movimientos repetitivos'], wide: true },
            { type: 'text', name: 'movement_behaviors_other', label: 'Otro comportamiento motor' },
            { type: 'scale', name: 'rhythm_pulse_stable', label: 'Mantiene un pulso estable (1-5)', scale: BNPM_SCALE_15 },
            { type: 'scale', name: 'rhythm_sync_steps', label: 'Sincroniza palmas o pasos (1-5)', scale: BNPM_SCALE_15 },
            { type: 'scale', name: 'rhythm_reproduce_patterns', label: 'Reproduce ritmos simples (1-5)', scale: BNPM_SCALE_15 }
        ]
    },
    {
        title: '6. Tacto, vibracion y propiocepcion',
        fields: [
            { type: 'radio', name: 'hits_instruments_hard', label: 'Golpea muy fuerte los instrumentos', options: ['Si', 'No', 'A veces'] },
            { type: 'radio', name: 'seeks_vibrations', label: 'Busca vibraciones', options: ['Si', 'No'] },
            { type: 'text', name: 'seeks_vibrations_details', label: 'Si busca vibraciones, cuales' },
            { type: 'radio', name: 'avoids_textures', label: 'Evita tocar ciertas texturas de instrumentos', options: ['Si', 'No'] },
            { type: 'text', name: 'avoids_textures_details', label: 'Materiales evitados' },
            { type: 'radio', name: 'seeks_material_temperature', label: 'Busca tocar temperatura o metal de instrumentos', options: ['Si', 'No'] },
            { type: 'text', name: 'seeks_material_temperature_details', label: 'Materiales o superficies buscadas' }
        ]
    },
    {
        title: '7. Regulación emocional con musica y con silencio',
        fields: [
            { type: 'textarea', name: 'calming_music', label: 'Musica que calma', wide: true },
            { type: 'textarea', name: 'activating_music', label: 'Musica que activa', wide: true },
            { type: 'textarea', name: 'rejecting_sounds', label: 'Sonidos que generan rechazo', wide: true },
            { type: 'checkbox-group', name: 'emotional_reactions', label: 'Reacciones emocionales observadas', options: ['Sonrie', 'Se relaja', 'Se activa mucho', 'Se angustia', 'Se tapa los oidos', 'Busca contencion'], wide: true },
            { type: 'text', name: 'emotional_reactions_other', label: 'Otra reacción emocional' }
        ]
    },
    {
        title: '8. Comunicación y musica',
        fields: [
            { type: 'radio', name: 'vocalizes_with_music', label: 'Vocaliza cuando escucha musica', options: ['Si', 'No', 'A veces'] },
            { type: 'radio', name: 'vocalizes_more_in_silence', label: 'Vocaliza mas en silencio', options: ['Si', 'No', 'No lo tengo claro'] },
            { type: 'radio', name: 'imitates_melodies', label: 'Imita melodias o sonidos', options: ['Si', 'No', 'Intentos parciales'] },
            { type: 'radio', name: 'uses_music_to_communicate', label: 'Usa la musica para pedir, anticipar o regularse', options: ['Si', 'No', 'No lo se'] },
            { type: 'text', name: 'uses_music_to_communicate_examples', label: 'Ejemplos' }
        ]
    },
    {
        title: '9. Observaciónes adicionales de la familia',
        fields: [
            { type: 'textarea', name: 'family_additional_notes', label: 'Observaciónes abiertas', wide: true }
        ]
    }
];

const BNPM_MODULE_A_DOMAINS = [
    {
        key: 'regulacion',
        label: 'Regulación sensorial y tonica',
        items: [
            'Reacciona negativamente ante sonidos intensos',
            'Se tapa los oidos frente a ciertos sonidos',
            'Busca generar sonidos cuando hay silencio',
            'Parece necesitar ruido o musica para regularse',
            'Se sobreexcita con estimulos sonoros',
            'Evita ambientes sonoros',
            'Busca vibraciones o graves'
        ]
    },
    {
        key: 'temporal',
        label: 'Procesamiento temporal',
        items: [
            'Se mueve espontaneamente siguiendo musica',
            'Mantiene un ritmo estable',
            'Se desorganiza cuando cambia el tempo',
            'Anticipa pausas o finales musicales',
            'Repite patrones ritmicos simples',
            'Muestra dificultad para sincronizarse'
        ]
    },
    {
        key: 'audio_motor',
        label: 'Integracion audio-motora',
        items: [
            'Coordina movimiento con sonido',
            'Ajusta su movimiento al ritmo',
            'Puede iniciar movimiento a partir de estimulos sonoros',
            'Presenta movimientos repetitivos no ajustados al entorno',
            'Tiene dificultad para coordinar acciones con música'
        ]
    },
    {
        key: 'comunicacion',
        label: 'Comunicación y sincronia',
        items: [
            'Vocaliza en interacción con música',
            'Imita sonidos o melodias',
            'Responde a estimulos musicales del otro',
            'Participa en juegos de turno',
            'Usa sonidos o musica para comunicarse',
            'Presenta dificultad para sostener intercambios'
        ]
    },
    {
        key: 'ejecutivas',
        label: 'Funciones ejecutivas en contexto musical',
        items: [
            'Mantiene la atencion en actividades musicales',
            'Puede esperar pausas musicales',
            'Cambia su conducta ante cambios en la musica',
            'Se frustra ante cambios o demandas',
            'Persevera en patrones repetitivos',
            'Puede seguir consignas musicales simples'
        ]
    }
];

const BNPM_MODULE_B = {
    domains: [
        {
            key: 'sensorial',
            label: 'Dominio 1 - Regulación sensorial',
            tasks: [
                { key: 'intensidad_sonora', title: 'Tarea 1: Intensidad sonora', observables: ['Sobresalto', 'Evitación', 'Búsqueda de sonido', 'Indiferencia', 'Regulación adecuada'] },
                { key: 'silencio', title: 'Tarea 2: Silencio', observables: ['Genera sonidos', 'Inquietud motora', 'Se autorregula', 'Evita el silencio', 'Contacto visual', 'Desconexión'], numeric: [{ name: 'latencia_ruptura_silencio', label: 'Latencia a ruptura del silencio (segundos)' }], subscales: ['Regulación', 'Busqueda', 'Atención', 'Tolerancia temporal', 'Social'] }
            ]
        },
        {
            key: 'temporal',
            label: 'Dominio 2 - Procesamiento temporal',
            tasks: [
                { key: 'sincronizacion', title: 'Tarea 1: Sincronizacion', observables: ['Sincronizado', 'Variable', 'Muy inestable', 'No logra'], extrasChoice: { name: 'sincronizacion_tipo_error', label: 'Tipo de error', options: ['Adelantado', 'Atrasado', 'Mixto'] }, numeric: [{ name: 'sincronizacion_error_medio', label: 'Error medio (ms)' }, { name: 'sincronizacion_jitter', label: 'Jitter (ms)' }] },
                { key: 'continuacion', title: 'Tarea 2: Continuacion', observables: ['Mantiene tempo', 'Deriva progresiva', 'Pierde ritmo'] },
                { key: 'cambio_tempo', title: 'Tarea 3: Cambio de tempo', observables: ['Se adapta rapido', 'Adaptacion lenta', 'No se adapta'], numeric: [{ name: 'cambio_tempo_latencia', label: 'Latencia de ajuste' }] }
            ]
        },
        {
            key: 'audio_motor',
            label: 'Dominio 3 - Integracion audio-motora',
            tasks: [
                { key: 'movimiento_libre', title: 'Movimiento libre', observables: ['Coordinado', 'Parcial', 'Desorganizado', 'Estereotipado'] },
                { key: 'imitacion_motora', title: 'Imitacion motora', observables: ['Precisa', 'Aproximada', 'Fallida'], numeric: [{ name: 'imitacion_motora_latencia', label: 'Latencia' }] },
                { key: 'acoplamiento', title: 'Acoplamiento', observables: ['Sincronia', 'Intermitente', 'No acopla'] }
            ]
        },
                {
                    key: 'comunicacion',
                    label: 'Dominio 4 - Comunicación musical',
                    tasks: [
                        { key: 'turn_taking', title: 'Turn-taking', observables: ['Espera turno', 'Se adelanta', 'No responde'] },
                        { key: 'imitacion_vocal', title: 'Imitacion vocal', observables: ['Reproduce', 'Aproxima', 'No imita'] },
                        { key: 'interaccion_libre', title: 'Interacción libre', observables: ['Inicia', 'Responde', 'Pasivo'], extrasChoice: { name: 'interaccion_libre_reciprocidad', label: 'Reciprocidad', options: ['Alta', 'Media', 'Baja'] } }
                    ]
                },
        {
            key: 'ejecutivo',
            label: 'Dominio 5 - Funciones ejecutivas',
            tasks: [
                { key: 'stop_musical', title: 'Stop musical', observables: ['Se detiene', 'Parcial', 'No inhibe'] },
                { key: 'cambio_regla', title: 'Cambio de regla', observables: ['Flexible', 'Persevera', 'Confusion'] },
                { key: 'secuencia', title: 'Secuencia', observables: ['Correcta', 'Parcial', 'Fallida'] }
            ]
        }
    ],
    markers: ['Hipersensibilidad', 'Busqueda sensorial', 'Bajo registro', 'Asincronia temporal', 'Impulsividad', 'Rigidez', 'Baja reciprocidad', 'Desorganizacion motora']
};

app.escapeHtml = function (value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

app.formatearBnpmTexto = function (value) {
    return String(value || '')
        .replace(/Modulo/g, 'Modulo')
        .replace(/modulo/g, 'modulo')
        .replace(/Nino/g, 'Nino')
        .replace(/nino/g, 'nino')
        .replace(/nina/g, 'nina')
        .replace(/basicos/g, 'básicos')
        .replace(/Basicos/g, 'Básicos')
        .replace(/evaluacion/g, 'evaluacion')
        .replace(/Evaluación/g, 'Evaluación')
        .replace(/clinico/g, 'clínico')
        .replace(/clinica/g, 'clinica')
        .replace(/clinicas/g, 'clinicas')
        .replace(/clinicos/g, 'clínicos')
        .replace(/musica/g, 'musica')
        .replace(/Musica/g, 'Música')
        .replace(/diagnostico/g, 'diagnostico')
        .replace(/Diagnóstico/g, 'Diagnóstico')
        .replace(/comunicacion/g, 'comunicacion')
        .replace(/Comunicación/g, 'Comunicación')
        .replace(/regulacion/g, 'regulacion')
        .replace(/Regulación/g, 'Regulación')
        .replace(/integracion/g, 'integracion')
        .replace(/Integracion/g, 'Integración')
        .replace(/orientacion/g, 'orientacion')
        .replace(/Orientacion/g, 'Orientación')
        .replace(/terapeutica/g, 'terapeutica')
        .replace(/Terapeutica/g, 'Terapéutica')
        .replace(/observacion/g, 'observacion')
        .replace(/Observación/g, 'Observación')
        .replace(/observaciones iniciales/g, 'observaciones iniciales')
        .replace(/opcion/g, 'opción')
        .replace(/Opcion/g, 'Opción')
        .replace(/publica/g, 'pública')
        .replace(/Pública/g, 'Pública')
        .replace(/version/g, 'versión')
        .replace(/Versión/g, 'Versión')
        .replace(/sección/g, 'sección')
        .replace(/Sección/g, 'Sección')
        .replace(/todavia/g, 'todavía')
        .replace(/Aun/g, 'Aún')
        .replace(/aun/g, 'aún')
        .replace(/ultimo/g, 'último')
        .replace(/ultimo/g, 'Último')
        .replace(/diagnostico/g, 'diagnóstico');
};

app.leerBnpmStorage = function () {
    try {
        return JSON.parse(localStorage.getItem(BNPM_STORAGE_KEY) || '{}');
    } catch (error) {
        return {};
    }
};

app.guardarBnpmStorage = function (data) {
    localStorage.setItem(BNPM_STORAGE_KEY, JSON.stringify(data));
};

app.esPacienteNino = function (paciente) {
    return !!paciente && (
        paciente.tipo_registro === 'nino' ||
        paciente.tipo_registro === 'nino' ||
        paciente.tipo_evaluacion === 'bnpm_nino' ||
        paciente.tipo_evaluacion === 'bnpm-nino' ||
        (paciente.bnpm && typeof paciente.bnpm === 'object' && Object.keys(paciente.bnpm).length > 0)
    );
};

app.obtenerPacientesNino = function () {
    return this.pacientes
        .map((paciente, index) => ({ paciente, index }))
        .filter(item => this.esPacienteNino(item.paciente));
};

app.obtenerBnpmPacienteDefault = function () {
    if (this.pacienteActual && this.pacienteActual.index != null && this.esPacienteNino(this.pacientes[this.pacienteActual.index])) {
        return String(this.pacienteActual.index);
    }
    const primerNino = this.obtenerPacientesNino()[0];
    return primerNino ?String(primerNino.index) : '';
};

app.obtenerBnpmPacienteRecord = function (patientIndex) {
    const paciente = this.pacientes[Number(patientIndex)];
    if (paciente && paciente.bnpm) {
        return paciente.bnpm;
    }
    const storage = this.leerBnpmStorage();
    return storage[String(patientIndex)] || null;
};

app.guardarBnpmModulo = function (moduleKey, patientIndex, payload) {
    const storage = this.leerBnpmStorage();
    const paciente = this.pacientes[Number(patientIndex)] || {};
    const key = String(patientIndex);
    storage[key] = storage[key] || {};
    storage[key].patientIndex = Number(patientIndex);
    storage[key].patientName = paciente.nombre || 'Paciente';
    storage[key][moduleKey === 'a' ?'moduloA' : 'moduloB'] = {
        savedAt: new Date().toISOString(),
        values: payload
    };
    this.guardarBnpmStorage(storage);
};

app.obtenerBnpmValores = function (moduleKey, patientIndex) {
    const record = this.obtenerBnpmPacienteRecord(patientIndex);
    if (!record) return {};
    const modulo = moduleKey === 'a' ?record.moduloA : record.moduloB;
    return (modulo && modulo.values) || {};
};

app.obtenerBnpmFechaGuardado = function (moduleKey, patientIndex) {
    const record = this.obtenerBnpmPacienteRecord(patientIndex);
    if (!record) return '';
    const modulo = moduleKey === 'a' ?record.moduloA : record.moduloB;
    return modulo && modulo.savedAt ?new Date(modulo.savedAt).toLocaleString('es-AR') : '';
};

app.obtenerOpcionesPacientesBnpm = function (selectedIndex) {
    return this.obtenerPacientesNino().map(({ paciente, index }) => `
        <option value="${index}" ${String(selectedIndex) === String(index) ?'selected' : ''}>${this.escapeHtml(paciente.nombre || `Paciente ${index + 1}`)}</option>
    `).join('');
};

app.obtenerValorBnpm = function (values, name) {
    return values && Object.prototype.hasOwnProperty.call(values, name) ?values[name] : '';
};

app.obtenerArrayBnpm = function (values, name) {
    const value = this.obtenerValorBnpm(values, name);
    if (Array.isArray(value)) return value;
    if (value === '' || value == null) return [];
    return [value];
};

app.renderBnpmField = function (field, values) {
    const fieldClass = `bnpm-field${field.wide ?' bnpm-field-wide' : ''}`;
    const currentValue = this.obtenerValorBnpm(values, field.name);
    const currentArray = this.obtenerArrayBnpm(values, field.name);

    if (field.type === 'textarea') {
        return `
            <label class="${fieldClass}">
                <span class="bnpm-label">${this.formatearBnpmTexto(field.label)}</span>
                <textarea name="${field.name}" class="bnpm-textarea">${this.escapeHtml(currentValue)}</textarea>
            </label>
        `;
    }

    if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
        return `
            <label class="${fieldClass}">
                <span class="bnpm-label">${this.formatearBnpmTexto(field.label)}</span>
                <input type="${field.type}" name="${field.name}" value="${this.escapeHtml(currentValue)}" class="bnpm-input">
            </label>
        `;
    }

    if (field.type === 'radio') {
        return `
            <div class="${fieldClass}">
                <span class="bnpm-label">${this.formatearBnpmTexto(field.label)}</span>
                <div class="bnpm-choice-group">
                    ${field.options.map(option => `
                        <label class="bnpm-choice-chip">
                            <input type="radio" name="${field.name}" value="${this.escapeHtml(option)}" ${currentValue === option ?'checked' : ''}>
                            <span>${this.escapeHtml(this.formatearBnpmTexto(option))}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (field.type === 'checkbox-group') {
        return `
            <div class="${fieldClass}">
                <span class="bnpm-label">${this.formatearBnpmTexto(field.label)}</span>
                <div class="bnpm-choice-group">
                    ${field.options.map(option => `
                        <label class="bnpm-choice-chip">
                            <input type="checkbox" name="${field.name}" value="${this.escapeHtml(option)}" ${currentArray.includes(option) ?'checked' : ''}>
                            <span>${this.escapeHtml(this.formatearBnpmTexto(option))}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (field.type === 'scale') {
        return `
            <div class="${fieldClass}">
                <span class="bnpm-label">${this.formatearBnpmTexto(field.label)}</span>
                <div class="bnpm-scale-group">
                    ${field.scale.map(option => `
                        <label class="bnpm-scale-option">
                            <input type="radio" name="${field.name}" value="${option}" ${String(currentValue) === String(option) ?'checked' : ''}>
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return '';
};

app.serializarFormularioBnpm = function (form) {
    const data = {};
    Array.from(form.elements).forEach(element => {
        if (!element.name || element.disabled) return;

        if (element.type === 'checkbox') {
            if (!Array.isArray(data[element.name])) {
                data[element.name] = [];
            }
            if (element.checked) {
                data[element.name].push(element.value);
            }
            return;
        }

        if (element.type === 'radio') {
            if (element.checked) {
                data[element.name] = element.value;
            } else if (!Object.prototype.hasOwnProperty.call(data, element.name)) {
                data[element.name] = '';
            }
            return;
        }

        data[element.name] = element.value;
    });
    return data;
};

app.obtenerDatosPacienteNinoDesdeFormulario = function (moduleKey) {
    const prefix = `bnpm-${moduleKey}-new-`;
    return {
        nombre: document.getElementById(`${prefix}name`).value.trim() || '',
        fecha_nacimiento: document.getElementById(`${prefix}birth-date`).value || '',
        edad: document.getElementById(`${prefix}age`).value || '',
        fecha: document.getElementById(`${prefix}evaluation-date`).value || new Date().toISOString().slice(0, 10),
        diagnostico: document.getElementById(`${prefix}diagnosis`).value.trim() || '',
        derivacion: document.getElementById(`${prefix}referral`).value.trim() || '',
        observaciones_iniciales: document.getElementById(`${prefix}notes`).value.trim() || ''
    };
};

app.crearPacienteNinoBnpm = async function (moduleKey) {
    if (!this.validarFormularioPacienteNino(moduleKey)) {
        return;
    }
    const datos = this.obtenerDatosPacienteNinoDesdeFormulario(moduleKey);
    if (!datos.nombre) {
        alert('El nombre y apellido es obligatorio.');
        return;
    }

    const payload = {
        fecha: datos.fecha,
        nombre: datos.nombre,
        email: '',
        investigador: '',
        medicacion: '',
        psicopatologia: '',
        diagnostico: datos.diagnostico,
        dominancia: '',
        manoInicio: '',
        medidasManos: {},
        evaluaciones_detalladas: [],
        tipo_registro: 'nino',
        tipo_evaluacion: 'bnpm_nino',
        fecha_nacimiento: datos.fecha_nacimiento,
        edad: datos.edad,
        derivacion: datos.derivacion,
        observaciones_iniciales: datos.observaciones_iniciales,
        bnpm: {
            moduloA: null,
            moduloB: null,
            compartir_familia: {
                estado: 'placeholder'
            }
        }
    };

    const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => null);

    if (!response || !response.ok) {
        this.mostrarErrorAccion(
            'No se pudo crear el paciente nino.',
            'Revisa los datos cargados e intenta nuevamente.'
        );
        return;
    }

    await this.verificarConexion();
    const match = [...this.pacientes]
        .map((paciente, index) => ({ paciente, index }))
        .reverse()
        .find(({ paciente }) => this.esPacienteNino(paciente) && paciente.nombre === datos.nombre && String(paciente.fecha || '') === String(datos.fecha || ''));

    const newIndex = match ?match.index : this.obtenerBnpmPacienteDefault();
    this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] = String(newIndex);
    this[`bnpmMostrarCreador${moduleKey.toUpperCase()}`] = false;
    this.renderizarModuloNino(moduleKey);
    alert(`Paciente nino creado: ${datos.nombre}.`);
};

app.actualizarPacienteBnpm = async function (patientIndex, payload) {
    const response = await fetch(`${CONFIG.API_URL}/${patientIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(() => null);

    if (!response || !response.ok) {
        return false;
    }

    await this.verificarConexion();
    return true;
};

app.toggleCreadorPacienteNino = function (moduleKey, forceValue = null) {
    const stateKey = `bnpmMostrarCreador${moduleKey.toUpperCase()}`;
    this[stateKey] = typeof forceValue === 'boolean' ?forceValue : !this[stateKey];
    this.renderizarModuloNino(moduleKey);
};

app.abrirEvaluaciónNino = function () {
    this.cambiarVista('evaluacion-nino');
};

// Alias sin acentos para mantener compatibilidad con handlers inline existentes.
app.abrirEvaluacionAdulto = function (...args) {
    return this.abrirEvaluaciónAdulto(...args);
};

app.cancelarEvaluacionAdulto = function (...args) {
    return this.cancelarEvaluaciónAdulto(...args);
};

app.abrirEvaluacionNino = function (...args) {
    return this.abrirEvaluaciónNino(...args);
};

app.abrirModuloNino = function (moduleKey) {
    this.cambiarVista(`bnpm-modulo-${moduleKey}`);
    this.renderizarModuloNino(moduleKey);
};

app.renderizarModuloNino = function (moduleKey) {
    const root = document.getElementById(`bnpm-modulo-${moduleKey}-root`);
    if (!root) return;

    const selectedIndex = this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] || this.obtenerBnpmPacienteDefault();
    this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] = selectedIndex;
    const mostrarCreador = selectedIndex === '' ?true : !!this[`bnpmMostrarCreador${moduleKey.toUpperCase()}`];
    const patient = selectedIndex !== '' ?(this.pacientes[Number(selectedIndex)] || {}) : {};
    const hasChildPatients = this.obtenerPacientesNino().length > 0;
    const savedAt = selectedIndex !== '' ?this.obtenerBnpmFechaGuardado(moduleKey, selectedIndex) : '';
    const toolbarNote = moduleKey === 'b'
        ? 'Módulo B guarda y actualiza el registro del paciente niño dentro de la plataforma. Módulo A y B comparten el mismo paciente.'
        : 'La opción para compartir con familia queda preparada visualmente, pero sin enlace funcional hasta contar con una ruta pública o soporte específico.';

    root.innerHTML = `
        <div class="bnpm-shell">
            <div class="bnpm-header">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Evaluación Nino</p>
                        <h2 class="text-3xl font-serif font-bold mt-2">${moduleKey === 'a' ?'Módulo A - Familia' : 'Modulo B - Registro clínico'}</h2>
                            <h2 class="text-3xl font-serif font-bold mt-2">${moduleKey === 'a' ?'Módulo A - Familia' : 'Módulo B - Registro clínico'}</h2>
                        <p class="text-white/80 mt-2">${moduleKey === 'a' ? 'Base digital para observaciones familiares y escalas de perfil musical.' : 'Registro profesional con dominios, tareas, puntajes, observables y orientación inicial.'}</p>
                    </div>
                    <button type="button" onclick="app.cambiarVista('evaluacion-nino')" class="bg-white/15 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition inline-flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver a Modulos
                    </button>
                </div>
            </div>
            <div class="bnpm-toolbar">
                <div>
                    <label class="bnpm-label">Paciente nino</label>
                    <select id="bnpm-${moduleKey}-patient" class="bnpm-toolbar-select" onchange="app.cambiarPacienteBnpm('${moduleKey}', this.value)">
                        <option value="" ${selectedIndex === '' ?'selected' : ''}>${hasChildPatients ?'Seleccionar paciente nino...' : 'Primero crea un paciente nino'}</option>
                        ${this.obtenerOpcionesPacientesBnpm(selectedIndex)}
                    </select>
                        <p class="text-xs text-slate-500 mt-2">${savedAt ? `Último guardado: ${this.escapeHtml(savedAt)}` : 'Aún no hay una versión guardada para este paciente.'}</p>
                </div>
                <div class="bnpm-toolbar-actions">
                    <button type="button" onclick="app.crearPacienteNinoBnpm('${moduleKey}')" class="track-action-secondary">Nuevo paciente nino</button>
                    ${moduleKey === 'a' ?`
                            <button type="button" onclick="app.guardarFormularioBnpm('a')" class="track-action-primary">Guardar borrador</button>
                            <button type="button" onclick="app.compartirModuloAFamilia()" class="track-action-secondary">Generar enlace</button>
                        `
                        : `
                            <button type="button" onclick="app.guardarFormularioBnpm('b')" class="track-action-primary">Guardar modulo</button>
                            <button type="button" onclick="app.descargarPdfModuloB()" class="track-action-secondary">Descargar PDF</button>
                        `}
                </div>
            </div>
            <div class="bnpm-form">
                <div class="bnpm-note">${toolbarNote}</div>
                ${this.renderizarCreadorPacienteNino(moduleKey, mostrarCreador)}
                ${selectedIndex === '' ?`
                        <div class="bnpm-empty mt-4">
                            ${hasChildPatients ?'Selecciona un paciente nino existente o crea uno nuevo para empezar.' : 'Todavía no hay pacientes nino registrados. Completa el bloque superior para crear el primero.'}
                        </div>
                    ` : (moduleKey === 'a' ?this.renderizarModuloAFormulario(selectedIndex, patient) : this.renderizarModuloBFormulario(selectedIndex, patient))}

            </div>
        </div>
    `;

    if (moduleKey === 'b') {
        document.getElementById('bnpm-form-b').addEventListener('input', () => this.actualizarResumenModuloB());
        this.actualizarResumenModuloB();
    }

    lucide.createIcons();
};

app.cambiarPacienteBnpm = function (moduleKey, patientIndex) {
    this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] = String(patientIndex);
    this.renderizarModuloNino(moduleKey);
};

app.renderizarCreadorPacienteNino = function (moduleKey) {
    const prefix = `bnpm-${moduleKey}-new`;
    return `
        <section class="bnpm-section bnpm-section-soft">
            <div class="bnpm-section-title">Crear paciente nino</div>
            <p class="bnpm-section-copy">Este registro es independiente del Protocolo de Evaluación de Sincronización Sensorio-Motora (PESSM) y servirá como base compartida entre Modulo A y Modulo B.</p>
            <div class="bnpm-grid">
                <label class="bnpm-field">
                    <span class="bnpm-label">Nombre y apellido</span>
                    <input id="${prefix}-name" type="text" class="bnpm-input" placeholder="Nombre y apellido">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Fecha de nacimiento</span>
                    <input id="${prefix}-birth-date" type="date" class="bnpm-input">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Edad</span>
                    <input id="${prefix}-age" type="number" class="bnpm-input" placeholder="Edad">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Fecha de evaluación</span>
                    <input id="${prefix}-evaluation-date" type="date" class="bnpm-input" value="${new Date().toISOString().slice(0, 10)}">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Diagnóstico</span>
                    <input id="${prefix}-diagnosis" type="text" class="bnpm-input">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Derivación</span>
                    <input id="${prefix}-referral" type="text" class="bnpm-input">
                </label>
                <label class="bnpm-field bnpm-field-wide">
                    <span class="bnpm-label">Observaciónes iniciales</span>
                    <textarea id="${prefix}-notes" class="bnpm-textarea"></textarea>
                </label>
            </div>
        </section>
    `;
};

app.renderizarModuloAFormulario = function (patientIndex, patient) {
    const values = this.obtenerBnpmValores('a', patientIndex);
    const resumen = this.calcularResumenModuloA(values);
    return `
        <form id="bnpm-form-a" onsubmit="app.handleSubmitBnpm(event, 'a')">
            <div class="bnpm-section bnpm-section-soft">
                <div class="bnpm-section-title">Paciente seleccionado</div>
                    <div class="bnpm-section-copy mt-1">${this.escapeHtml(patient.nombre || 'Paciente')} ${patient.diagnostico ?`· ${this.escapeHtml(patient.diagnostico)}` : ''}</div>
            </div>
            ${BNPM_MODULE_A_SECTIONS.map(section => `
                <section class="bnpm-section">
                    <div class="bnpm-section-title">${this.formatearBnpmTexto(section.title)}</div>
                    ${section.copy ?`<p class="bnpm-section-copy">${this.formatearBnpmTexto(section.copy)}</p>` : ''}
                    <div class="bnpm-grid">
                        ${section.fields.map(field => this.renderBnpmField(field, values)).join('')}
                    </div>
                </section>
            `).join('')}
            <section class="bnpm-section">
                <div class="bnpm-section-title">Bloque de puntajes por dominio</div>
                <p class="bnpm-section-copy">Escala sugerida: 0 = Nunca, 1 = Raramente, 2 = A veces, 3 = Frecuentemente, 4 = Siempre.</p>
                ${BNPM_MODULE_A_DOMAINS.map(domain => `
                    <div class="bnpm-domain-block mt-4">
                        <div class="bnpm-domain-head">
                            <h4>${this.formatearBnpmTexto(domain.label)}</h4>
                        </div>
                        ${domain.items.map((item, index) => `
                            <div class="bnpm-task">
                                <div class="bnpm-task-title">${this.formatearBnpmTexto(item)}</div>
                                <div class="bnpm-scale-group mt-3">
                                    ${BNPM_SCALE_04.map(option => `
                                        <label class="bnpm-scale-option">
                                            <input type="radio" name="module_a_${domain.key}_${index}" value="${option}" ${String(this.obtenerValorBnpm(values, `module_a_${domain.key}_${index}`)) === option ?'checked' : ''}>
                                            <span>${option}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <div class="bnpm-summary-grid">
                    ${resumen.map(item => `
                            <div class="bnpm-summary-card">
                            <div class="bnpm-summary-card-label">${this.formatearBnpmTexto(item.label)}</div>
                            <div class="bnpm-summary-card-value">${item.value}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </form>
    `;
};

app.renderizarModuloBFormulario = function (patientIndex, patient) {
    const values = this.obtenerBnpmValores('b', patientIndex);
    const summary = this.calcularResumenModuloB(values);
    return `
        <form id="bnpm-form-b" onsubmit="app.handleSubmitBnpm(event, 'b')">
            <section class="bnpm-section">
                <div class="bnpm-section-title">1. Datos generales</div>
                <div class="bnpm-grid">
                    ${this.renderBnpmField({ type: 'text', name: 'patient_name', label: 'Nombre del paciente' }, { ...values, patient_name: this.obtenerValorBnpm(values, 'patient_name') || patient.nombre || '' })}
                    ${this.renderBnpmField({ type: 'number', name: 'patient_age', label: 'Edad' }, values)}
                    ${this.renderBnpmField({ type: 'date', name: 'clinical_date', label: 'Fecha' }, values)}
                    ${this.renderBnpmField({ type: 'text', name: 'evaluator_name', label: 'Evaluador' }, values)}
                    ${this.renderBnpmField({ type: 'radio', name: 'clinical_context', label: 'Contexto', options: ['Consultorio', 'Escuela', 'Otro'] }, values)}
                    ${this.renderBnpmField({ type: 'text', name: 'clinical_context_other', label: 'Si es otro, detallar' }, values)}
                </div>
            </section>
            ${BNPM_MODULE_B.domains.map(domain => `
                <section class="bnpm-domain-block">
                    <div class="bnpm-domain-head">
                        <h4>${this.formatearBnpmTexto(domain.label)}</h4>
                    </div>
                    ${domain.tasks.map(task => `
                        <div class="bnpm-task">
                            <div class="bnpm-task-title">${this.formatearBnpmTexto(task.title)}</div>
                            <div class="bnpm-grid mt-4">
                                ${this.renderBnpmField({ type: 'scale', name: `${task.key}_score`, label: 'Puntaje global (0-4)', scale: BNPM_SCALE_04 }, values)}
                                ${task.numeric ?task.numeric.map(item => this.renderBnpmField({ type: 'number', name: item.name, label: item.label }, values)).join('') : ''}
                                ${task.extrasChoice ?this.renderBnpmField({ type: 'radio', name: task.extrasChoice.name, label: task.extrasChoice.label, options: task.extrasChoice.options, wide: true }, values) : ''}
                                ${task.subscales ?`
                                    <div class="bnpm-field bnpm-field-wide">
                                        <span class="bnpm-label">Subdimensiones opcionales</span>
                                        <div class="bnpm-grid">
                                            ${task.subscales.map(subscale => this.renderBnpmField({ type: 'scale', name: `${task.key}_sub_${subscale.toLowerCase().replace(/\s+/g, '_')}`, label: subscale, scale: BNPM_SCALE_04 }, values)).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${this.renderBnpmField({ type: 'checkbox-group', name: `${task.key}_observables`, label: 'Observables', options: task.observables, wide: true }, values)}
                                ${this.renderBnpmField({ type: 'textarea', name: `${task.key}_notes`, label: 'Notas clinicas', wide: true }, values)}
                            </div>
                        </div>
                    `).join('')}
                </section>
            `).join('')}
            <section class="bnpm-section bnpm-section-soft">
                <div class="bnpm-section-title">4. Resumen por dominio</div>
                <div id="bnpm-modulo-b-summary" class="bnpm-summary-grid">
                    ${summary.map(item => `
                        <div class="bnpm-summary-card">
                            <div class="bnpm-summary-card-label">${this.formatearBnpmTexto(item.label)}</div>
                            <div class="bnpm-summary-card-value">${item.value}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
            <section class="bnpm-section">
                <div class="bnpm-section-title">5. Marcadores clínicos globales</div>
                <div class="bnpm-grid">
                    ${this.renderBnpmField({ type: 'checkbox-group', name: 'global_markers', label: 'Marcar lo predominante', options: BNPM_MODULE_B.markers, wide: true }, values)}
                </div>
            </section>
            <section class="bnpm-section">
                <div class="bnpm-section-title">6. Observaciones clínicas integradas</div>
                <div class="bnpm-grid">
                    ${this.renderBnpmField({ type: 'textarea', name: 'integrated_observations', label: 'Observaciones clínicas integradas', wide: true }, values)}
                </div>
            </section>
            <section class="bnpm-section">
                <div class="bnpm-section-title">7. Orientación terapeutica inicial</div>
                <div class="bnpm-grid">
                    ${this.renderBnpmField({ type: 'textarea', name: 'initial_guidance', label: 'Orientación terapeutica inicial', wide: true }, values)}
                </div>
            </section>
        </form>
    `;
};

app.calcularResumenModuloA = function (values) {
    return BNPM_MODULE_A_DOMAINS.map(domain => {
        const scores = domain.items.map((_, index) => Number(this.obtenerValorBnpm(values, `module_a_${domain.key}_${index}`))).filter(Number.isFinite);
        const average = scores.length ?(scores.reduce((acc, value) => acc + value, 0) / scores.length).toFixed(1) : 'N/D';
        return { label: domain.label, value: average };
    });
};

app.calcularResumenModuloB = function (values) {
    return BNPM_MODULE_B.domains.map(domain => {
        const scores = domain.tasks
            .map(task => Number(this.obtenerValorBnpm(values, `${task.key}_score`)))
            .filter(Number.isFinite);
        const average = scores.length ?(scores.reduce((acc, value) => acc + value, 0) / scores.length).toFixed(1) : 'N/D';
        return { label: domain.label.replace('Dominio ', ''), value: average };
    });
};

app.actualizarResumenModuloB = function () {
    const form = document.getElementById('bnpm-form-b');
    const container = document.getElementById('bnpm-modulo-b-summary');
    if (!form || !container) return;
    const values = this.serializarFormularioBnpm(form);
    const summary = this.calcularResumenModuloB(values);
    container.innerHTML = summary.map(item => `
        <div class="bnpm-summary-card">
            <div class="bnpm-summary-card-label">${this.formatearBnpmTexto(item.label)}</div>
            <div class="bnpm-summary-card-value">${item.value}</div>
        </div>
    `).join('');
};

app.handleSubmitBnpm = function (event, moduleKey) {
    event.preventDefault();
    this.guardarFormularioBnpm(moduleKey);
};

app.guardarFormularioBnpm = async function (moduleKey) {
    const form = document.getElementById(`bnpm-form-${moduleKey}`);
    const patientIndex = this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`];
    if (!form || patientIndex === '') {
        alert('Seleccionó o creá primero un paciente niño.');
        return;
    }

    const payload = this.serializarFormularioBnpm(form);
    const patient = this.pacientes[Number(patientIndex)] || {};
    const backendPayload = {
        nombre: payload.patient_name || patient.nombre || patient.nombre,
        edad: payload.patient_age || patient.edad || '',
        fecha: payload.clinical_date || patient.fecha || new Date().toISOString().slice(0, 10),
        tipo_registro: 'nino',
        tipo_evaluacion: 'bnpm_nino',
        bnpm: {
            ...(patient.bnpm || {}),
            [moduleKey === 'a' ?'moduloA' : 'moduloB']: {
                savedAt: new Date().toISOString(),
                values: payload
            },
            compartir_familia: {
                estado: 'placeholder'
            }
        }
    };

    this.guardarBnpmModulo(moduleKey, patientIndex, payload);
    const ok = await this.actualizarPacienteBnpm(patientIndex, backendPayload);
    if (!ok) {
        alert('No se pudo guardar el módulo en el registro del paciente. Se conservó una copia local en este navegador.');
    }
    this.renderizarModuloNino(moduleKey);
    alert(`Modulo ${moduleKey.toUpperCase()} guardado para ${this.pacientes[Number(patientIndex)].nombre || 'el paciente seleccionado'}.`);
};

app.compartirModuloAFamilia = function () {
    alert('La opción para compartir con familia queda preparada como siguiente paso, pero hoy no existe una ruta publica ni soporte backend para generar un enlace funcional.');
};

app.descargarPdfModuloB = function () {
    const form = document.getElementById('bnpm-form-b');
    const patientIndex = this.bnpmPacienteSeleccionadoB;
    if (!form || patientIndex === '' || !window.jspdf) {
        alert('No fue posible preparar el PDF del Modulo B.');
        return;
    }

    const values = this.serializarFormularioBnpm(form);
    const summary = this.calcularResumenModuloB(values);
    const patient = this.pacientes[Number(patientIndex)] || {};
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 18;

    const ensureSpace = (extra = 20) => {
        if (y + extra > 285) {
            doc.addPage();
            y = 18;
        }
    };

    doc.setFillColor(74, 92, 146);
    doc.rect(0, 0, pageW, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BNPM - Modulo B', margin, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Planilla de registro clínico', margin, 20);

    y = 34;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Datos generales', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    [
        ['Paciente', values.patient_name || patient.nombre || 'No indicado'],
        ['Edad', values.patient_age || 'No indicada'],
        ['Fecha', values.clinical_date || 'No indicada'],
        ['Evaluador', values.evaluator_name || 'No indicado'],
        ['Contexto', values.clinical_context === 'Otro' ?`${values.clinical_context || ''} ${values.clinical_context_other || ''}`.trim() : (values.clinical_context || 'No indicado')]
    ].forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 28, y);
        y += 6;
    });

    BNPM_MODULE_B.domains.forEach(domain => {
        ensureSpace(28);
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(domain.label, margin, y);
        y += 4;

        const body = domain.tasks.map(task => [
            task.title,
            values[`${task.key}_score`] || 'N/D',
            this.obtenerArrayBnpm(values, `${task.key}_observables`).join(', ') || '-',
            values[`${task.key}_notes`] || '-'
        ]);

        doc.autoTable({
            startY: y + 2,
            head: [['Tarea', 'Puntaje', 'Observables', 'Notas']],
            body,
            margin: { left: margin, right: margin },
            styles: { fontSize: 8, cellPadding: 2.5, textColor: [51, 65, 85] },
            headStyles: { fillColor: [74, 92, 146], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 42 },
                1: { cellWidth: 18 },
                2: { cellWidth: 55 },
                3: { cellWidth: 61 }
            }
        });
        y = doc.lastAutoTable.finalY + 6;
    });

    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Resumen por dominio', margin, y);
    y += 4;
    doc.autoTable({
        startY: y + 2,
        head: [['Dominio', 'Promedio']],
        body: summary.map(item => [item.label, item.value]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [59, 141, 119], textColor: [255, 255, 255] }
    });
    y = doc.lastAutoTable.finalY + 8;

    const markers = this.obtenerArrayBnpm(values, 'global_markers').join(', ') || 'Sin marcadores seleccionados';
    ensureSpace(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Marcadores clínicos globales', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const markersLines = doc.splitTextToSize(markers, pageW - margin * 2);
    doc.text(markersLines, margin, y);
    y += markersLines.length * 4 + 4;

    ['integrated_observations', 'initial_guidance'].forEach((field, index) => {
        ensureSpace(36);
        doc.setFont('helvetica', 'bold');
        doc.text(index === 0 ?'Observaciones clínicas integradas' : 'Orientación terapeutica inicial', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(values[field] || 'Sin contenido registrado.', pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 4 + 4;
    });

    const filenameBase = (values.patient_name || patient.nombre || 'Paciente').replace(/\s+/g, '_');
    doc.save(`BNPM_Modulo_B_${filenameBase}.pdf`);
};

app.esRutaPúblicaModuloAFamilia = function () {
    return /^\/familia\/modulo-a\/[^/]+$/i.test(window.location.pathname);
};

app.obtenerTokenRutaPúblicaModuloA = function () {
    const match = window.location.pathname.match(/^\/familia\/modulo-a\/([^/]+)$/i);
    return match ?decodeURIComponent(match[1]) : '';
};

app.obtenerSolicitudModuloAInterna = function (patient) {
    return patient.bnpm.moduloARequest || null;
};

app.obtenerRespuestaModuloAInterna = function (patient) {
    return patient.bnpm.moduloA || null;
};

app.obtenerEstadoModuloAVisual = function (patient) {
    const solicitud = this.obtenerSolicitudModuloAInterna(patient);
    const respuesta = this.obtenerRespuestaModuloAInterna(patient);
    if (solicitud.status === 'pendiente') return { label: 'Enlace pendiente', tone: 'track-state-video' };
    if (solicitud.status === 'anulado') return { label: 'Enlace anulado', tone: 'track-state-empty' };
    if (respuesta.values) return { label: 'Recibido', tone: 'track-state-analysis' };
    return { label: 'Sin enlace generado', tone: 'track-state-empty' };
};

app.formatearValorRespuestaModuloA = function (field, answers) {
    const raw = answers[field.name];
    if (Array.isArray(raw)) return raw.length ?raw.join(', ') : 'Sin respuesta';
    if (raw === undefined || raw === null || raw === '') return 'Sin respuesta';
    return String(raw);
};

app.renderizarRespuestasModuloA = function (answers = {}) {
    const resumen = this.calcularResumenModuloA(answers);
    return `
        <div id="bnpm-modulo-a-respuestas" class="mt-4">
            ${BNPM_MODULE_A_SECTIONS.map(section => `
                <section class="bnpm-section">
                    <div class="bnpm-section-title">${this.formatearBnpmTexto(section.title)}</div>
                    ${section.copy ?`<p class="bnpm-section-copy">${this.formatearBnpmTexto(section.copy)}</p>` : ''}
                    <div class="bnpm-grid">
                        ${section.fields.map(field => `
                            <div class="bnpm-field${field.wide ?' bnpm-field-wide' : ''}">
                                <span class="bnpm-label">${this.formatearBnpmTexto(field.label)}</span>
                                <div class="bnpm-input bg-slate-50">${this.escapeHtml(this.formatearBnpmTexto(this.formatearValorRespuestaModuloA(field, answers)))}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `).join('')}
            <section class="bnpm-section">
                <div class="bnpm-section-title">Escala 0-4 por dominios</div>
                ${BNPM_MODULE_A_DOMAINS.map(domain => `
                    <div class="bnpm-domain-block mt-4">
                        <div class="bnpm-domain-head">
                            <h4>${this.formatearBnpmTexto(domain.label)}</h4>
                        </div>
                        ${domain.items.map((item, index) => `
                            <div class="bnpm-task">
                                <div class="bnpm-task-title">${this.formatearBnpmTexto(item)}</div>
                                <div class="bnpm-section-copy mt-1">Puntaje: ${this.escapeHtml(this.formatearValorRespuestaModuloA({ name: `module_a_${domain.key}_${index}` }, answers))}</div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <div class="bnpm-summary-grid">
                    ${resumen.map(item => `
                        <div class="bnpm-summary-card">
                            <div class="bnpm-summary-card-label">${this.formatearBnpmTexto(item.label)}</div>
                            <div class="bnpm-summary-card-value">${item.value}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
};

app.renderizarModuloAFormulario = function (patientIndex, patient) {
    const values = this.obtenerBnpmValores('a', patientIndex);
    const resumen = this.calcularResumenModuloA(values);
    return `
        <form id="bnpm-form-a" onsubmit="app.handleSubmitBnpm(event, 'a')">
            <div class="bnpm-section bnpm-section-soft">
                <div class="bnpm-section-title">Paciente seleccionado</div>
                <div class="bnpm-section-copy mt-1">${this.escapeHtml(patient.nombre || 'Paciente')} ${patient.diagnostico ?`· ${this.escapeHtml(patient.diagnostico)}` : ''}</div>
            </div>
            ${BNPM_MODULE_A_SECTIONS.map(section => `
                <section class="bnpm-section">
                    <div class="bnpm-section-title">${this.formatearBnpmTexto(section.title)}</div>
                    ${section.copy ?`<p class="bnpm-section-copy">${this.formatearBnpmTexto(section.copy)}</p>` : ''}
                    <div class="bnpm-grid">
                        ${section.fields.map(field => this.renderBnpmField(field, values)).join('')}
                    </div>
                </section>
            `).join('')}
            <section class="bnpm-section">
                <div class="bnpm-section-title">Bloque de puntajes por dominio</div>
                <p class="bnpm-section-copy">Escala sugerida: 0 = Nunca, 1 = Raramente, 2 = A veces, 3 = Frecuentemente, 4 = Siempre.</p>
                ${BNPM_MODULE_A_DOMAINS.map(domain => `
                    <div class="bnpm-domain-block mt-4">
                        <div class="bnpm-domain-head">
                            <h4>${this.formatearBnpmTexto(domain.label)}</h4>
                        </div>
                        ${domain.items.map((item, index) => `
                            <div class="bnpm-task">
                                <div class="bnpm-task-title">${this.formatearBnpmTexto(item)}</div>
                                <div class="bnpm-scale-group mt-3">
                                    ${BNPM_SCALE_04.map(option => `
                                        <label class="bnpm-scale-option">
                                            <input type="radio" name="module_a_${domain.key}_${index}" value="${option}" ${String(this.obtenerValorBnpm(values, `module_a_${domain.key}_${index}`)) === option ?'checked' : ''}>
                                            <span>${option}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <div class="bnpm-summary-grid">
                    ${resumen.map(item => `
                        <div class="bnpm-summary-card">
                            <div class="bnpm-summary-card-label">${this.formatearBnpmTexto(item.label)}</div>
                            <div class="bnpm-summary-card-value">${item.value}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </form>
    `;
};

app.notificarAnalisisCompletado = function (resultado) {
    const pista = resultado && resultado.nroPista != null ? resultado.nroPista : '?';
    const archivo = resultado && resultado.archivo ? `\nArchivo: ${resultado.archivo}` : '';
    alert(`Análisis completado para la pista ${pista}.${archivo}\n\nEl resultado quedó guardado internamente para el informe final.`);
};

app.renderizarToolbarModuloA = function (patient) {
    const solicitud = this.obtenerSolicitudModuloAInterna(patient) || {};
    const respuesta = this.obtenerRespuestaModuloAInterna(patient) || {};
    return `
        <button type="button" onclick="app.generarEnlaceModuloAFamilia()" class="track-action-primary">Generar enlace para familia</button>
        ${solicitud.status === 'pendiente' && solicitud.publicUrl ?`<button type="button" onclick="app.copiarEnlaceModuloAFamilia()" class="track-action-secondary">Copiar enlace</button>` : ''}
        ${solicitud.status === 'pendiente' ?`<button type="button" onclick="app.anularEnlaceModuloAFamilia()" class="track-action-secondary">Anular enlace</button>` : ''}
        ${respuesta.values ?`<button type="button" onclick="document.getElementById('bnpm-modulo-a-respuestas').scrollIntoView({behavior:'smooth', block:'start'})" class="track-action-secondary">Ver respuestas</button>` : ''}
        ${respuesta.values ?`<button type="button" onclick="app.descargarPdfModuloA()" class="track-action-secondary">Descargar PDF</button>` : ''}
    `;
};

app.renderizarModuloNino = function (moduleKey) {
    const root = document.getElementById(`bnpm-modulo-${moduleKey}-root`);
    if (!root) return;
    const selectedIndex = this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] || this.obtenerBnpmPacienteDefault();
    this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] = selectedIndex;
    const patient = selectedIndex !== '' ?(this.pacientes[Number(selectedIndex)] || {}) : {};
    const hasChildPatients = this.obtenerPacientesNino().length > 0;
    const savedAt = selectedIndex !== '' ?this.obtenerBnpmFechaGuardado(moduleKey, selectedIndex) : '';
    const toolbarNote = moduleKey === 'b'
         ?'Módulo B guarda y actualiza el registro del paciente nino dentro de la plataforma. Módulo A y B comparten el mismo paciente.'
        : 'Módulo A se completa desde un enlace externo para familia y las respuestas quedan asociadas al paciente nino/a dentro del sistema.';
    root.innerHTML = `
        <div class="bnpm-shell">
            <div class="bnpm-header">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Evaluación Niño/a</p>
                        <h2 class="text-3xl font-serif font-bold mt-2">${moduleKey === 'a' ?'Módulo A - Familia' : 'Modulo B - Registro clínico'}</h2>
                        <p class="text-white/80 mt-2">${moduleKey === 'a' ?'Gestión del formulario familiar, enlace externo, respuestas y PDF.' : 'Registro profesional con dominios, tareas, puntajes, observables y orientación inicial.'}</p>
                    </div>
                    <button type="button" onclick="app.cambiarVista('evaluacion-nino')" class="bg-white/15 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition inline-flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver a Modulos
                    </button>
                </div>
            </div>
            <div class="bnpm-toolbar">
                <div>
                    <label class="bnpm-label">Paciente niño/a</label>
                    <select id="bnpm-${moduleKey}-patient" class="bnpm-toolbar-select" onchange="app.cambiarPacienteBnpm('${moduleKey}', this.value)">
                        <option value="" ${selectedIndex === '' ?'selected' : ''}>${hasChildPatients ?'Seleccionar paciente niño/a...' : 'Primero crea un paciente niño/a'}</option>
                        ${this.obtenerOpcionesPacientesBnpm(selectedIndex)}
                    </select>
                    <p class="text-xs text-slate-500 mt-2">${savedAt ? `Último guardado: ${this.escapeHtml(savedAt)}` : 'Aún no hay una versión guardada para este paciente.'}</p>
                </div>
                <div class="bnpm-toolbar-actions">
                    <button type="button" onclick="app.crearPacienteNinoBnpm('${moduleKey}')" class="track-action-secondary">Nuevo paciente nino/a</button>
                    ${selectedIndex !== "" ?(moduleKey === "a" ?this.renderizarToolbarModuloA(patient) : `<button type="button" onclick="app.guardarFormularioBnpm('b')" class="track-action-primary">Guardar modulo</button><button type="button" onclick="app.descargarPdfModuloB()" class="track-action-secondary">Descargar PDF</button>`) : ""}
                </div>
            </div>
            <div class="bnpm-form">
                <div class="bnpm-note">${toolbarNote}</div>
                 ${this.renderizarCreadorPacienteNino(moduleKey)}
                 ${selectedIndex === ''
                     ?`<div class="bnpm-empty mt-4">${hasChildPatients ?'Seleccioná un paciente niño/a existente o creá uno nuevo para empezar.' : 'Todavía no hay pacientes niño/a registrados. Completa el bloque superior para crear el primero.'}</div>`
                    : (moduleKey === 'a' ?this.renderizarModuloAFormulario(selectedIndex, patient) : this.renderizarModuloBFormulario(selectedIndex, patient))}
            </div>
        </div>
    `;
    if (moduleKey === 'b') {
        document.getElementById('bnpm-form-b').addEventListener('input', () => this.actualizarResumenModuloB());
        this.actualizarResumenModuloB();
    }
    lucide.createIcons();
};

app.generarEnlaceModuloAFamilia = async function () {
    const patientIndex = this.bnpmPacienteSeleccionadoA;
    if (patientIndex === '') return alert('Seleccioná primero un paciente niño/a.');
    const response = await fetch(`${CONFIG.API_URL}/${patientIndex}/bnpm/modulo-a/enlace`, { method: 'POST' }).catch(() => null);
    if (!response) return alert('No se pudo generar el enlace para familia.');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return alert(data.error || 'No se pudo generar el enlace para familia.');
    await this.verificarConexion();
    this.renderizarModuloNino('a');
};

app.copiarEnlaceModuloAFamilia = async function () {
    const patient = this.pacientes[Number(this.bnpmPacienteSeleccionadoA)] || {};
    const publicUrl = this.obtenerSolicitudModuloAInterna(patient).publicUrl;
    if (!publicUrl) return alert('Todavía no hay un enlace generado.');
    if (navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl).catch(() => null);
        return alert('Enlace copiado.');
    }
    window.prompt('Copiar enlace', publicUrl);
};

app.anularEnlaceModuloAFamilia = async function () {
    const patientIndex = this.bnpmPacienteSeleccionadoA;
    if (patientIndex === '') return;
    const response = await fetch(`${CONFIG.API_URL}/${patientIndex}/bnpm/modulo-a/anular`, { method: 'POST' }).catch(() => null);
    if (!response || !response.ok) return alert('No se pudo anular el enlace.');
    await this.verificarConexion();
    this.renderizarModuloNino('a');
};

app.descargarPdfModuloA = function () {
    const patientIndex = this.bnpmPacienteSeleccionadoA;
    const patient = this.pacientes[Number(patientIndex)] || {};
    const respuesta = this.obtenerRespuestaModuloAInterna(patient);
    if (!respuesta.values || !window.jspdf) return alert('No hay respuestas del Modulo A para exportar.');
    const values = respuesta.values;
    const resumen = this.calcularResumenModuloA(values);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 18;
    const ensureSpace = (extra = 18) => { if (y + extra > 285) { doc.addPage(); y = 18; } };
    doc.setFillColor(59, 141, 119);
    doc.rect(0, 0, pageW, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BNPM - Modulo A', margin, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Respuestas familiares', margin, 20);
    y = 34;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Datos de recepción', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    [['Paciente', patient.nombre || 'Paciente'], ['Fecha de recepción', respuesta.submittedAt ?this.formatearFechaHora(respuesta.submittedAt) : 'No disponible'], ['Respondió', respuesta.respondentName || 'No informado'], ['Relación', respuesta.respondentRelation || 'No informada']].forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 36, y);
        y += 6;
    });
    BNPM_MODULE_A_SECTIONS.forEach(section => {
        ensureSpace(22);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(this.formatearBnpmTexto(section.title), margin, y);
        y += 4;
        doc.autoTable({
            startY: y + 2,
            head: [['Campo', 'Respuesta']],
            body: section.fields.map(field => [this.formatearBnpmTexto(field.label), this.formatearValorRespuestaModuloA(field, values)]),
            margin: { left: margin, right: margin },
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: { fillColor: [59, 141, 119], textColor: [255, 255, 255] },
            columnStyles: { 0: { cellWidth: 62 }, 1: { cellWidth: pageW - margin * 2 - 62 } }
        });
        y = doc.lastAutoTable.finalY + 6;
    });
    ensureSpace(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Puntaje por dominio', margin, y);
    y += 4;
    doc.autoTable({
        startY: y + 2,
        head: [['Dominio', 'Promedio']],
        body: resumen.map(item => [this.formatearBnpmTexto(item.label), item.value]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [74, 92, 146], textColor: [255, 255, 255] }
    });
    const filenameBase = (patient.nombre || 'Paciente').replace(/\s+/g, '_');
    doc.save(`BNPM_Modulo_A_${filenameBase}.pdf`);
};

app.renderizarFormularioPublicoModuloA = function (initialValues = {}) {
    return `
        <form id="family-modulo-a-form" class="space-y-4">
            ${BNPM_MODULE_A_SECTIONS.map(section => `
                <section class="bnpm-section">
                    <div class="bnpm-section-title">${this.formatearBnpmTexto(section.title)}</div>
                    ${section.copy ?`<p class="bnpm-section-copy">${this.formatearBnpmTexto(section.copy)}</p>` : ''}
                    <div class="bnpm-grid">
                        ${section.fields.map(field => this.renderBnpmField(field, initialValues)).join('')}
                    </div>
                </section>
            `).join('')}
            <section class="bnpm-section">
                <div class="bnpm-section-title">Escala 0-4 por dominios</div>
                <p class="bnpm-section-copy">0 = Nunca, 1 = Raramente, 2 = A veces, 3 = Frecuentemente, 4 = Siempre.</p>
                ${BNPM_MODULE_A_DOMAINS.map(domain => `
                    <div class="bnpm-domain-block mt-4">
                        <div class="bnpm-domain-head">
                            <h4>${this.formatearBnpmTexto(domain.label)}</h4>
                        </div>
                        ${domain.items.map((item, index) => `
                            <div class="bnpm-task">
                                <div class="bnpm-task-title">${this.formatearBnpmTexto(item)}</div>
                                <div class="bnpm-scale-group mt-3">
                                    ${BNPM_SCALE_04.map(option => `<label class="bnpm-scale-option"><input type="radio" name="module_a_${domain.key}_${index}" value="${option}" ${String(initialValues[`module_a_${domain.key}_${index}`] || '') === option ?'checked' : ''}><span>${option}</span></label>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </section>
            <div class="flex justify-end"><button type="submit" class="bg-action text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-action/90 transition">Enviar respuestas</button></div>
        </form>
    `;
};

app.renderizarVistaPúblicaModuloA = async function (token) {
    const root = document.getElementById('family-public-root');
    if (!root) return;
    root.innerHTML = `<div class="bnpm-shell"><div class="bnpm-header"><p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">BNPM</p><h1 class="text-3xl font-serif font-bold mt-2">Modulo A para familia</h1><p class="text-white/80 mt-2">Completá este formulario una sola vez. Tus respuestas quedarán asociadas al paciente correspondiente.</p></div><div class="bnpm-form"><div class="bnpm-empty">Cargando formulario...</div></div></div>`;
    const response = await fetch(`/api/familia/modulo-a/${encodeURIComponent(token)}`).catch(() => null);
    if (!response) {
        root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-empty">No se pudo conectar para cargar el formulario.</div>`;
        return;
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-empty">${this.escapeHtml(data.message || data.error || 'El enlace no esta disponible.')}</div>`;
        return;
    }
    if (data.status === 'completado') {
        root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-empty">Este formulario ya fue enviado correctamente.<div class="bnpm-section-copy mt-2">${data.submittedAt ?`Fecha de recepción: ${this.formatearFechaHora(data.submittedAt)}` : ''}</div></div>`;
        return;
    }
    const initialValues = { child_name: data.patient.displayName || '', child_birth_date: data.patient.birthDate || '', child_age: data.patient.age || '' };
    root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-section bnpm-section-soft"><div class="bnpm-section-title">Antes de comenzar</div><p class="bnpm-section-copy">Respondé según lo que observan habitualmente en casa, en la escuela o en actividades cotidianas. No hay respuestas correctas o incorrectas.</p></div>${this.renderizarFormularioPublicoModuloA(initialValues)}`;
    document.getElementById('family-modulo-a-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const values = this.serializarFormularioBnpm(event.currentTarget);
        if (!values.respondent_name || !values.respondent_relation) return alert('Por favor completá quién responde y la relación con el niño/a.');
        const submitResponse = await fetch(`/api/familia/modulo-a/${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ respondentName: values.respondent_name, respondentRelation: values.respondent_relation, answers: values })
        }).catch(() => null);
        if (!submitResponse) return alert('No se pudo enviar el formulario.');
        const submitData = await submitResponse.json().catch(() => ({}));
        if (!submitResponse.ok) return alert(submitData.error || 'No se pudo enviar el formulario.');
        root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-empty">¡Gracias! El Módulo A fue recibido correctamente.<div class="bnpm-section-copy mt-2">${submitData.submittedAt ?`Fecha de recepción: ${this.formatearFechaHora(submitData.submittedAt)}` : ''}</div></div>`;
    });
};

app.inicializarExperienciaPúblicaModuloA = function () {
    const token = this.obtenerTokenRutaPúblicaModuloA();
    this.renderizarVistaPúblicaModuloA(token);
};

app.descargarPdfModuloAByIndex = function (patientIndex, values = null) {
    const previousIndex = this.bnpmPacienteSeleccionadoA;
    this.bnpmPacienteSeleccionadoA = String(patientIndex);
    const patient = this.pacientes[Number(patientIndex)] || {};
    const respuestaAnterior = patient.bnpm.moduloA;

    if (values && Object.keys(values).length) {
        patient.bnpm = patient.bnpm || {};
        patient.bnpm.moduloA = {
            ...(patient.bnpm.moduloA || {}),
            values
        };
    }

    this.descargarPdfModuloA();

    if (values && Object.keys(values).length) {
        if (respuestaAnterior) {
            patient.bnpm.moduloA = respuestaAnterior;
        } else if (patient.bnpm) {
            delete patient.bnpm.moduloA;
        }
    }

    this.bnpmPacienteSeleccionadoA = previousIndex;
};

app.descargarPdfModuloBByIndex = function (patientIndex, values = null) {
    const patient = this.pacientes[Number(patientIndex)] || {};
    const data = values || this.obtenerBnpmValores('b', patientIndex);
    if (!data || !Object.keys(data).length || !window.jspdf) {
        alert('No fue posible preparar el PDF del Modulo B.');
        return;
    }

    const summary = this.calcularResumenModuloB(data);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 18;

    const ensureSpace = (extra = 20) => {
        if (y + extra > 285) {
            doc.addPage();
            y = 18;
        }
    };

    doc.setFillColor(74, 92, 146);
    doc.rect(0, 0, pageW, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BNPM - Modulo B', margin, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Planilla de registro clínico', margin, 20);

    y = 34;
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Datos generales', margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    [
        ['Paciente', data.patient_name || patient.nombre || 'No indicado'],
        ['Edad', data.patient_age || patient.edad || 'No indicada'],
        ['Fecha', data.clinical_date || patient.fecha || 'No indicada'],
        ['Evaluador', data.evaluator_name || 'No indicado'],
        ['Contexto', data.clinical_context === 'Otro' ?`${data.clinical_context || ''} ${data.clinical_context_other || ''}`.trim() : (data.clinical_context || 'No indicado')]
    ].forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 28, y);
        y += 6;
    });

    BNPM_MODULE_B.domains.forEach(domain => {
        ensureSpace(28);
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(domain.label, margin, y);
        y += 4;

        const body = domain.tasks.map(task => [
            task.title,
            data[`${task.key}_score`] || 'N/D',
            this.obtenerArrayBnpm(data, `${task.key}_observables`).join(', ') || '-',
            data[`${task.key}_notes`] || '-'
        ]);

        doc.autoTable({
            startY: y + 2,
            head: [['Tarea', 'Puntaje', 'Observables', 'Notas']],
            body,
            margin: { left: margin, right: margin },
            styles: { fontSize: 8, cellPadding: 2.5, textColor: [51, 65, 85] },
            headStyles: { fillColor: [74, 92, 146], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 42 },
                1: { cellWidth: 18 },
                2: { cellWidth: 55 },
                3: { cellWidth: 61 }
            }
        });
        y = doc.lastAutoTable.finalY + 6;
    });

    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Resumen por dominio', margin, y);
    y += 4;
    doc.autoTable({
        startY: y + 2,
        head: [['Dominio', 'Promedio']],
        body: summary.map(item => [item.label, item.value]),
        margin: { left: margin, right: margin },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [59, 141, 119], textColor: [255, 255, 255] }
    });
    y = doc.lastAutoTable.finalY + 8;

    const markers = this.obtenerArrayBnpm(data, 'global_markers').join(', ') || 'Sin marcadores seleccionados';
    ensureSpace(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Marcadores clínicos globales', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const markersLines = doc.splitTextToSize(markers, pageW - margin * 2);
    doc.text(markersLines, margin, y);
    y += markersLines.length * 4 + 4;

    ['integrated_observations', 'initial_guidance'].forEach((field, index) => {
        ensureSpace(36);
        doc.setFont('helvetica', 'bold');
        doc.text(index === 0 ?'Observaciones clínicas integradas' : 'Orientación terapeutica inicial', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(data[field] || 'Sin contenido registrado.', pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 4 + 4;
    });

    const filenameBase = (data.patient_name || patient.nombre || 'Paciente').replace(/\s+/g, '_');
    doc.save(`BNPM_Modulo_B_${filenameBase}.pdf`);
};

app.descargarPdfsPacienteNino = function (patientIndex) {
    const valuesA = this.obtenerBnpmValores('a', patientIndex);
    const valuesB = this.obtenerBnpmValores('b', patientIndex);
    const tieneA = !!Object.keys(valuesA || {}).length;
    const tieneB = !!Object.keys(valuesB || {}).length;

    if (!tieneA && !tieneB) {
        alert('Este paciente niño/a todavía no tiene Módulo A ni Módulo B para exportar.');
        return;
    }

    if (tieneA) {
        this.descargarPdfModuloAByIndex(patientIndex, valuesA);
    }
    if (tieneB) {
        this.descargarPdfModuloBByIndex(patientIndex, valuesB);
    }
};

app.descargarPdfModuloB = function () {
    const form = document.getElementById('bnpm-form-b');
    const patientIndex = this.bnpmPacienteSeleccionadoB;
    if (!form || patientIndex === '' || !window.jspdf) {
        alert('No fue posible preparar el PDF del Modulo B.');
        return;
    }
    const values = this.serializarFormularioBnpm(form);
    this.descargarPdfModuloBByIndex(patientIndex, values);
};

app.cambiarPacienteBnpm = function (moduleKey, patientIndex) {
    this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] = String(patientIndex);
    if (String(patientIndex) !== '') {
        this[`bnpmMostrarCreador${moduleKey.toUpperCase()}`] = false;
    }
    this.renderizarModuloNino(moduleKey);
};

app.renderizarCreadorPacienteNino = function (moduleKey, visible = false) {
    if (!visible) return '';
    const prefix = `bnpm-${moduleKey}-new`;
    return `
        <section class="bnpm-section bnpm-section-soft">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div class="bnpm-section-title">Crear paciente nino</div>
                    <p class="bnpm-section-copy">Este registro es independiente del Protocolo de Evaluación de Sincronización Sensorio-Motora (PESSM) y servirá como base compartida entre Módulo A y Módulo B.</p>
                </div>
                <button type="button" onclick="app.toggleCreadorPacienteNino('${moduleKey}', false)" class="track-action-secondary">Cancelar</button>
            </div>
            <div class="bnpm-grid">
                <label class="bnpm-field">
                    <span class="bnpm-label">Nombre y apellido</span>
                    <input id="${prefix}-name" type="text" class="bnpm-input">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Fecha de nacimiento</span>
                    <input id="${prefix}-birth-date" type="date" class="bnpm-input">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Edad</span>
                    <input id="${prefix}-age" type="number" class="bnpm-input">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Fecha de evaluación</span>
                    <input id="${prefix}-evaluation-date" type="date" class="bnpm-input" value="${new Date().toISOString().slice(0, 10)}">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Diagnóstico</span>
                    <input id="${prefix}-diagnosis" type="text" class="bnpm-input">
                </label>
                <label class="bnpm-field">
                    <span class="bnpm-label">Derivación</span>
                    <input id="${prefix}-referral" type="text" class="bnpm-input">
                </label>
                <label class="bnpm-field bnpm-field-wide">
                    <span class="bnpm-label">Observaciónes iniciales</span>
                    <textarea id="${prefix}-notes" class="bnpm-textarea"></textarea>
                </label>
            </div>
            <div class="flex justify-end gap-3 mt-5">
                <button type="button" onclick="app.toggleCreadorPacienteNino('${moduleKey}', false)" class="track-action-secondary">Cancelar</button>
                <button type="button" onclick="app.crearPacienteNinoBnpm('${moduleKey}')" class="track-action-primary">Guardar paciente</button>
            </div>
        </section>
    `;
};

app.renderizarModuloNino = function (moduleKey) {
    const root = document.getElementById(`bnpm-modulo-${moduleKey}-root`);
    if (!root) return;
    const selectedIndex = this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] || this.obtenerBnpmPacienteDefault();
    this[`bnpmPacienteSeleccionado${moduleKey.toUpperCase()}`] = selectedIndex;
    const mostrarCreador = selectedIndex === '' ?true : !!this[`bnpmMostrarCreador${moduleKey.toUpperCase()}`];
    const patient = selectedIndex !== '' ?(this.pacientes[Number(selectedIndex)] || {}) : {};
    const hasChildPatients = this.obtenerPacientesNino().length > 0;
    const savedAt = selectedIndex !== '' ?this.obtenerBnpmFechaGuardado(moduleKey, selectedIndex) : '';
    const toolbarNote = moduleKey === 'b'
         ?'Módulo B guarda y actualiza el registro del paciente nino dentro de la plataforma. Módulo A y B comparten el mismo paciente.'
        : 'Módulo A se completa desde un enlace externo para familia y las respuestas quedan asociadas al paciente nino/a dentro del sistema.';

    root.innerHTML = `
        <div class="bnpm-shell">
            <div class="bnpm-header">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Evaluación Niño/a</p>
                        <h2 class="text-3xl font-serif font-bold mt-2">${moduleKey === 'a' ?'Módulo A - Familia' : 'Módulo B - Registro clínico'}</h2>
                        <p class="text-white/80 mt-2">${moduleKey === 'a' ?'Gestión del formulario familiar, enlace externo, respuestas y PDF.' : 'Registro profesional con dominios, tareas, puntajes, observables y orientación inicial.'}</p>
                    </div>
                    <button type="button" onclick="app.cambiarVista('evaluacion-nino')" class="bg-white/15 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition inline-flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver a Modulos
                    </button>
                </div>
            </div>
            <div class="bnpm-toolbar">
                <div>
                    <label class="bnpm-label">Paciente niño/a</label>
                    <select id="bnpm-${moduleKey}-patient" class="bnpm-toolbar-select" onchange="app.cambiarPacienteBnpm('${moduleKey}', this.value)">
                        <option value="" ${selectedIndex === '' ?'selected' : ''}>${hasChildPatients ?'Seleccionar paciente nino/a...' : 'Primero crea un paciente nino/a'}</option>
                        ${this.obtenerOpcionesPacientesBnpm(selectedIndex)}
                    </select>
                    <p class="text-xs text-slate-500 mt-2">${savedAt ?`Último guardado: ${this.escapeHtml(savedAt)}` : 'Aún no hay una versión guardada para este paciente.'}</p>
                </div>
                <div class="bnpm-toolbar-actions">
                    <button type="button" onclick="app.toggleCreadorPacienteNino('${moduleKey}', true)" class="track-action-secondary">Nuevo paciente nino/a</button>
                    ${selectedIndex !== '' ?(moduleKey === 'a'
                         ?this.renderizarToolbarModuloA(patient)
                        : `<button type="button" onclick="app.guardarFormularioBnpm('b')" class="track-action-primary">Guardar modulo</button><button type="button" onclick="app.descargarPdfModuloB()" class="track-action-secondary">Descargar PDF</button>`) : ''}
                </div>
            </div>
            <div class="bnpm-form">
                <div class="bnpm-note">${toolbarNote}</div>
                ${this.renderizarCreadorPacienteNino(moduleKey, mostrarCreador)}
                ${selectedIndex === ''
                     ?`<div class="bnpm-empty mt-4">${hasChildPatients ?'Seleccioná un paciente nino/a existente o creá uno nuevo para empezar.' : 'Todavía no hay pacientes nino/a registrados. Usá el botón para crear el primero.'}</div>`
                    : (moduleKey === 'a' ?this.renderizarModuloAFormulario(selectedIndex, patient) : this.renderizarModuloBFormulario(selectedIndex, patient))}
            </div>
        </div>
    `;

    if (moduleKey === 'b') {
        document.getElementById('bnpm-form-b').addEventListener('input', () => this.actualizarResumenModuloB());
        this.actualizarResumenModuloB();
    }

    lucide.createIcons();
};

app.renderizarVistaPúblicaModuloA = async function (token) {
    const root = document.getElementById('family-public-root');
    if (!root) return;

    root.innerHTML = `
        <div class="bnpm-shell">
            <div class="bnpm-header">
                <p class="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">BNPM</p>
                <h1 class="text-3xl font-serif font-bold mt-2">Modulo A - Cuestionario para la familia</h1>
                <p class="text-white/80 mt-2">Completa este formulario con la informacion que observas habitualmente en casa, escuela o actividades cotidianas. No hay respuestas correctas o incorrectas.</p>
            </div>
            <div class="bnpm-form">
                <div class="bnpm-empty">Cargando formulario...</div>
            </div>
        </div>
    `;

    const response = await fetch(`/api/familia/modulo-a/${encodeURIComponent(token)}`).catch(() => null);
    if (!response) {
        root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-empty">No se pudo conectar para cargar el formulario.</div>`;
        return;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        root.querySelector('.bnpm-form').innerHTML = `<div class="bnpm-empty"><div class="text-lg font-semibold text-slate-700">El enlace no es válido o ya no está disponible.</div></div>`;
        return;
    }

    if (data.status === 'completado') {
        root.querySelector('.bnpm-form').innerHTML = `
            <div class="bnpm-empty">
                <div class="text-lg font-semibold text-slate-700">Este formulario ya fue completado.</div>
                <div class="bnpm-section-copy mt-2">Gracias. Las respuestas ya fueron enviadas al equipo tratante.</div>
                <div class="bnpm-section-copy mt-2">${data.submittedAt ?`Fecha de recepción: ${this.formatearFechaHora(data.submittedAt)}` : ''}</div>
            </div>
        `;
        return;
    }

    const initialValues = {
        child_name: data.patient.displayName || '',
        child_birth_date: data.patient.birthDate || '',
        child_age: data.patient.age || ''
    };

    root.querySelector('.bnpm-form').innerHTML = `
        <div class="bnpm-section bnpm-section-soft">
            <div class="bnpm-section-title">Antes de comenzar</div>
            <p class="bnpm-section-copy">Respondé según lo que observan habitualmente en casa, en la escuela o en actividades cotidianas. No hay respuestas correctas o incorrectas.</p>
        </div>
        ${this.renderizarFormularioPublicoModuloA(initialValues)}
    `;

    document.getElementById('family-modulo-a-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const values = this.serializarFormularioBnpm(event.currentTarget);

        if (!values.respondent_name || !values.respondent_relation) {
            return alert('Por favor completá quién responde y la relación con el niño/a.');
        }

        const submitResponse = await fetch(`/api/familia/modulo-a/${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                respondentName: values.respondent_name,
                respondentRelation: values.respondent_relation,
                answers: values
            })
        }).catch(() => null);

        if (!submitResponse) return alert('No se pudo enviar el formulario.');

        const submitData = await submitResponse.json().catch(() => ({}));
        if (!submitResponse.ok) return alert(submitData.error || 'No se pudo enviar el formulario.');

        root.querySelector('.bnpm-form').innerHTML = `
            <div class="bnpm-empty">
                <div class="text-lg font-semibold text-slate-700">Formulario enviado correctamente</div>
                <div class="bnpm-section-copy mt-2">Gracias por completar la informacion.</div>
                <div class="bnpm-section-copy mt-2">${submitData.submittedAt ?`Fecha de recepción: ${this.formatearFechaHora(submitData.submittedAt)}` : ''}</div>
            </div>
        `;
    });
};

const __abrirPrimerResultadoEvaluaciónOriginal = app.abrirPrimerResultadoEvaluación.bind(app);
app.abrirPrimerResultadoEvaluación = async function (indexPaciente) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Cargando...');
    await this.esperarSiguienteFrame();
    try {
        await __abrirPrimerResultadoEvaluaciónOriginal(indexPaciente);
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __guardarEdicionPacienteDetalleOriginal = app.guardarEdicionPacienteDetalle.bind(app);
app.guardarEdicionPacienteDetalle = async function () {
    if (!this.validarFormularioEdicionPaciente()) {
        return;
    }
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Guardando...');
    await this.esperarSiguienteFrame();
    try {
        await __guardarEdicionPacienteDetalleOriginal();
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __generarPDFOriginal = app.generarPDF.bind(app);
app.generarPDF = async function (paciente) {
    if (!window.jspdf) {
        await __generarPDFOriginal(paciente);
        return;
    }
    if (this.esPacienteAdulto(paciente) && !this.tieneConsentimientoFirmado(paciente)) {
        await __generarPDFOriginal(paciente);
        return;
    }
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Descargando...');
    await this.esperarSiguienteFrame();
    try {
        await __generarPDFOriginal(paciente);
        if (this.pacienteDetalleActual.clave) {
            this.mostrarAlertaDetallePaciente('PDF descargado correctamente.');
        }
    } catch (error) {
        this.mostrarErrorAccion(
            'No se pudo descargar el PDF.',
            'Volve a intentarlo en unos segundos.'
        );
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __abrirAnalisisPersistidoOriginal = app.abrirAnalisisPersistido.bind(app);
app.abrirAnalisisPersistido = async function (indexPaciente, nroPista) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Cargando...');
    await this.esperarSiguienteFrame();
    try {
        await __abrirAnalisisPersistidoOriginal(indexPaciente, nroPista);
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __descargarPdfAnalisisPersistidoOriginal = app.descargarPdfAnalisisPersistido.bind(app);
app.descargarPdfAnalisisPersistido = async function (indexPaciente, nroPista) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Descargando...');
    await this.esperarSiguienteFrame();
    try {
        await __descargarPdfAnalisisPersistidoOriginal(indexPaciente, nroPista);
    } catch (error) {
        this.mostrarErrorAccion(
            'No se pudo descargar el PDF del análisis.',
            'Volvé a intentarlo en unos segundos.'
        );
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __eliminarVideoOriginal = app.eliminarVideo.bind(app);
app.eliminarVideo = async function (indexPaciente, nroPista) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    const confirmado = confirm(`¿Seguro que querés eliminar este video de la pista ${nroPista} Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    this.marcarBotonEnCarga(boton, 'Eliminando...');
    await this.esperarSiguienteFrame();
    try {
        const resp = await fetch(`${CONFIG.API_URL}/${indexPaciente}/videos/${nroPista}`, {
            method: 'DELETE'
        });
        if (resp.ok) {
            const p = this.pacientes[indexPaciente];
            this.invalidarAnalisisPersistido(indexPaciente, nroPista);
            this.renderizarAnalisisDisponibles(indexPaciente, p.evaluaciones_detalladas || []);
            await this.cargarEstadoVideos(indexPaciente, p.evaluaciones_detalladas || []);
            return;
        }
        const data = await resp.json().catch(() => ({}));
        this.mostrarErrorAccion(
            'No se pudo eliminar este video.',
            data.error || 'Intentá nuevamente en unos instantes.'
        );
    } catch (error) {
        this.mostrarErrorAccion(
            'No se pudo eliminar este video.',
            'Revisá la conexión y volvé a intentarlo.'
        );
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __crearPacienteNinoBnpmOriginal = app.crearPacienteNinoBnpm.bind(app);
app.crearPacienteNinoBnpm = async function (moduleKey) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Guardando...');
    await this.esperarSiguienteFrame();
    try {
        await __crearPacienteNinoBnpmOriginal(moduleKey);
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __guardarFormularioBnpmOriginal = app.guardarFormularioBnpm.bind(app);
app.guardarFormularioBnpm = async function (moduleKey) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Guardando...');
    await this.esperarSiguienteFrame();
    try {
        await __guardarFormularioBnpmOriginal(moduleKey);
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __generarEnlaceModuloAFamiliaOriginal = app.generarEnlaceModuloAFamilia.bind(app);
app.generarEnlaceModuloAFamilia = async function () {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Generando...');
    await this.esperarSiguienteFrame();
    try {
        await __generarEnlaceModuloAFamiliaOriginal();
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __descargarPdfModuloAOriginal = app.descargarPdfModuloA.bind(app);
app.descargarPdfModuloA = async function () {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Descargando...');
    await this.esperarSiguienteFrame();
    try {
        __descargarPdfModuloAOriginal();
    } catch (error) {
        alert('No se pudo descargar el PDF. Intenta nuevamente.');
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __descargarPdfModuloBOriginal = app.descargarPdfModuloB.bind(app);
app.descargarPdfModuloB = async function () {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Descargando...');
    await this.esperarSiguienteFrame();
    try {
        __descargarPdfModuloBOriginal();
    } catch (error) {
        alert('No se pudo descargar el PDF. Intenta nuevamente.');
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __descargarPdfsPacienteNinoOriginal = app.descargarPdfsPacienteNino.bind(app);
app.descargarPdfsPacienteNino = async function (patientIndex) {
    const boton = document.activeElement instanceof HTMLElement ?document.activeElement.closest('button') : null;
    this.marcarBotonEnCarga(boton, 'Descargando...');
    await this.esperarSiguienteFrame();
    try {
        __descargarPdfsPacienteNinoOriginal(patientIndex);
    } catch (error) {
        alert('No se pudo descargar el PDF. Intenta nuevamente.');
    } finally {
        this.restaurarBotonEnCarga(boton);
    }
};

const __guardarEvaluaciónOriginal = protocolo.guardarEvaluación.bind(protocolo);
protocolo.guardarEvaluación = async function (evento) {
    evento.preventDefault();
    evento.stopPropagation();
    const boton = evento.submitter || document.querySelector('#evaluationFormMedicion button[type="submit"]');
    app.marcarBotonEnCarga(boton, 'Guardando...');
    await app.esperarSiguienteFrame();
    try {
        await __guardarEvaluaciónOriginal(evento);
    } finally {
        app.restaurarBotonEnCarga(boton);
    }
};

protocolo.guardarEvaluacion = (...args) => protocolo.guardarEvaluación(...args);

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
