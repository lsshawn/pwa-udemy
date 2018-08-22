var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
let form = document.querySelector('form')
let titleInput = document.querySelector('#title')
let locationInput = document.querySelector('#location')
const url = `https://pwagram-2b678.firebaseio.com/posts.json`
let networkDataReceived = false

var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({
      video: true
    })
    .then(function (stream) {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(function (err) {
      imagePickerArea.style.display = 'block';
    });
}

captureButton.addEventListener('click', function (event) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  var context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
    track.stop();
  });
});

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function() {
  createPostArea.style.transform = 'translateY(0)';
  initializeMedia();
  // }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)'
  // createPostArea.style.display = 'none';
  imagePickerArea.style.display = 'none'
  videoPlayer.style.display = 'none'
  canvasElement.style.display = 'none'
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// NOT USED. Cache on demand, e.g. an article saved for later
function onSaveButtonClicked (event) {
  console.log('clicked')
  if ('caches' in window) {
    // create new cache
    caches.open('user-requested')
      .then((cache) => {
        cache.add('https://httpbin.org/get')
        cache.add('/src/images/sf-boat.jpg')
      })
  }
}

function clearCard () {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'black';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  
  // let cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save'
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton)

  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}


function updateUI (data) {
  clearCard()
  for (var i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true
    console.log('From web ', data)
    var dataArray = []
    for (var key in data) {
      dataArray.push(data[key])
    }
    updateUI(dataArray)
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then((data) => {
      if (!networkDataReceived) {
        console.log('From cache ', data)
        updateUI(data)
      }
    })
}

function sendData () {
  fetch('https://us-central1-pwagram-2b678.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-2b678.appspot.com/o/minimal_wallpapers_5.png?alt=media&token=3af52138-178e-4240-862f-ac9be35409ad'
    })
  })
  .then((res) => {
    console.log('Sent Data ', res)
    updateUI()
  })
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Plese enter valid data')
    return
  }

  closeCreatePostModal()

  // SyncManager is the API for background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((sw) => {
        let post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value
        }
        // store into indexDB
        writeData('sync-posts', post)
          .then(() => {
            sw.sync.register('sync-new-posts')
          })
          .then(() => {
            let snackbarContainer = document.querySelector('#confirmation-toast')
            let data = { message: 'Your post was saved for syncing' }
            snackbarContainer.MaterialSnackbar.showSnackbar(data)
          })
          .catch((err) => console.log(err))
      })
  // if browser doesn't support Service Worker or SyncManager
  } else {
    sendData()
  }
})