import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg,
            errors: errors.array(),
            statusCode: 400
        });
    }
    
    next();
};

export default handleValidationErrors;
