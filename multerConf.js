const Multer = require('multer');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        filesize: 8 * 1024 * 1024 // 8 MB
    }
});

module.exports = multer;