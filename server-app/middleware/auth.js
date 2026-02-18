import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        // 1. Check for Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        // 2. Extract token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing'
            });
        }

        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find user and exclude password
        req.user = await User.findById(decoded.id).select('-password');

        // 5. Check if user exists
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found or has been deleted",
                statusCode: 401
            });
        }

        // 6. Proceed to next middleware/controller
        return next();

    } catch (error) {
        console.error('Auth middleware error:', error.message);

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

export default protect;