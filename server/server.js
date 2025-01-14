const express = require('express');
const apiRouter = require('./routes/api');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 5000;

// Read the .env file
const envData = fs.readFileSync('.env', 'utf8').split('\n');
const envConfig = {};
envData.forEach((line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    envConfig[key.trim()] = value.trim();
  }
});

// Use cors middleware
app.use(cors());

// Use apiRouter for '/api' routes
app.use('/', apiRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});