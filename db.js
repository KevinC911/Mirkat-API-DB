const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.AUTH_FIRESTORE_JSON);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

module.exports = db;