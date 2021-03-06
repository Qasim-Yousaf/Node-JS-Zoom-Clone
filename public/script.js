const socket = io("/");
const videoGrid = document.getElementById("video-grid");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
let myVideoStream = "";

const myVideo = document.createElement("video");
myVideo.muted = true;

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
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", function (call) {
      call.answer(stream);
      console.log("calling is activate");
      console.log("stream is -------", stream);
      const videoo = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        console.log("append a video view to Grid");
        addVideoStream(videoo, userVideoStream);
      });
    });

    socket.on("user-connected", (newUserConnID) => {
      console.log("user conn is -------", newUserConnID);

      connectToNewUser(newUserConnID, stream);
    });
  });

peer.on("open", (id) => {
  console.log("userConnID from Peer JS -----<<<< ", id);

  socket.emit("join-room", ROOM_ID, id);
});

connectToNewUser = (newUserConnID, stream) => {
  console.log("new user connected!! ");

  const call = peer.call(newUserConnID, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

let text = $("input");
$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul").append(`<li class="message"><b>user </b>${message}</li>`);

  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

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
