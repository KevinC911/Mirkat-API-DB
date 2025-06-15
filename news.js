var express = require('express');
const app = express()
var router = express.Router();
const db  = require('./db.js');
const multer = require('multer');
const imageUploadPath = '\images-news';
const validateToken = require('./validatetoken.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, imageUploadPath)
    },
    filename: function(req, file, cb) {
      cb(null, `${file.fieldname}_dateVal_${Date.now()}_${file.originalname}`)
    }
  });

const imageUpload = multer({storage: storage});

router.post('/add', validateToken, (req, res) => {
    const { title, content, id } = req.body;
    
    db.run('UPDATE news SET title = ?, content = ?, created_at = unixepoch() WHERE id = ?', [title, content, id], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(201).json({ message: 'News added successfully!' });
    });
});

router.post('/add/image', validateToken, imageUpload.array("image"), (req, res) => {
    const imagePath = req.files.map(file => file.path).join(',');
    
    db.run('INSERT INTO news (image_path) VALUES (?)', [imagePath], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    
    db.get('SELECT last_insert_rowid() AS id', [], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        } else {
            return res.status(200).json({
                message: "Image uploaded successfully",
                id: row.id
            });
        }
    });
}
);

router.delete('/delete/:id', validateToken, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM news WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ message: 'News deleted successfully!' });
    });
});

router.get('/get', (req, res) => {

    const limit = req.query.limit || 5;
    const offset = req.query.offset || 5;

    db.all('SELECT * FROM news LIMIT ? OFFSET ?', [limit, offset], (err, news) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json(news);
    });
})

router.get('/get/count', (req, res) => {
    db.get('SELECT COUNT(*) AS count FROM news', [], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json(row.count);
    });
}
);

router.get('/get/by-id', (req, res) => {
    const id = req.query.id

    db.get('SELECT * FROM news WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' })
        }
        return res.status(200).json(row);
    })
})

module.exports = router;