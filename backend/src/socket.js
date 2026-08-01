// Small holder module so routes can emit socket.io events without creating
// a circular require() with server.js.

let io = null;

function setIO(instance) {
  io = instance;
}

function getIO() {
  if (!io) throw new Error('Socket.io has not been initialized yet');
  return io;
}

// Emit a notification to exactly one user's private room ("user_<id>").
// This is what guarantees other users never see it.
function emitNotificationToUser(userId, notification) {
  if (!io) return;
  io.to(`user_${userId}`).emit('new_notification', notification);
}

module.exports = { setIO, getIO, emitNotificationToUser };
