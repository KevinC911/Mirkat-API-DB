const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    keyFilename: './db/proud-will-355607-4122daa7ccCSG.json',
    projectId: 'proud-will-355607'
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

module.exports = bucket;