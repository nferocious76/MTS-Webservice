'use strict';

const helper        = require(__dirname + '/../helpers/helper.js');

const COULD_NOT_CREATE_MOVIE  = 'Could not create movie';
const COULD_NOT_UPDATE_MOVIE  = 'Could not update movie';
const MOVIE_EXISTS            = 'Movie already exists';
const MOVIE_CREATED           = 'Movie created';
const MOVIE_UPDATED           = 'Movie updated';

module.exports = (database, auth) => {

  function create(req, res) {

      function proceed() {

          let form = {
              rating_id: 0,
              title: '',
              image: '',
              genre: '',
              directors: '',
              casts: '',
              length: 0,
              release_date: '',
              about: ''
          }
          helper.validateBody(form, req.body, res, () => {
              check_if_exists(req.body);
          });
      }

      function check_if_exists(data) {

          database((err, connection) => {
              if (err) { return helper.conn_err(res, err); }

              let title = data.title.toLowerCase();
              let query = 'SELECT * FROM `movie` \
                WHERE LOWER(title) = ?';
              connection.query(query, [title], (err, rows, fields) => {
                  if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_CREATE_MOVIE)); }
                  if (rows.length > 0) { return helper.send400(helper.format_conn_err(connection, res, err, MOVIE_EXISTS)); }

                  add_movie(connection, data);
              });
          });
      }

      function add_movie(connection, data) {

        let query = 'INSERT INTO `movie` SET ?';
        connection.query(query, data, (err, rows, fields) => {
            if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_CREATE_MOVIE)); }

            success_response(connection, rows.insertId);
        });
      }

      function success_response(connection, id) {

          let query = 'SELECT * FROM `rating` WHERE `id` = ?';
          connection.query(query, id, (err, rows, fields) => {

              helper.send200(helper.format_conn(connection, res, rows[0], MOVIE_CREATED));
          });
      }

      proceed();
  }

  function update(req, res) {

      function proceed() {

          let form = {
              _rating_id: 0,
              _title: '',
              _image: '',
              _genre: '',
              _directors: '',
              _casts: '',
              _length: 0,
              _release_date: '',
              _about: ''
          }
          helper.validateBody(form, req.body, res, () => {
              update(req.body);
          });
      }

      function update(data) {

          let id = req.params.id;
          database((err, connection) => {
              if (err) { return helper.conn_err(res, err); }

              let query = 'UPDATE MOVIE SET ? WHERE `id` = ?';
              connection.query(query, [data, id], (err, rows, fields) => {
                  if (err) { return helper.send400(helper.format_conn_err(connection, res, err, COULD_NOT_UPDATE_MOVIE)); }

                  success_response(connection, id);
              });
          });
      }

      function success_response(connection, id) {

          let query = 'SELECT * FROM `movie` WHERE `id` = ?';
          connection.query(query, id, (err, rows, fields) => {

              helper.send200(helper.format_conn(connection, res, rows[0], MOVIE_UPDATED));
          });
      }

      proceed();
  }

  return {
    create,
    update
  }
}
