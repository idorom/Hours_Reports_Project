const { sql, poolPromise } = require('../utils/database');

const getTasksByDateAndUser = async (workerID, selectedDate) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('workerID', sql.Int, workerID)
    .input('selectedDate', sql.Date, selectedDate)
    .query(`
      SELECT h.[ownerID], h.[date], h.[LineNum], h.[taskID], h.[startHour], h.[startMinute],
             h.[endHour], h.[endMinute], h.[gap], t.taskName,
             t.taskName + ' (' + p.projectName + ')' [displayName], l.locationID, l.locationName
      FROM [dbo].[Hour_report] as h
      INNER JOIN dbo.Tasks t ON h.taskID=t.taskID
      INNER JOIN dbo.tasks_per_employee tpe ON tpe.taskID=t.taskID and tpe.employeeID=h.[ownerID]
      INNER JOIN dbo.Projects p ON t.projectID= p.projectID
      INNER JOIN dbo.Locations_of_Work l ON h.locationID= l.locationID
      WHERE h.[ownerID]= @workerID AND h.[date]= @selectedDate
    `);
  return result.recordset;
};

const getTaskNamesByUserAndDate = async (workerID, selectedDate) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('workerID', sql.Int, workerID)
    .input('selectedDate', sql.Date, selectedDate)
    .query(`
      SELECT tpe.taskID, t.taskName, t.taskName + ' (' + p.projectName + ')' [displayName]
      FROM dbo.tasks_per_employee tpe
      INNER JOIN dbo.Tasks t ON tpe.taskID=t.taskID
      INNER JOIN dbo.Projects p ON t.projectID= p.projectID
      WHERE tpe.employeeID= @workerID AND ((toDate >= @selectedDate AND fromDate <= @selectedDate) OR (DATEPART(MONTH, @selectedDate)<DATEPART(MONTH, GETDATE())))
    `);
  return result.recordset;
};


const getTasksDates = async (workerID, selectedDate) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('workerID', sql.Int, workerID)
    .input('selectedDate', sql.Date, selectedDate)
    .query(`
        SELECT DISTINCT [date]
        FROM dbo.Hour_report h    
        WHERE [ownerID]= @workerID AND
        (
            -- Same month as input date
            (YEAR([date]) = YEAR(@selectedDate) AND MONTH([date]) = MONTH(@selectedDate))

            -- OR 7 days before the month of input date
            OR ([date] >= DATEADD(DAY, -7, DATEFROMPARTS(YEAR(@selectedDate), MONTH(@selectedDate), 1))
                AND [date] < DATEFROMPARTS(YEAR(@selectedDate), MONTH(@selectedDate), 1))

            -- OR 7 days after the month of input date
            OR ([date] >= DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(@selectedDate), MONTH(@selectedDate), 1))
                AND [date] < DATEADD(DAY, 8, DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(@selectedDate), MONTH(@selectedDate), 1))))
      );
    `);
  return result.recordset;
};

const getTotalHoursPerCurrentMonth = async (workerID, selectedDate) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('workerID', sql.Int, workerID)
    .input('selectedDate', sql.Date, selectedDate)
    .query(`
      SELECT SUM(h.[gap]) totalHoursPerCurrentMonth
      FROM [dbo].[Hour_report] h
      WHERE [date] != @selectedDate 
      AND h.[ownerID]= @workerID
      AND DATEPART(MONTH, h.[date]) = (SELECT top 1 DATEPART(MONTH, @selectedDate) FROM [dbo].[Hour_report] h)
    `);
  return result.recordset;
};

const deleteAndAddRows = async (deletedData, insertedData) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    if (deletedData.length > 0) {
      for (const data of deletedData) {
        await transaction.request()
          .query(`DELETE FROM [dbo].[Hour_report] WHERE date = '${data.date}' AND ownerID = '${data.ownerID}'`);
      }
    }

    for (const data of insertedData) {
      await transaction.request()
        .query(`INSERT INTO [dbo].[Hour_report] (ownerID, date, LineNum, taskID, startHour, startMinute, endHour, endMinute, gap, locationID)
                VALUES ('${data.ownerID}', '${data.date}', '${data.LineNum}', '${data.taskID}', '${data.startHour}', '${data.startMinute}', '${data.endHour}', '${data.endMinute}', '${data.gap}', '${data.locationID}')`);
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = {
  getTasksByDateAndUser,
  getTaskNamesByUserAndDate,
  getTotalHoursPerCurrentMonth,
  getTasksDates,
  deleteAndAddRows
};