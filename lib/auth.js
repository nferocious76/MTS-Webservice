'use strict';

const config    = require(__dirname + '/../config/config.js');
const helper    = require(__dirname + '/../helpers/helper.js');

const jwt       = require('jsonwebtoken');
const redis     = require('redis');

const redisConf = config.redisConfig;
const jwtConf   = config.jwtConfig;

const client    = redis.createClient({ 
    port: redisConf.port, 
    host: redisConf.host, 
    password: redisConf.password 
});

client.on('ready', () => {
    console.log('Redis server is running.');
});

client.on('error', err => {
    console.log('Error in redis server.', err);
});

exports.sign = (payload, next) => {

    let token = jwt.sign(payload, jwtConf.secret, {
        algorithm: jwtConf.algorithm,
        expiresIn: jwtConfig.expiresIn
    });

    let id = payload.id.toString();
    client.set(id, token);
    client.expire(id, jwtConf.expiresIn);

    next(token);
};

exports.signout = (token, res) => {

    if (!token) { return next({ code: 403, message: 'Bad request.' }, null); }

    this.validate(token, (err, decoded) => {

        if (decoded) {
            client.del(decode.id.toString(), (err, reply) => {

                if (reply === 1) {
                    helper.send200(res, 'You have logged out.');
                }else{
                    helper.sendErrorCode(res, 403, err, 'Invalid token.');
                }
            });
        }else{
            helper.send400(res, err, 'Failed to validate token.');
        }
    });
};

exports.validate = (token, next) => {

    if (!token) { return next({ code: 403, message: 'Bad request.' }, null); }

    jwt.verify(token, jwtConf.secret, (err, decoded) => {

        if (!err) {
            client.exists(decoded.id.toString(), (err, reply) => {
                if (reply === 1) {
                    next(null, decoded);
                }else{
                    next(err, null);
                }
            });
        }else{
            next(err, null);
        }
    });
};