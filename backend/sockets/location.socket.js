export const locationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("📡 User connected:", socket.id);

    // join room (userId based)
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User joined room: ${userId}`);
    });

    // send live location
    socket.on("send-location", (data) => {
      const { userId, lat, lng } = data;

      // broadcast to others
      socket.broadcast.emit("receive-location", {
        userId,
        lat,
        lng,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};