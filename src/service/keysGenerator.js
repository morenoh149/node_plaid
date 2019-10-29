const crypto = require('crypto');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

console.log(`Key (base64): ${key.toString('base64')}`);
console.log(`iv (base64): ${iv.toString('base64')}`);
