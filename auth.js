var express = require('express');
const app = express();
const saltRounds = 10;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var router = express.Router();
const db = require('./db.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.JWT_KEY, { expiresIn: '2h' });
}


router.get('/validate', (req, res) => {
    const token = req.headers['authorization'];

    jwt.verify(token, process.env.JWT_KEY, (err) => {
        if (err) {
            return res.status(401).json({ check: false });
        } else {
            return res.status(200).json({ check: true });
        }
        
    });
});   
    

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const snapshot = await db.collection('users')
    .where('username', '==', username).get();

    if (!snapshot) {
        return res.status(400).json({ error: 'Username already exists'});
    }

    const encryptedPassword = await hashPassword(password);

    await db.collection('users').add({
        username: username,
        password: encryptedPassword
    }).then(() => {
        res.status(201).json({ message: 'User registered successfully!' });
    }).catch((error) => {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    })

}
);


router.post('/login', async (req, res) => {
    const { identifier , password} = req.body;

    const snapshot = await db.collection('users')
    .where('username', '==', identifier).get();

    if (!snapshot) {
        console.log('Invalid username');
        return res.status(400).json({ error: 'Invalid username' });
    }

    const isValid = await bcrypt.compare(password, snapshot.docs[0].data().password);

    if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        } else {
            const accessToken = generateAccessToken({id: snapshot.docs[0].id, ...snapshot.docs[0].data()});
            res.status(200).json({ token: accessToken });
        }

});

module.exports = router;