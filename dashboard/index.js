const express = require('express');
const path = require('path');
const app = express();

// Use the PORT from environment or default to 3000 for local dev
const PORT = process.env.PORT || 3000;

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, 'views')));

// Dashboard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server and bind to 0.0.0.0 for Render compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});

module.exports = app; // Export for requiring in bot.js
