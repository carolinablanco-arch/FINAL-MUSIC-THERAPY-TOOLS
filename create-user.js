const path = require('path');
const readline = require('readline/promises');
const { stdin, stdout } = require('process');
const {
    ensureDir,
    readJsonFile,
    writeJsonFileSafe,
    normalizeEmail,
    isValidEmail,
    generarIdSeguro,
    hashPassword
} = require('./auth-utils');

const dataRoot = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : __dirname;
const usersFile = path.join(dataRoot, 'users.json');
const usersRootDir = path.join(dataRoot, 'users');
const rolesPermitidos = new Set(['admin', 'musicoterapeuta']);

async function main() {
    ensureDir(dataRoot);
    ensureDir(usersRootDir);

    const rl = readline.createInterface({ input: stdin, output: stdout });

    try {
        const name = String(await rl.question('Nombre: ')).trim();
        const email = normalizeEmail(await rl.question('E-mail: '));
        const password = String(await rl.question('Contraseña: ')).trim();
        const roleInput = String(await rl.question('Rol (admin/musicoterapeuta) [musicoterapeuta]: ')).trim().toLowerCase();
        const role = roleInput || 'musicoterapeuta';

        if (!name) {
            throw new Error('El nombre es obligatorio.');
        }
        if (!isValidEmail(email)) {
            throw new Error('Ingresá un e-mail válido.');
        }
        if (password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres.');
        }
        if (!rolesPermitidos.has(role)) {
            throw new Error('El rol debe ser admin o musicoterapeuta.');
        }

        const users = readJsonFile(usersFile, []);
        if (users.some(user => normalizeEmail(user.email) === email)) {
            throw new Error('Ya existe un usuario con ese e-mail.');
        }

        const userId = generarIdSeguro();
        const now = new Date().toISOString();
        const newUser = {
            id: userId,
            name,
            email,
            passwordHash: hashPassword(password),
            role,
            createdAt: now
        };

        users.push(newUser);
        writeJsonFileSafe(usersFile, users);
        ensureDir(path.join(usersRootDir, userId));

        console.log('\n✅ Usuario creado correctamente');
        console.log(`ID: ${userId}`);
        console.log(`Nombre: ${name}`);
        console.log(`E-mail: ${email}`);
        console.log(`Rol: ${role}`);
    } finally {
        rl.close();
    }
}

main().catch((error) => {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
});
