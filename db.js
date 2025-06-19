const admin = require('firebase-admin');

admin.initializeApp();

var db = admin.firestore();

module.exports = db;