'use strict';

const dbConf	= require(__dirname + '/../config/config.js').dbConfig;
const mysql     = require('mysql');

const pool      = mysql.createPool(dbConf);

module.exports = next => {
    
    return pool.getConnection(next);
}