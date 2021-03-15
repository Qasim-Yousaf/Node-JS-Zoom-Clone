const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
/**
 *
 * user peer JS live communication b/w diff clients browser
 *
 * */
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
/**
 *
 * now tell peer server which url we use
 *
 * */

app.use("/peerjs", peerServer);

/**
 *
 *  specific way into import uuid version 4.
 *
 * */
const { v4: uuidv4 } = require("uuid");
/**
 *
 * example of uuidv4 badaf671-9dc7-4a79-9544-01f72e4ca78f
 * */

app.set("view engine", "ejs");

/**
 * tell the server is about public folder for the project
 *
 */

app.use(express.static("public"));

app.get("/", (req, res) => {
  /**
   *
   * when root url is hit , it auto redirect them to room url with a unique ID
   *
   * */
  res.redirect(`/${uuidv4()}`);
});

/**
 *
 * :room is a parameter ,
 *  pass JS variable to html or .ejs file
 *
 * */
app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomID, userConnID) => {
    console.log("jjjjjj");
    console.log("joinned room , with Room ID ---- ", roomID);
    socket.join(roomID);

    // this tell that someone is connected to room
    // socket.to(roomID).broadcast.emit("user-connected");
    // socket.broadcast.to(roomID).emit("user-connected");

    // socket.to(roomID);
    socket.broadcast.to(roomID).emit("user-connected", userConnID);
    // only emit the funtion
    // socket.emit("user-connected");

    /**
     * when a user is connected we also make a recevier which can recveird new or previous user messages
     *
     * */
    socket.on("message", (message) => {
      // now emit this message to script file where the actuall receiver is & that is resp to display msg's
      io.to(roomID).emit("createMessage", message);
    });
  });
});
server.listen(process.env.PORT || 3030);

// const fs = require("fs");
// const path = require("path");
// const roomJsFile = path.join(__dirname, "views/room.ejs");
//   fs.readFile(roomJsFile, "utf8", (err, data) => {
//     if (err) throw err;
//     res.writeHead(200, { "content-type": "text/html" });
//     res.write(data);
//     res.end();
//   });
