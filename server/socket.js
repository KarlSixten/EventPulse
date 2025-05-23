import { Server } from 'socket.io';

let io;

export function initSocket(httpServer, sessionMiddleware) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.engine.use(sessionMiddleware);

  io.on('connection', (socket) => {
    const socketRequest = socket.request;

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
