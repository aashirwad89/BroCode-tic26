export const locationSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("join-room", (sessionId) => {
      socket.join(sessionId);
    });

    socket.on("send-location", ({ sessionId, coords }) => {
      socket.to(sessionId).emit("receive-location", coords);
    });

  });
};