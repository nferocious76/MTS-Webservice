'use strict';

const path              = require('path');
const database          = require(__dirname + '/../lib/database.js');

const userJS            = require(__dirname + '/../controllers/user.js');
const ratingJS          = require(__dirname + '/../controllers/rating.js');

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

    app.post('/users', user.create);
    app.post('/auth/sign-in', user.signin);

    /** RATING */
    const rating    = ratingJS(database, auth);

    app.post('/ratings', rating.create);
    app.post('/ratings/all', rating.fetch);

};
