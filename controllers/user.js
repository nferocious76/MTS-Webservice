'use strict';

const helper        = require(__dirname + '/../helpers/helper.js');
const config        = require(__dirname + '/../config/config.js');

const bcrypt        = require('bcryptjs');
const bcryptConf    = config.bcryptConfig;

const COULD_NOT_CREATE_USER = 'Could not create user';
const USER_CREATED          = 'User created';
const LOGIN_FAILED          = 'Invalid username or password';
const LOGIN_SUCCESS         = 'Login successful';
const USER_EXISTS           = 'Email already exists';

module.exports = (database, auth) => {

    function create(req, res) {

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
                    if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_CREATE_USER)); }
                    if (rows.length > 0) { return helper.send400(helper.format_conn_err(connection, res, err, USER_EXISTS)); }

                    encrypt_password(connection, data);
                });
            });
        }

        function encrypt_password(connection, data) {

            bcrypt.genSalt(bcryptConf.rounds, (err, salt) => {
                if (err) { return helper.send400(helper.format_err(res, err, COULD_NOT_CREATE_USER)); }

                let password = data.password;
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) { return helper.send400(helper.format_err(res, err, COULD_NOT_CREATE_USER)); }

                    data.password = hash;
                    create_user(connection, data);
                });
            });
        }

        function create_user(connection, data) {

            let query = 'INSERT INTO `user` SET ?';
            connection.query(query, data, (err, rows, fields) => {
                if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_CREATE_USER)); }

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
                    helper.send200(helper.format_conn(connection, res, user, USER_CREATED));
                });
            });
        }

        proceed();
    }

    function signin(req, res) {

        function proceed() {

            let form = {
                username: '',
                password: ''
            }
            helper.validateBody(form, req.body, res, () => {
                login(req.body);
            });
        }

        function login(data) {

            database((err, connection) => {
                if (err) { return helper.conn_err(res, err); }

                let query = 'SELECT * FROM `user` WHERE `email` = ?';
                connection.query(query, data.email, (err, rows, fields) => {
                    if (err || rows.length == 0) { return helper.send400(helper.format_conn_err(connection, res, err, LOGIN_FAILED)); }
                    connection.release();

                    validate_data(data, rows[0]);
                });
            });
        }

        function validate_data(data, user_data) {

            bcrypt.compare(data.password, user_data.password, (err, result) => {
                if (err || !result) { return helper.send400(helper.format_err(res, err, LOGIN_FAILED)); }

                delete user_data.password;
                auth.sign({
                    id: user_data.id,
                    username: user_data.username,
                    email: user_data.email
                }, token => {
                    user_data.token = token;
                    heper.send200(helper.format_data(res, user_data, LOGIN_SUCCESS));
                });
            });
        }

        proceed();
    }

    return {
        create,
        signin
    }
};
