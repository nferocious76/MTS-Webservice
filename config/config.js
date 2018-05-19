'use strict';

exports.serverConfig = {
    port: 6477,
    host: '127.0.0.1'
};

exports.jwtConfig = {
    secret: 'mts-webservice',
    algorithm: 'HS256',
    expiresIn: 60*60*24*7
};

exports.socketConfig = {
    port: 6477,
    host: '127.0.0.1'
};

/* Local Redis */
exports.redisConfig = {
    port: 6379,
    host: 'localhost',
    password: 'pwd@redis143'
};

/* Remote Redis */
// exports.redisConfig = {
//     port: ,
//     host: '',
//     password: ''
// };

/* Local Database */

exports.dbConfig = {
    connectionLimit: 100,
    host: 'localhost',
    user: 'mts19052018',
    password: 'pwd@mts19052018',
    database: 'mts',
    debug: false
};

/* Heroku Database */
// exports.dbConfig = {
//     connectionLimit: 100,
//     host: '',
//     user: '',
//     password: '',
//     database: '',
//     debug: false
// };

exports.bcryptConfig = {
    rounds: 10
};