const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");

const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});


// Chat history server start

const chatHistory = {};

io.on("connection", (socket) => {
  console.log(`A user connected with socket id: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });


  socket.on("request_history", (room) => {
    if (chatHistory[room]) {
      io.to(room).emit("receive_history", chatHistory[room]);
    }
  });

  //send message connection server 

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    if (!chatHistory[data.room]) {
      chatHistory[data.room] = [];
    }
    chatHistory[data.room].push(data);
  });


  //delete message connection server
  socket.on("delete_messages", (data) => {
    const { room, messageIds } = data;

    if (chatHistory[room]) {
      chatHistory[room] = chatHistory[room].filter(
        (message) => !messageIds.includes(message.id)
      );

      io.to(room).emit("update_messages", chatHistory[room]);
    }
  });
 
//coneection status server

  socket.on("disconnect", () => {
    console.log(`User disconnected with socket id: ${socket.id}`);
  });

  socket.on("leave_room", (data) => {
    socket.leave(data);
    console.log(`User with ID: ${socket.id} left room: ${data}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
