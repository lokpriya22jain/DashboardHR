const { Pool } = require('pg');
require('dotenv').config(); // Securely reads database variables from your hidden .env file

// Initialize a connection pool using your Neon connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Run an immediate query check to verify the cloud database handshake works
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection failed:', err.stack);
  }
  console.log('✅ Connected to DashboardHR Neon PostgreSQL Cloud Database successfully.');
  release(); // Always release the client connection back to the pool
});

module.exports = pool;