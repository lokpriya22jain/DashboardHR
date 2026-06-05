// 1. Core Framework Imports
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Automatically parses hidden keys from your secret .env file
// Import Database Connection Config
const pool = require('./config/db');

// 2. Initialize the Server Application Instance
const app = express();

// 3. Apply Advanced Security Middleware Frameworks (Strict Guidelines)
app.use(helmet()); // Securely sets HTTP response headers to shield your data
app.use(cors());   // Allows your React frontend application to request access smoothly
app.use(express.json()); // Tells your server to read incoming JSON request bodies natively

// 4. Implement Brute-Force Rate Limiter Security Rule
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute verification blocks
    max: 100, // Limit each IP address to 100 API requests per window windowMs
    message: { error: "Too many login attempts from this network. Please try again after 15 minutes." }
});
app.use('/api/', apiLimiter); // Protects all API endpoints across the cluster

// 5. Create a Base Root Route for Diagnostic Tests
app.get('/', (req, res) => {
    res.status(200).json({ status: "Online", platform: "DashboardHR Core Backend Engine" });
});

// 6. Bind Server Port Infrastructure Allocation 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 System Online: DashboardHR Backend Engine is broadcasting safely on port ${PORT}`);
});