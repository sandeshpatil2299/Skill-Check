import jwt from 'jsonwebtoken'
import User from "../models/User.js"

//Generate JWT token
const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

//@desc Register new user
//@route POST /api/auth/register
//@access Public 
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        //check if user exists or not
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error:
                    existingUser.email === email
                        ? "Email already registered"
                        : "Username already taken",
                statusCode: 400
            });
        };

        //Create new user
        const user = await User.create({ username, email, password });

        //Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt
                },
                token
            },
            message: "User registered successfuly"
        });

    } catch (error) {
        next(error);
    };
};

//@desc Login user
//@route POST /api/auth/login
//access Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //Validate input (express-validator runs first; this is a safety check)
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
                statusCode: 400
            });
        }

        //Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        //Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        //Generate token
        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

//@desc Get user profile
//@route GET /api/auth/profile
//access Private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        next(error);
    };
};

//@desc Update user profile
//@route PUT /api/auth/profile
//access Private
export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (username) user.username = username
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            message: "Profile updated successfully"
        });
    } catch (error) {
        next(error);
    };
};

//@desc Change password
//@route PUT /api/auth/change-password
//access Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 1. Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both current and new password"
            });
        }

        // 2. Validate new password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // 3. Check if new password is same as current
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        // 4. Find user and include password
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 5. Verify current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // 6. Set new password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // 7. Send success response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error('Change password error:', error);
        next(error);
    }
};  