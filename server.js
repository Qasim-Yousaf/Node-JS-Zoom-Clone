const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidv4 } = require("uuid");

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomID, userConnID) => {
    console.log("jjjjjj");
    console.log("joinned room , with Room ID ---- ", roomID);

    socket.join(roomID);
    socket.broadcast.to(roomID).emit("user-connected", userConnID);
    socket.on("message", (message) => {
      io.to(roomID).emit("createMessage", message);
    });
  });
});
server.listen(process.env.PORT || 3030);
