'user strict';

const helper        = require(__dirname + '/../helpers/helper.js');

const COULD_NOT_CREATE_RATING   = 'Could not create rating';
const COULD_NOT_RETRIEVE_RATING = 'Could not retrieve rating';
const RATING_EXISTS             = 'Rating already exists';
const RATING_CREATED            = 'Rating added';
const RATING_RETRIEVE           = 'Rating retrieved';

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

        function check_if_exists(data) {

            database((err, connection) => {
                if (err) { return helper.conn_err(res, err); }

                let name = data.name.toLowerCase();
                let query = 'SELECT * FROM `rating` \
                  WHERE LOWER(name) = ?';
                connection.query(query, [name], (err, rows, fields) => {
                    if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_CREATE_RATING)); }
                    if (rows.length > 0) { return helper.send400(helper.format_conn_err(connection, res, err, RATING_EXISTS)); }

                    add_rating(connection, data);
                });
            });
        }

        function add_rating(connection, data) {

          let query = 'INSERT INTO `rating` SET ?';
          connection.query(query, data, (err, rows, fields) => {
              if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_CREATE_RATING)); }

              success_response(connection, rows.insertId);
          });
        }

        function success_response(connection, id) {

            let query = 'SELECT * FROM `rating` WHERE `id` = ?';
            connection.query(query, id, (err, rows, fields) => {

                helper.send200(helper.format_conn(connection, res, rows[0], RATING_CREATED));
            });
        }

        proceed();
    }

    function fetch(req, res) {

        function proceed() {

            database((err, connection) => {
                if (err) { return helper.conn_err(res, err); }

                let limit = req.body.limit || 0;
                let offset = req.body.limit || 0;

                let query = 'SELECT * FROM `rating` \
                  LIMIT ? OFFSET ?';

                connection.query(query, [limit, offset], (err, rows, fields) => {
                    if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_RETRIEVE_RATING)); }

                    helper.send200(helper.format_conn(connection, res, rows, RATING_RETRIEVE));
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
