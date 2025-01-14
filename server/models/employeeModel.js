const { sql, poolPromise } = require('../utils/database');

const getEmployeeByComputerName = async (email) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('email', sql.VarChar, email)
    .query(`
      SELECT EmployeeID, firstName, surName, NTUser
      FROM [dbo].[Employees]
      WHERE mail = @email
    `);
  return result.recordset;
};

const getUserByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT mail, TRIM(Password) as Password, hashPassword, salt FROM Employees WHERE mail = @email'); // Update the query as per your table structure

    return result.recordset[0];
  } catch (err) {
    console.error('Database query failed:', err);
    throw err;
  }
};

module.exports = {
  getEmployeeByComputerName, 
  getUserByEmail
};