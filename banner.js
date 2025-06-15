var express = require('express');
const app = express()
var router = express.Router();
const db  = require('./db.js');
const multer = require('multer');
require('dotenv').config();
const imageUploadPath = '\images';
const validateToken = require('./validatetoken.js');

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


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

    const title = req.body.title;

    db.get('INSERT INTO banners (image_path, title) VALUES (?, ?) RETURNING id', [imagePath, title], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        return res.status(200).json({
            id: row.id,
            message: "Image uploaded successfully"
        })
    });



});

router.post('/add/id', validateToken, (req, res) => {

    let newsID = req.body.newsid;
    const id = req.body.id;
    if (newsID === undefined || newsID === 0) {
        newsID = null;
    }

    db.get('SELECT * FROM news WHERE id = ?', [newsID], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!newsID) {
            console.log('newsID is null or 0, skipping news check');
        } 
        
        if (!row && newsID !== null) {
            let flag = false;
            db.run('DELETE FROM banners WHERE id = ?', [id], (err) => {
                if (err){
                    flag = true;
                }          
            });
            if (flag) {
                return res.status(500).json({ error: 'Internal server error' })
            }
            return res.status(404).json({ error: 'News not found' });   
            
        }

        db.run('UPDATE banners SET id_news = ? WHERE id = ?', [newsID, id], (err) => {
            console.log('valid3')
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.status(200).json({ message: 'Banner updated successfully!' });
        });
    });  
});

router.get('/get/all', (req, res) => {
    db.all('SELECT * FROM banners', [], (err, banners) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json(banners);
    });
});

router.delete('/delete/:id', validateToken, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM banners WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json({ message: 'Banner deleted successfully' });
    });
});

module.exports = router;