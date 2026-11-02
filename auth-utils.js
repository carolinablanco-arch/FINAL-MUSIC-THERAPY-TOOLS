const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJsonFile(filePath, fallback = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        return fallback;
    }
}

function writeJsonFileSafe(filePath, data) {
    ensureDir(path.dirname(filePath));
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function generarIdSeguro() {
    return crypto.randomBytes(16).toString('hex');
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(String(password), salt, 64).toString('hex');
    return `scrypt$${salt}$${derivedKey}`;
}

function verifyPassword(password, passwordHash) {
    try {
        const [algorithm, salt, derivedKey] = String(passwordHash || '').split('$');
        if (algorithm !== 'scrypt' || !salt || !derivedKey) {
            return false;
        }
        const candidate = crypto.scryptSync(String(password), salt, 64).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(derivedKey, 'hex'));
    } catch (error) {
        return false;
    }
}

module.exports = {
    ensureDir,
    readJsonFile,
    writeJsonFileSafe,
    normalizeEmail,
    isValidEmail,
    generarIdSeguro,
    hashPassword,
    verifyPassword
};
