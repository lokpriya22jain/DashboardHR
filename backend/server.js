// 1. Core Framework Imports
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt'); // Added for handling safe user hashing
const jwt = require('jsonwebtoken'); // Added for session creation
require('dotenv').config(); // Automatically parses hidden keys from your secret .env file

// Import Database Connection Config
const pool = require('./config/db');

// 2. Initialize the Server Application Instance
const app = express();

// 3. Apply Advanced Security Middleware Frameworks (Strict Guidelines)
app.use(helmet()); // Securely sets HTTP response headers to shield your data
app.use(cors()); // Allows your React frontend application to request access smoothly
app.use(express.json()); // Tells your server to read incoming JSON request bodies natively

// 4. Implement Brute-Force Rate Limiter Security Rule
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute verification blocks
    max: 100, // Limit each IP address to 100 API requests per window
    message: { error: "Too many login attempts from this network. Please try again after 15 minutes." }
});
app.use('/api/', apiLimiter); // Protects all API endpoints across the cluster

// 5. Create a Base Root Route for Diagnostic Tests
app.get('/', (req, res) => {
    res.status(200).json({ status: "Online", platform: "DashboardHR Core Backend Engine" });
});

// ====================================================================
// 🔥 NEW INTEGRATION: NATIVE AUTHENTICATION ROUTING ENDPOINTS
// ====================================================================

// A. USER SIGNUP API ROUTE
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Double check if user email profile is already registered
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: 'Email address already registered' });
        }

        // 2. Encrypt user entry password string using salt encryption
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Save the newly registered account cleanly into Neon DB
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'Employee']
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Signup Endpoint Error:', error);
        res.status(500).json({ message: 'Internal server database configuration error' });
    }
});

// B. USER LOGIN API ROUTE
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Lookup the email credentials
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid administrative credentials' });
        }

        const user = userResult.rows[0];

        // 2. Validate password hashes match perfectly
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid administrative credentials' });
        }

        // 3. Form a signature token for frontend authentication state management
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_jwt_secret_key_5173',
            { expiresIn: '24h' }
        );

        // 4. Return matching shape response expected by custom frontend hooks
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
        console.error('Login Endpoint Error:', error);
        res.status(500).json({ message: 'Internal server login routine mismatch' });
    }
});

// ====================================================================

// 6. Bind Server Port Infrastructure Allocation
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 System Online: DashboardHR Backend Engine is broadcasting safely on port ${PORT}`);
});
// D. GET DAILY ATTENDANCE ROSTER WITH LEAVE STATUSES
app.get('/api/attendance/roster', async (req, res) => {
    try {
        const queryText = `
            SELECT 
                u.id as user_id, 
                u.name, 
                u.role,
                COALESCE(ep.designation, 'General Staff') as designation,
                a.check_in, 
                a.check_out, 
                COALESCE(a.status, 'Absent') as status
            FROM users u
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE
            ORDER BY u.id ASC;
        `;
        const result = await pool.query(queryText);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Roster Fetch Error:", error);
        res.status(500).json({ error: "Failed to pull attendance tracking engine matrix" });
    }
});

// E. UPDATE / CLOCK-IN INDIVIDUAL ATTENDANCE TRACKER row
app.post('/api/attendance/update', async (req, res) => {
    try {
        const { user_id, status, check_in } = req.body;
        const queryText = `
            INSERT INTO attendance (user_id, date, check_in, status)
            VALUES ($1, CURRENT_DATE, $2, $3)
            ON CONFLICT (user_id, date)
            DO UPDATE SET status = EXCLUDED.status, check_in = COALESCE(EXCLUDED.check_in, attendance.check_in)
            RETURNING *;
        `;
        const result = await pool.query(queryText, [user_id, check_in || null, status]);
        res.status(200).json({ message: "Status tracked successfully", record: result.rows[0] });
    } catch (error) {
        console.error("Attendance Update Error:", error);
        res.status(500).json({ error: "Failed to update daily workforce profile row" });
    }
});