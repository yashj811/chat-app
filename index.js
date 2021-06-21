const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Web Socket Connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", {
      text: "Welcome",
      createdAt: new Date().getTime(),
    });
    socket.broadcast.to(room).emit("message", {
      text: `${username} has joined`,
      createdAt: new Date().getTime(),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    io.emit("message", message);
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", {
      text: "A user has left",
      createdAt: new Date().getTime(),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server started on PORT - ${PORT}`);
});
