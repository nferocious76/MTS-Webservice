'use strict';

const util  = require(__dirname + '/util.js');

exports.validateBody = (form, source, res, next) => {

	let data = util._get
	.form_data(form)
	.from(source);

	if (data instanceof Error) {
		let error_data = this.construct_error_data(data.message, null);

		return res.status(400)
		.send(error_data)
		.end();
	}

	next();
};

exports.checkIsEmpty = (source, res, next) => {

	if (!source) {
		return this.send400(res, null, "Fields cannot be empty.");
	}

	for (let key in source) {
		if (!source[key]) {
			return this.send400(res, null, `${key}` + " cannot be empty.");
		}
	}

	next();
};

exports.send200 = (...args) => {
	let res, data, message;

	if (args.length == 4) {
		args[0].release();

		res = args[1];
		data = args[2];
		message = args[3];
	}else if (args.length == 3) {
		res = args[0];
		data = args[1];
		message = args[2];
	}else{
		res = args[0];
		message = args[1];
	}

	let success_data = this.construct_success_data(message, data);

	res.status(200)
	.send(success_data)
	.end();
};

exports.send400 = (...args) => {
	let res, err, message;

	if (args.length == 4) {
		args[0].release();

		res = args[1];
		err = args[2];
		message = args[3];
	}else{
		res = args[0];
		err = args[1];
		message = args[2];
	}

	let error_data = this.construct_error_data(message, this.checkError(err));

	res.status(400)
	.send(error_data)
	.end();
};

exports.send403 = (...args) => {
	let [res, err, message] = args;
	let error_data = this.construct_error_data(message, this.checkError(err));

	res.status(403)
	.send(error_data)
	.end();
};

exports.conn_err = (res, err) => {
	let error_data = this.construct_error_data('Connection error', this.checkError(err));

	res.status(400)
	.send(error_data)
	.end();
};

exports.rollback = (connection, res, err) => {

	connection.rollback(() => {
		connection.release();

		this.sendConnectionError(res, err);
	});
};

exports.rollbackMsg = (connection, res, err, msg) => {

	connection.rollback(() => {
		connection.release();

		this.send400(res, err, msg);
	});
};

exports.checkError = (err) => {

	if (err) {
		let code = err.code.toString();

		if (code === 'ER_BAD_FIELD_ERROR' ||
			code === 'ER_WRONG_VALUE_COUNT_ON_ROW' ||
			code === 'ER_NO_SUCH_TABLE' ||
			code === 'ER_WRONG_TABLE_NAME' ||
			code === 'ER_ACCESS_DENIED_ERROR' ||
			code === 'ER_NO_REFERENCED_ROW_2') {

			return this.log_err(err, { message: 'Bad parameters.' });

		}else if (code === 'ER_DUP_ENTRY'){
			return this.log_err(err, { message: err.sqlMessage });

		}else if (code === 'ECONNREFUSED') {
			return this.log_err(err, { message: 'Server connection error.' });

		}else if (code === 'ER_PARSE_ERROR') {
			return this.log_err(err, { message: 'Server error.' });
		}
	}

	return err;
};

exports.log_err = (err, data) => {
	console.log('Server error log: ', err);

	return data;
}

exports.construct_error_data = (context, data) => {

	let error_data = {
		success: false,
		message: context,
		data: data
	};

	return error_data;
};

exports.construct_success_data = (context, data) => {

	let success_data = {
		success: true,
		message: context,
		data: data
	};

	return success_data;
}