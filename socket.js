let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, { cors: { origin: "*" } });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new error('socket not avail')
        }
        return io;
    }
}