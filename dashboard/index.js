const express = require('express');
const path = require('path');
const app = express();
const PORT = 80; // Host on port 80 as requested

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, 'views')));

// Dashboard route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});

module.exports = app; // Export for requiring in bot.js
