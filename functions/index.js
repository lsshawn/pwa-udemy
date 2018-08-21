const functions = require('firebase-functions');
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

var serviceAccount = require("./pwagram-fb-key.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-2b678.firebaseio.com/'
})

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin.database().ref('posts').push({
      id: request.body.id,
      titla: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
    .then(() => {
      reponse.status(201).json({
        message: 'Data stored', 
        id: request.body.id
      })
    })
    .catch((err) => {
      response.status(500).json({ error: err })
    })
  })
});
