/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'd1-seed.sql');
let sql = fs.readFileSync(filePath, 'utf8');

// Replace Unicode smart quotes with SQL-safe equivalents
sql = sql.replace(/\u2018/g, "''"); // LEFT SINGLE QUOTATION MARK
sql = sql.replace(/\u2019/g, "''"); // RIGHT SINGLE QUOTATION MARK
sql = sql.replace(/\u201C/g, '"');   // LEFT DOUBLE QUOTATION MARK
sql = sql.replace(/\u201D/g, '"');   // RIGHT DOUBLE QUOTATION MARK

fs.writeFileSync(filePath, sql, 'utf8');
console.log('Fixed smart quotes in d1-seed.sql');
