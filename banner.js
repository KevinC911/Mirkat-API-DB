var express = require('express');
const app = express()
var router = express.Router();
const db  = require('./db.js');
const multer = require('./multerConf.js');
require('dotenv').config();
const bucket = require('./cloudStorageConf.js');
const validateToken = require('./validatetoken.js');

app.use(express.json());
app.use(express.urlencoded());

router.post('/add', validateToken, multer.single("image"), async (req, res) => {

    const title = req.body.title;
    var newsId = req.body.newsId;

    const file = req.file;

    if (newsId !== '') {
        const newsRef = await db.collection('news').doc(newsId).get();

        if (!newsRef.exists) {
            newsId = null;
        }
    } else {
        newsId = null;
    }

    try {
        const filename = `banner-img/${Date.now()}_${file.originalname}`;
        const blob = bucket.file(filename);

        
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading image:', err);
        });

        blobStream.on('finish', () => {

            db.collection('banners').add({
                title: title,
                image_path: filename,
                id_news: newsId
            });
        });

        blobStream.end(file.buffer);

        return res.status(200).json({ message: 'Image uploaded succesfully'});
    } catch (error) {
        console.error('Error processing image:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

});

router.get('/get/all', (req, res) => {
    var data = [];

    db.collection('banners').get()
    .then((snapshot) => {
        snapshot.forEach(doc => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return res.status(200).json(data);
    });

    
});

router.delete('/delete/:id', validateToken, async (req, res) => {
    const id = req.params.id;
    const doc = await db.collection('banners').doc(id).get();
    if (!doc.exists) {
        return res.status(404).json({ error: 'Banner not found' });
    }

    try {
        await db.collection('banners').doc(id).delete();
        await bucket.file(doc.data().image_path).delete();
        return res.status(200).json({ message: 'Banner deleted' });
    } catch (err) {
        console.error('Error deleting banner:', err);
        return res.status(500).json({ error: 'Interal server error'});
    }
});

module.exports = router;