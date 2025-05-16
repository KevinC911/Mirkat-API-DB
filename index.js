const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '')));

const port = 3000;

var auth = require('./auth.js');
var news = require('./news.js');
var banner = require('./banner.js');

app.use('/auth', auth);
app.use('/news', news);
app.use('/banner', banner);

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from the API!' });
    });

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    });

