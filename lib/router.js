'use strict';

const path              = require('path');
const database          = require(__dirname + '/../lib/database.js');

const userJS            = require(__dirname + '/../controllers/user.js');


module.exports = (app, auth, socket) => {

    app.get('/', (req, res) => {
        res.status(200)
        .send({
            message: 'Welcome to MTS Webservice',
            license: 'MIT License'
        })
        .end();
    });

    app.get('/socket', (req, res) => {
        res.sendFile(path.resolve('public/socket.html'));
    });

    /** USER */
    const user      = userJS(database, auth);

    app.post('/user', user.create);
    app.post('/user/login', app.signin);

    

};