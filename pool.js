const mysql = require('mysql2');
const dbconf = require(global.__dirname+'/dbconfig.json');

module.exports = pool = mysql.createPool(dbconf);