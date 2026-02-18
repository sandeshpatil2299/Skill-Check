import express from "express";
import { body } from "express-validator";
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from "../controllers/authController.js"
import protect from "../middleware/auth.js"
import handleValidationErrors from "../middleware/validation.js"

const router = express.Router();

// Wrapper so async handlers always receive a valid next (fixes "next is not a function" in Express 5)
const asyncHandler = (fn) => (req, res, next) => {
    const safeNext = typeof next === "function" ? next : (err) => {
        if (err) res.status(500).json({ success: false, error: err?.message || "Server error" });
    };
    Promise.resolve(fn(req, res, safeNext)).catch(safeNext);
};

//Validation middleware
const registerValidation= [
    body('username')
    .trim()
    .isLength({min: 3})
    .withMessage('Username must be at least 3 Characters'),
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter valid email'),
    body('password')
    .isLength({min: 6})
    .withMessage('Password must be at least 6 characters')
];

const loginValidation= [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter valid email'),
    body('password')
    .notEmpty()
    .withMessage("Password is required")
];

//Public routes
router.post('/register', registerValidation, handleValidationErrors, asyncHandler(register));
router.post('/login', loginValidation, handleValidationErrors, asyncHandler(login));

//Protected routes
router.get('/profile', protect, asyncHandler(getProfile));
router.put('/profile', protect, asyncHandler(updateProfile));
router.put('/change-password', protect, asyncHandler(changePassword));

export default router;
