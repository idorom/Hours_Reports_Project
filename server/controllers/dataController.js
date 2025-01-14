const employeeModel = require('../models/employeeModel');
const taskModel = require('../models/taskModel');
const locationModel = require('../models/locationModel');

const getEmployeeData = async (req, res) => {
  try {
    const { email } = req.params;
    const employees = await employeeModel.getEmployeeByComputerName(email);
    res.json(employees);
  } catch (err) {
    console.error('Failed to fetch employee data from SQL Server:', err);
    res.status(500).json({ error: 'Failed to fetch employee data from SQL Server' });
  }
};

const getTasksByDateAndUser = async (req, res) => {
  const { workerID, selectedDate } = req.params;
  try {
    let finalResult = { toDayData: [], TasksNameData: [], locationsNameData: [], totalHoursPerCurrentMonth: [] };

    const toDayData = await taskModel.getTasksByDateAndUser(workerID, selectedDate);
    const TasksNameData = await taskModel.getTaskNamesByUserAndDate(workerID, selectedDate);
    const locationsNameData = await locationModel.getLocations();
    const totalHoursPerCurrentMonth = await taskModel.getTotalHoursPerCurrentMonth(workerID, selectedDate);
    const TasksDates = await taskModel.getTasksDates(workerID, selectedDate);
    

    finalResult = {
      toDayData,
      TasksNameData,
      locationsNameData,
      totalHoursPerCurrentMonth,
      TasksDates
    };

    res.json(finalResult);
  } catch (err) {
    console.error('Failed to fetch data from SQL Server:', err);
    res.status(500).json({ error: 'Failed to fetch data from SQL Server' });
  }
};

const deleteAndAddRows = async (req, res) => {
  try {
    const deletedData = req.body.deletedData || [];
    const insertedData = req.body.insertedData || [];
    if (!deletedData.length && !insertedData.length) {
      return res.status(400).json({ error: 'Missing required data in request body' });
    }

    try {
      await taskModel.deleteAndAddRows(deletedData, insertedData);
      res.status(200).json({ message: 'Rows deleted and added successfully' });
    } catch (err) {
      console.error('Failed to delete and add rows:', err);
      res.status(500).json({ error: 'Failed to delete and add rows' });
    }
  } catch (err) {
    console.error('Error parsing request body:', err);
    res.status(400).json({ error: 'Error parsing request body' });
  }
};

module.exports = {
  getEmployeeData,
  getTasksByDateAndUser,
  deleteAndAddRows
};