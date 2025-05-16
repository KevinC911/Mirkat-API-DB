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
    const { username, password, email } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (user) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const encryptedPassword = await hashPassword(password);
        
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, encryptedPassword, email], (err)  => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
}
);


router.post('/login', async (req, res) => {
    const { identifier , password} = req.body;
    
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [ identifier, identifier ], async (err, user) => {
        if (err) { 
            console.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        } else {
            const accessToken = generateAccessToken(user);
            res.status(200).json({ token: accessToken });
        }
    }
)
});

module.exports = router;