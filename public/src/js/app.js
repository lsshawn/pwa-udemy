
var deferredPrompt;
const enableNotificationButtons = document.querySelectorAll('.enable-notifications')

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification () {
  if ('serviceWorker' in navigator) {
    let options = {
      body: `You successfully subscribed.`,
      icon: '/src/images/icon/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200], // vibrate, pause, vibrate
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        {
          action: 'confirm',
          title: 'Okay',
          icon: '/src/images/icons/app-icon-96x96.png'
        },
        {
          action: 'cancel',
          title: 'Cancel',
          icon: '/src/images/icons/app-icon-96x96.png'
        }
      ]
    }

    // using Service Worker to display notification
    navigator.serviceWorker.ready
      .then((swreg) => {
        swreg.showNotification('Successfully subscribed (from SW)', options)
      })
  }
  // using Javascript to display notification
  // new Notification('Successfully subscribed', options)
}

function configurePushSub () {
  if (!('serviceWorker' in navigator)) {
    return
  }

  let reg

  navigator.serviceWorker.ready
    .then((swreg) => {
      return swreg.pushManager.getSubscription()
    })
    .then((sub) => {
      if (sub === null) {
        // create new subscription
        reg.pushManager.subscribe({
          userVisibleOnly: true
        })
      } else {
        // use existing subscription
      }
    })
}

function askForNotificationPermission () {
  Notification.requestPermission((result) => {
    console.log(`User Choice ${result}`)
    if (result  !== 'granted') {
      console.log('No notification permission granted')
    } else {
      configurePushSub()
      // displayConfirmNotification()
    }
  })
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = 'inline-block'
    enableNotificationButtons[i].addEventListener('click', askForNotificationPermission)
  }
}