const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const sharp = require('sharp');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '')));

const port = 3000;

var auth = require('./auth.js');
var news = require('./news.js');
var banner = require('./banner.js');
var achievements = require('./achievements.js');

app.use('/auth', auth);
app.use('/news', news);
app.use('/banner', banner);
app.use('/achievements', achievements);

app.get('/serve/:filename', async (req, res) => {
    const filename = req.params.filename;
    const width = parseInt(req.query.width) || 1920;
    const quality = parseInt(req.query.quality) || 80;

    try {
    const imagePath = path.join(__dirname, filename);

    res.set('Content-Type', 'image/webp');

    const resizedImage = await sharp(imagePath)
    .webp({ quality: quality })
    .resize({
        width: width,
        withoutEnlargement: true
    })
    .toBuffer();

    res.send(resizedImage);

    } catch (error) {
        console.error("Error processing image:", error);
        res.status(404).send("Error processing image");
    }

})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    });

