const { getUserByEmail } = require('../models/employeeModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// Extract the JWT secret
const jwtSecret = envConfig.JWT_SECRET;

// Token blacklist
const tokenBlacklist = new Set();

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from the database
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Ensure user has a password field
        if (!user.hashPassword) {
            return res.status(500).json({ error: 'User record is missing password' });
        }

        // Check password against hashed password
        const isPasswordValid = await bcrypt.hash(password, user.salt) === user.hashPassword;

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token using the secret from the .env file
        const token = jwt.sign({ id: user.id, email: user.mail }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Login failed:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

const logout = (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(400).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // This removes the 'Bearer ' part and only gets the token

    if (!token) {
        return res.status(400).json({ error: 'Malformed token' });
    }

    try {
        jwt.verify(token, jwtSecret); // Verify the extracted token
        tokenBlacklist.add(token);
        res.status(200).send({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout failed:', err);
        res.status(403).json({ error: 'Logout failed due to invalid token' });
    }
};

// Middleware to check if token is blacklisted
const checkTokenBlacklist = (req, res, next) => {
    const token = req.headers['authorization'];

    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    next();
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extracts the token part

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(403).json({ message: 'Invalid Token' });
        }

        req.user = decoded;  // Attach the decoded token payload to req.user
        next();  // Move to the next middleware or route handler
    });
};

/*
// Create user function
const xxxxxxxxx = async (user) => {
    console.log("createUser");

    // Generate a salt
    const salt = await bcrypt.genSalt(10); // Using 10 as the salt rounds
    console.log("salt", salt);

    console.log("password", user.Password);

    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(user.Password, salt);
    console.log("hashedPassword", hashedPassword);
};
*/

module.exports = {
    login,
    logout,
    checkTokenBlacklist,
    verifyToken,
    //xxxxxxxxx,
};