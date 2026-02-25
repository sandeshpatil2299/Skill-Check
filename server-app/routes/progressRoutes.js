import express from 'express';
import {
    getDashboard,
} from "../controllers/progressController.js";
import protect from '../middleware/auth.js';

const router= express.Router();

//All routes protected
router.use(protect);

router.post('/dashboard', getDashboard); 

export default router;