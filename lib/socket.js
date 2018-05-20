'use strict';

module.exports = (io, auth) => {

    io.use((socket, next) => {

        let query = socket.handshake.query;
        let token = query.token;

        if (!token) { return next(new Error('Missing token')); }

        auth.validate(token, (err, decoded) => {
            // if (!decoded) {
            //     console.log(`Invalid token Socket ID: ${socket.id} --- ${token}`);
            //     return next(new Error('Invalid token'));
            // }

            console.log(`Socket ID: ${socket.id} \ntoken: ${decoded}`);
            next();
        });
    });

    io.on('connection', socket => {
        console.log(`Socket connected: ${socket.id}`);

        socket.emit('status', 'Socket server is ready.');
        io.emit('status', `Socket connected: ${socket.id}`);

        socket.on('error', err => {
            console.log('Socket error: ', err);
        });

        socket.on('disconnect', reason => {
            let message = `${socket.id} has disconnected from the server. reason: ${reason}`;
            console.log(message);
            io.emit('status', message);
        });

        socket.on('message', msg => {
            console.log(`Message receive from: ${socket.id} -- content: ${msg}`);
            io.emit('message', { from: socket.id, message: msg });
        });
    });
};