'use strict';

const config    = require(__dirname + '/config/config.js');
const router    = require(__dirname + '/lib/router.js');
const socketJS  = require(__dirname + '/lib/socket.js');
const auth      = require(__dirname + '/lib/auth.js');

const express       = require('express');
const app           = express();
const http          = require('http');
const morgan        = require('morgan');
const fs            = require('fs');
const path          = require('path');
const bodyParser    = require('body-parser');
const socketIO      = require('socket.io');

const jwtConf       = config.jwtConfig;
const serverConf    = config.serverConfig;

module.exports = start();

function start() {

    process.setMaxListeners(0);

    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('.'));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    const server    = http.Server(app);
    const io        = socketIO(server);
    const socket    = socketJS(io, auth);

    router(app, auth, socket);

    server.listen(process.env.PORT || serverConf.port, () => {
        console.log(`listening on port: ${serverConf.port}`);
    });

    return app;
}