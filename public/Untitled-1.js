const socket = io("/");
/**
 *
 * the peer object where we create & recevie connections
 * */
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

// now create a dymanic video element
const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");

/**
 *
 * the line mean it does not replay to me
 *
 * */

myVideo.muted = true;

let myVideoStream = "";

const addVideoStream = (video, stream) => {
  console.log("--->>>  video steam is called --->>>");
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    /**
     *
     * here my stream is created
     *
     * */
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", function (call) {
      console.log("calling is activate");
      call.answer(stream);
      console.log("stream is -------", stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        console.log("append a video view to Grid");
        // addVideoStream(video, userVideoStream);
        video.srcObject = userVideoStream;
        video.addEventListener("loadedmetadata", () => {
          video.play();
        });
        videoGrid.append(video);
      });
    });

    /**
     * this only call when new user is connected
     * this is a listner which is call when a user is connected to a room 
     * when a new user can join the room this function tigggred from the server.js
     * 
     * this is call when new user can join the room 
     * in this case every user has some roomID , 
     * but different peer-to-peer connection id (newUserConnID)

    * */

    socket.on("user-connected", (newUserConnID) => {
      console.log("user conn is -------", newUserConnID);

      connectToNewUser(newUserConnID, stream);
    });
  });

/**
 *
 *
 * Emit or call a function & tell that user is joinig the room
 * for now we can join the room with a specific room ID , for now we have an access of variable call
 * ROOM_ID in this file , so we join with this ROOM_ID
 *
 * when successfull peer connection made then emit
 * */

peer.on("open", (id) => {
  console.log("userConnID from Peer JS -----<<<< ", id);
  // console.log("emit join-room , from Peer JS -----<<<< ", ROOM_ID);

  /**
   *
   *  here the id is return by the peer object when connection is on ,
   *  & the id is userConnectionID
   *
   * */
  socket.emit("join-room", ROOM_ID, id);
});

connectToNewUser = (newUserConnID, stream) => {
  /**
   *
   * in order to identify user details we use peer to peer
   * peer JS is used to send stream b/w differnet people
   
   * */

  console.log("new user connected!! ");

  /**
   *
   * now in this we actually call other user on peer with their iD
   * in this we call new user & pass our stream our the peer network
   *
   * */
  const call = peer.call(newUserConnID, stream);
  const video = document.createElement("video");
  //   here the userVideoStream is the stream of new user who is connected
  call.on("stream", (userVideoStream) => {
    // now simpliy append newUser Stream to our video grid
    addVideoStream(video, userVideoStream);
  });
};

/**
 *
 * now if any user want to a chat with other , their enterd value is picked by below code
 *
 *
 * */

let text = $("input");
$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    // console.log(text.val());
    // this send the message
    socket.emit("message", text.val());
    text.val("");
  }
});

// call when user receive messages

socket.on("createMessage", (message) => {
  // console.log("msg from server is ", message);

  // now we will append the received msgs

  // `` is called template string
  $("ul").append(`<li class="message"><b>user </b>${message}</li>`);
  /**
   * when we send & receive so many messages our right section length goan distrube
   * so to fix it we make a new scroll fun to fix it out
   * */

  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

/***
 *
 *
 * For mute and unmute the audio
 *
 */

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class=" fas fa-microphone"></i>
  <span>Mute</span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};

/**
 *
 * For stop or start video
 *
 * */

const stopStartVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class=" fas fa-video"></i>
  <span>Stop Video </span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
  <span>Start Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
