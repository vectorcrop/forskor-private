// Description: Twilio OTP verification
const { Server } = require("socket.io");

// Socket Instance
let io = null;

// Socket Connection
const connectSocket = (server) => {
  io = new Server(server);

  io.on("connection", (socket) => {

    // Join a room in socket
    socket.on("subscribe", (subscribeId) => {
      socket.join(subscribeId); 
      console.log(subscribeId + " is joined to room");
    });

    // Leave a room from socket
    socket.on("unsubscribe", (subscribeId) => {
      socket.leave(subscribeId);
      console.log(subscribeId + " was leave from room");
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return io;
};

// Socket Emit
module.exports = connectSocket;
