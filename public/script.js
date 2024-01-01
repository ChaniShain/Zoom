
const socket = io('/');
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

// 


// 
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
  let text = $('input');

  $('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('');
    }
  })

  socket.on('createMessage', message => {


    $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom();
  })
})

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

  currentTimeElement.textContent = ` ${formattedTime}`;
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
