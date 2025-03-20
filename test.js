const crypto = require('crypto');
const hash = crypto.createHash('sha256').update('test').digest('hex');
const hash1 = hash
console.log(hash1)