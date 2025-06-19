var express = require('express');
const app = express()
var router = express.Router();
const db  = require('./db.js');
const multer = require('./multerConf.js');
require('dotenv').config();
const bucket = require('./cloudStorageConf.js');
const validateToken = require('./validatetoken.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router.post('/add', validateToken, multer.single("image"), (req, res) => {

    const {number, content} = req.body;
    const file = req.file;

     try {
        const filename = `achivem-img/${Date.now()}_${file.originalname}`;
        
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading image:', err);
            return res.status(500).json({ error: 'Internal server error'});
        });

        blobStream.on('finish', () => {

            db.collection('achievements').add({
                number: number,
                content: content,
                image_path: filename
            });
        });

        blobStream.end(file.buffer);
        return res.status(200).json({ message: 'Image uploaded succesfully'});
    } catch (error) {
        console.error('Error processing image:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.delete('/delete/:id', validateToken, async (req, res) => {
    const id = req.params.id;

    const doc = await db.collection('achievements').doc(id).get();
    if (!doc.exists) {
        return res.status(404).json({ error: 'Achievement not found' });
    }

    try {
        await db.collection('achievements').doc(id).delete();
        await bucket.file(doc.data().image_path).delete();
        return res.status(200).json({ message: 'Achievement deleted' });
    } catch (err) {
        console.error('Error deleting achievement:', err);
        return res.status(500).json({ error: 'Interal server error'});
    }
})

router.get('/get/all', async (req, res) => {
    var data = [];

    await db.collection('achievements').get()
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

module.exports = router;