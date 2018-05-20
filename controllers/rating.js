'user strict';

const helper        = require(__dirname + '/../helpers/helper.js');
const config        = require(__dirname + '/../config/config.js');

const COULD_NOT_CREATE_RATING   = 'Could not create rating';
const COULD_NOT_RETRIEVE_RATING = 'Could not retrieve rating';
const RATING_CREATED            = 'Rating added';
const RATING_RETRIEVE            = 'Rating retrieved';

module.exports = (database, auth) => {

    function create(req, res) {

        function proceed() {

            let form = {
                name: '',
                _description: ''
            }
            helper.validateBody(form, req.body, res, () => {
                check_if_exists(req.body);
            });
        }

        function create_rating(data) {

            database((err, connection) => {
                if (err) { return helper.conn_err(res, err); }

                let query = 'INSERT INTO `rating` SET ?';
                connection.query(query, data, (err, rows, fields) => {
                    if (err) { return helper.send400(connection, res, err, COULD_NOT_CREATE_USER); }

                    success_response(connection, rows.insertId);
                });
            });
        }

        function success_response(connection, id) {

            let query = 'SELECT * FROM `rating` WHERE `id` = ?';
            connection.query(query, id, (err, rows, fields) => {

                helper.send200(connection, res, rows[0], RATING_CREATED);
            });
        }

        proceed();
    }

    function retrieve(req, res) {

        function proceed() {

            let limit = Number(req.query.limit) || 10;
            let offset = Number(req.query.offset) || 0;

            database((err, connection) => {
                if (err) { return helper.conn_err(res, err); }

                let query = 'SELECT * FROM `rating` \
                    LIMIT ? OFFSET ?';
                connection.query(query, [limit, offset], (err, rows, fields) => {
                    if (err) { return helper.send400(connection, res, err, COULD_NOT_RETRIEVE_RATING); }

                    helper.send200(connection, res, rows, RATING_RETRIEVE);
                });
            });
        }

        proceed();
    }

    return {
        create,
        retrieve
    }
};