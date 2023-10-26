const admin = require('firebase-admin');
const chalk = require('chalk');
/* Env Configuration 
* FIREBASE_DB_URL = database url
* FIREBASE_CRED = Srvice account
*/
try {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CRED)),
    databaseURL: process.env.FIREBASE_DB_URL
  })
  /*onsole.log(chalk.cyan('\nConnected to database!'))*/
  const db = admin.database();

  function writeData(path, obj) {
    return new Promise((resolve, reject) => {
      const ref = db.ref(path);
      ref.push(obj).then((snapshot) => {
        resolve({
          msg: "success",
          method: "write"
        });
      }).catch((error) => {
        reject({
          msg: "error",
          method: "write"
        });
      });
    });
  }

  function readData(path) {
    return new Promise((resolve, reject) => {
      const ref = db.ref(path);
      ref.once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let dataArray = [];
          snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            childData["fid"] = childSnapshot.key;
            dataArray.push(childData)
          });
          resolve(dataArray);
        }
      }).catch((error) => {
        reject({
          msg: "error",
          method: "read"
        });
      });
    });
  }

  function updateData(path, obj) {
    return new Promise((resolve, reject) => {
      const ref = db.ref(path);
      ref.update(obj).then(() => {
        resolve({
          msg: "success",
          method: "update"
        });
      }).catch((error) => {
        reject({
          msg: "error",
          method: "update"
        });
      });
    });
  }

  function removeData(path) {
    return new Promise((resolve, reject) => {
      const ref = db.ref(path);
      ref.remove().then(() => {
        resolve({
          msg: "success",
          method: "remove"
        });
      }).catch((error) => {
        reject({
          msg: "error",
          method: "remove"
        });
      });
    });
  }
} catch (err) {
  console.log(err.message)
}

module.exports = {
  writeData, readData, updateData, removeData
}