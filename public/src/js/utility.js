
// open indexDB data store
let dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {
      keyPath: 'id'
    })
  }
})

function writeData (st, data) {
  return dbPromise
    .then((db) => {
      var tx = db.transaction(st, 'readwrite')
      var store = tx.objectStore(st)
      store.put(data)
      return tx.complete
    })
}

function readAllData (st) {
  return dbPromise
    .then((db) => {
      let tx = db.transaction(st, 'readonly')
      let store = tx.objectStore(st)
      return store.getAll()
    })
}

function clearAllData (st) {
  return dbPromise
    .then((db) => {
      let t = db.transaction(st, 'readwrite')
      let store = tx.objectStore(st)
      store.clear()
      return tx.complete
    })
}

function deleteItemFromData (st, id) {
  return dbPromise
    .then((db) => {
      let tx = db.transaction(st, 'readwrite')
      let st = tx.objectStore(st)
      store.delete(id)
      return tx.complete
    })
    .then(() => console.log('Item deleted'))
}