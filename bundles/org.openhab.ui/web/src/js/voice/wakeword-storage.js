class WakewordStorage {
  loadDB () {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('wakewordsDB', 1)
      request.onupgradeneeded = function (e) {
        e.target.result.createObjectStore('wakewords', {
          autoIncrement: true
        })
      }
      request.onsuccess = function (e) {
        resolve(e.target.result)
      }
      request.onerror = function (e) {
        reject(new Error('Unable to load db'))
      }
    })
  }

  async storeFile (file) {
    const db = await this.loadDB()
    const trans = db.transaction(['wakewords'], 'readwrite')
    return new Promise((resolve, reject) => {
      const request = trans.objectStore('wakewords').put(file, 'current')
      request.onsuccess = function (e) {
        resolve()
      }
      request.onerror = function (e) {
        reject(e)
      }
    })
  }

  async clean () {
    const db = await this.loadDB()
    const trans = db.transaction(['wakewords'], 'readwrite')
    return new Promise((resolve, reject) => {
      const request = trans.objectStore('wakewords').delete('current')
      request.onsuccess = function (e) {
        resolve()
      }
      request.onerror = function (e) {
        reject(e)
      }
    })
  }

  async getFile () {
    const db = await this.loadDB()
    const trans = db.transaction(['wakewords'], 'readwrite')
    return new Promise((resolve) => {
      const request = trans.objectStore('wakewords').get('current')
      request.onsuccess = function (e) {
        resolve(e.target.result)
      }
      request.onerror = function (e) {
        resolve(null)
      }
    })
  }
}
export const wakewordStorage = new WakewordStorage()
