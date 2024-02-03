
const socket = io('/');

const nameInput = document.getElementById('name');
const popup = document.getElementById('popup');
const acwrapper = document.getElementById('ac-wrapper');
const saveButton = document.getElementById('save');
const username_display = document.getElementById('username-display');
let isCanEnter = true;
let username = '';
// 
// document.getElementById('loginForm').addEventListener('submit', function (event) {
  // event.preventDefault();

  // Show loading element
  // const loadingElement = document.getElementById('loading');
  // loadingElement.classList.add('active');
// username = document.cookie.getItem('username');
// username_display.innerText = username;
const cookies = document.cookie.split(';');
for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'username') {
      username = decodeURIComponent(value);
        // username = value;
        username_display.innerText = username;
        break;
    }
}

// document.addEventListener("keypress", function (event) {
//   // console.log(nameInput.value);

//   if (event.key === "Enter") {
//     // event.preventDefault();
//     // let name = nameInput.value;

//     // if (event.value) {
//     // let code = event.value.charAt(event.value.length - 1);
//     // event.preventDefault();
//     // console.log(code);
//     // if (code.keyCode == 13){


//     // console.log(name);
//     console.log(nameInput.value);

//     hidePopup();


//     // event.preventDefault();

//   }
// });
// let name2 = '';
// document.addEventListener("keypress", function (event) {
//   if (event.key === "Enter") {
//     event.preventDefault();
//     // console.log(nameInput.value);
//     if (name2 !== '') {
//       popup.style.display = 'none';
//       acwrapper.style.display = 'none';

//     } else {
//       alert("Please enter your name."); // אפשר גם להציג הודעה אחרת
//     }
//   }
//   else{
//     name2 = nameInput.value;
//   }

// });
// function hidePopup() {
//   if (nameInput.value.trim() !== '') {
//     popup.style.display = 'none';
//     acwrapper.style.display = 'none';
//     isCanEnter=true;
//     username = nameInput.value;
//     username_display.innerText=username;
//     // document.getElementById('username-display').innerText = `User: ${username}`;
//     console.log(nameInput.value);

//     document.querySelector('.main_videos').style.display = 'block';
//   } else {
//     alert("Please enter your name."); // אפשר גם להציג הודעה אחרת
//   }
// }
const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}
var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030'
});
let myVideoStream;


navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {


  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId) => {
    setTimeout(connectToNewUser, 1000, userId, stream)
    // connectToNewUser(userId, stream);
  })

  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()

  })


  let text = $('#chat_messages');

  $('html').keydown((e) => {
    console.log(text.val());
    if (e.which == 13 && text.val().length !== 0 && isCanEnter) {
      // socket.emit('message', text.val());
      socket.emit('message', { username, message: text.val() });
      text.val('');
    }


  })

  // socket.on('createMessage', message => {


  //   $('.messages').append(`<li class="message"><b>user${nameInput.value}</b><br/>${message}</li>`);
  //   scrollToBottom();
  // })
  socket.on('createMessage', data => {
    const { username, message } = data;
    $('.messages').append(`<li class="message"><b>${username}</b><br/>${message}</li>`);
    scrollToBottom();
  })
})
// const leaveMeeting = (ROOM_ID) => {
//   console.log('leaving meeting')
//   socket.emit('disconnect', ROOM_ID);
// //   if (peers[userId]) {
// //     peers[userId].close();
// // }
// }
const leaveMeeting = (ROOM_ID) => {
  console.log('leaving meeting')
  socket.disconnect();
  const confirmationMessage = "Are you sure you want to leave the meeting?";
  if (confirm(confirmationMessage)) {
    this.window.close(); // Close the browser window
  }
  // socket.emit('leave-room', ROOM_ID);
  // Additional logic if needed
}


// socket.on('user-disconnected', userId => {
//     if (peers[userId]) peers[userId].close()
//   })


peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);

})

const connectToNewUser = (userId, stream) => {
  let call = peer.call(userId, stream);
  let video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
};


const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  }
  else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;

  }
}

const setMuteButton = () => {
  const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
  document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
  document.querySelector('.main_video_button').innerHTML = html;
}

const updateClock = () => {
  const currentTimeElement = document.getElementById("current-time");
  let now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;

  currentTimeElement.textContent = ` | ${formattedTime}`;
}

document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
});


// 
document.addEventListener('DOMContentLoaded', () => {
  const emojiButtons = document.querySelectorAll('.emoji-button');
  const emojiContainer = document.getElementById('emoji-animation');
  const emojiAnimation = document.getElementById('emoji-action');

  const messageInput = document.getElementById('message-input');


  emojiButtons.forEach(button => {
    button.addEventListener('click', () => {
      const emoji = button.getAttribute('data-emoji');

      socket.emit('emoji', emoji);

    });
  });

  socket.on('emoji-selected', (emoji) => {
    showAnimatedEmoji(emoji);
  });
  let emojiCounter = 0;

  function showAnimatedEmoji(emoji) {
    const emojiElement = document.createElement('div');
    const emojiId = `emoji-${emojiCounter++}`;
    console.log(emojiId)
    emojiElement.id = emojiId;
    emojiElement.innerHTML = emoji;
    emojiElement.classList.add('emoji-rise-animation');

    emojiAnimation.appendChild(emojiElement);

    setTimeout(() => {
      const elementToRemove = document.getElementById(emojiId);
      if (elementToRemove) {
        elementToRemove.remove();
      }
    }, 2200);
  }
});

