'use strict';

const path              = require('path');
const database          = require(__dirname + '/../lib/database.js');


module.exports = (app, auth, socket) => {

    app.get('/', (req, res) => {
        res.status(200)
        .send({
            message: 'Welcome to MTS Webservice',
            license: 'MIT License'
        })
        .end();
    });
};