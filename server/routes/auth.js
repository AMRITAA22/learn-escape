const express = require('express');
const router = express.Router();

// Ensure all four functions are correctly imported here
const { 
    registerUser, 
    loginUser, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword); // This is likely line 10
router.post('/reset-password/:token', resetPassword);

module.exports = router;