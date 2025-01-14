const sql = require('mssql');
const fs = require('fs');

// Read the .env file
const envData = fs.readFileSync('.env', 'utf8').split('\n');
const envConfig = {};
envData.forEach((line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    envConfig[key.trim()] = value.trim();
  }
});

// SQL Server configuration
const config = {
  user: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
  server: envConfig.DB_SERVER, // Check this line
  database: envConfig.DB_DATABASE,
  options: {
    encrypt: false, // Use encryption
    enableArithAbort: true // Enable ArithAbort
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};