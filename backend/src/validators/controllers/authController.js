// backend/src/validators/controllers/authController.js
const pool = require('../../../config/db'); // Points to your database configuration config
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // If you are using JWT tokens for state tracking

// 1. SIGNUP HANDLING CONTROLLER
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: 'Email address already registered' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'Employee']
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Internal server database error' });
    }
};

// 2. LOGIN HANDLING CONTROLLER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid administrative credentials' });
        }

        const user = userResult.rows[0];
        
        // Compare password input to hashed database password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid administrative credentials' });
        }

        // Generate a token matching your frontend configuration's expectations
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        // This response layout completely satisfies your frontend code:
        // const { token: receivedToken, user: userProfile } = response.data;
        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};