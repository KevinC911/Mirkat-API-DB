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

router.post('/add', validateToken, multer.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const file = req.file;
    
    try {
        const filename = `news-img/${Date.now()}_${file.originalname}`;
        
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

            db.collection('news').add({
                title: title,
                content: content,
                image_path: filename,
                created_at: Date.now()
            });

        });

        blobStream.end(file.buffer);
        return res.status(200).json({ message: 'Image uploaded succesfully'});
    } catch (error) {
        console.error('Error processing image:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/delete/:id', validateToken, async (req, res) => {
    const id = req.params.id;
    const doc = await db.collection('news').doc(id).get();
    if (!doc.exists) {
        return res.status(404).json({ error: 'News not found' });
    }

    try {
        await db.collection('news').doc(id).delete();
        await bucket.file(doc.data().image_path).delete();
        return res.status(200).json({ message: 'News deleted' });
    } catch (err) {
        console.error('Error deleting new:', err);
        return res.status(500).json({ error: 'Interal server error'});
    }
});

router.get('/get', async (req, res) => {

    var data = [];

    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;

    var query = db.collection('news').orderBy('created_at', 'asc').limit(limit);

    if (offset > 0) {
        const initialQuery = db.collection('news').orderBy('created_at', 'asc').limit(offset);

        const snapshot = await initialQuery.get();
        const lastVisivle = snapshot.docs[snapshot.docs.length - 1];
        
        query = query.startAfter(lastVisivle);
    }

    await query.get()
        .then((snapshot) => {
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                    });
                });
            });
    
    return res.status(200).json(data);
});

router.get('/get/last', async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    var data = [];

    await db.collection('news').orderBy('created_at', 'desc').limit(limit).get()
    .then((snapshot) => {
        snapshot.forEach(doc => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return res.status(200).json(data);
    })
})

router.get('/get/count', async (req, res) => {
    const collectionRef = db.collection('news');
    const snapshot = await collectionRef.count().get();

    return res.status(200).json(snapshot.data().count);
});

router.get('/get/by-id', async (req, res) => {
    const id = req.query.id

    try {
       const doc = await db.collection('news').doc(id).get();
       
       if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
       }

       res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})

module.exports = router;