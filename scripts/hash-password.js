const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.error('Usage: node hash-password.js <your-password>');
    process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n--- BCRYPT HASH GENERATOR ---');
console.log('Password:', password);
console.log('Hashed Password (copy this to Vercel/ENV):');
console.log(hash);
console.log('-----------------------------\n');
