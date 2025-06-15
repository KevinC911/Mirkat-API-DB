var express = require('express');
const app = express()
var router = express.Router();
const db  = require('./db.js');
const multer = require('multer');
const imageUploadPath = '\images-numbers';
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

router.post('/add', validateToken, imageUpload.array("image"), (req, res) => {
    const imagePath = req.files.map(file => file.path).join(',');

    const {number, content} = req.body;

    db.run('INSERT INTO achievements (number, content, image_path) VALUES (?, ?, ?)', [number, content, imagePath], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Achievement added' });
    }) 
})

router.delete('/delete/:id', validateToken, (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM achievements WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Achievement deleted successfully!' });
    });
})

router.get('/get/all', (req, res) => {
    db.all('SELECT * FROM achievements', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json(rows);
    });
});

module.exports = router;