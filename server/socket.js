import { Server } from 'socket.io';

let io;

export function initSocket(httpServer, sessionMiddleware, options) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, options);

  io.engine.use(sessionMiddleware);

  io.on('connection', (socket) => {
    // request er det underlæggende HTTP kald der igangsatte websocket.
    const socketRequest = socket.request;

    // sikrer at jeg altid tjekker på 'frisk' data.
    socketRequest.session.reload((error) => {
      if (error) {
        socket.disconnect(true);
        return;
      }

      const { user } = socketRequest.session;

      if (user && user.id) {
        const userId = user.id;
        const roomName = userId.toString();

        socket.join(roomName);

        socket.on('disconnect', () => {
        });
      } else {
        socket.disconnect(true);
      }
    });
  });
  return io;
}
export default function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return io;
}
