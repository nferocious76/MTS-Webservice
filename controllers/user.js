'use strict';

const helper        = require(__dirname + '/../helpers/helper.js');
const config        = require(__dirname + '/../config/config.js');

const bcrypt        = require('bcryptjs');
const bcryptConf    = config.bcryptConfig;

const COULD_NOT_CREATE_USER = 'Could not create user';
const USER_CREATED          = 'User created';

module.exports = (database, auth) => {

    fucntion create(req, res) {

        function proceed() {

            let form = {
                username: '',
                email: '',
                password: ''
            }
            helper.validateBody(form, req.body, res, () => {
                check_if_exists(req.body);
            });
        }

        function check_if_exists(data) {

            database((err, connection) => {
                if (err) { return helper.conn_err(res, err); }

                let query = 'SELECT * FROM `user` WHERE `email` = ?';
                connection.query(query, data.email, (err, rows, fields) => {
                    if (err) { return helper.send400(connection, res, err, COULD_NOT_CREATE_USER); }
                    if (rows.length > 0) { return helper.send400(connection, res, err, 'Email already exists'); }

                    encrypt_password(connection, data);
                });
            });
        }

        function encrypt_password(connection, data) {

            bcrypt.genSalt(bcryptConf.rounds, (err, salt) => {
                if (err) { return helper.send400(res, err, COULD_NOT_CREATE_USER); }

                let password = data.password;
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) { return helper.send400(res, err, COULD_NOT_CREATE_USER); }

                    data.password = hash;
                    create_user(connection, data);
                });
            });
        }

        function create_user(connection, data) {
            
            let query = 'INSERT INTO `user` SET ?';
            connection.query(query, data, (err, rows, fields) => {
                if (err) { return helper.send400(connection, res, err, COULD_NOT_CREATE_USER) }

                success_response(connection, rows.insertId);
            });
        }

        function success_response(connection, id) {

            let query = 'SELECT * FROM `user` WHERE `id` = ?';
            connection.query(query, id, (err, rows, fields) => {

                let user = rows[0];
                delete user.password;

                auth.sign({
                    id: user.id,
                    username: user.username,
                    email: user.email
                }, token => {
                    user.token = token;
                    helper.send200(connection, res, user, USER_CREATED);
                });
            });
        }

        proceed();
    }

    return {
        create
    }
};