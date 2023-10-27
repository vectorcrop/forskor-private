// Description: Twilio OTP verification
const { Server } = require("socket.io");

// Socket Instance
let io = null;

// Socket Connection
const connectSocket = (server) => {
  io = new Server(server);

  io.on("connection", (socket) => {
 
    //io by me
     // Listen for new order events and broadcast them to connected clients
  socket.on('new-order', () => {
    console.log( "new order*************** is joined to room");
    socket.broadcast.emit('order-added');
  });

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
