import express from 'express';
import {
    generateFlashcards,
    genearateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
} from "../controllers/authController.js";
import protect from '../middleware/auth.js';
const router= express.Router();

router.use(protect);

router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-quiz', genearateQuiz);
router.post('/generate-summary', generateSummary);
router.post('/chat', chat);
router.post('/explain-concept', explainConcept);
router.get('/chat-history/:documentId', getChatHistory);

export default router;

