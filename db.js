const sqlite = require('sqlite3').verbose();
require('dotenv').config();

const db = new sqlite.Database(`./db/${process.env.DB_NAME}`, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;