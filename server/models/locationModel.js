const { sql, poolPromise } = require('../utils/database');

const getLocations = async () => {
  const pool = await poolPromise;
  const result = await pool.request()
    .query(`
      SELECT l.locationID, l.locationName
      FROM dbo.Locations_of_Work as l
    `);
  return result.recordset;
};

module.exports = {
  getLocations
};