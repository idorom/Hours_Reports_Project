const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

router.use(express.json());

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.checkTokenBlacklist, authController.logout);

// Protected route example
router.use('/protected-route', authController.verifyToken, authController.checkTokenBlacklist, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

// Get data for a specific worker and date
router.get('/data/:workerID/:selectedDate', authController.verifyToken, authController.checkTokenBlacklist, dataController.getTasksByDateAndUser);

// Get all data
router.get('/data/:email', authController.verifyToken, authController.checkTokenBlacklist, dataController.getEmployeeData);

// Delete and add rows
router.post('/delete-add-rows', authController.verifyToken, authController.checkTokenBlacklist, dataController.deleteAndAddRows);

module.exports = router;