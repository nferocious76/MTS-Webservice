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

exports.format_conn = (conn, res, data, msg) => {
	return { 
		conn: conn,
		res: res,
		data: data,
		msg: msg
	}
}

exports.format_conn_err = (conn, res, err, msg) => {
	return { 
		conn: conn,
		res: res,
		err: err,
		msg: msg
	}
}

exports.format_data = (res, data, msg) => {
	return {
		res: res,
		data: data,
		msg: msg
	}
}

exports.format_err = (res, err, msg) => {
	return {
		res: res,
		err: err,
		msg: msg
	}
}

exports.format_res = (res, msg) => {
	return {
		res: res,
		msg: msg
	}
}

exports.send200 = (args) => {

	if (args.conn) {
		args.conn.release();
	}

	let res = args.res, 
		data = args.data, 
		message = args.msg;
	let success_data = this.construct_success_data(message, data);

	res.status(200)
	.send(success_data)
	.end();
};

exports.send400 = (args) => {

	if (args.conn) {
		args.conn.release();
	}

	let res = args.res, 
		err = args.err, 
		message = args.msg;
	let error_data = this.construct_error_data(message, this.checkError(err));

	res.status(400)
	.send(error_data)
	.end();
};

exports.send403 = (res, err, message) => {
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