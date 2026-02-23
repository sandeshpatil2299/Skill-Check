import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistroy from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

//@desc Generate flashcard from documents
//@route POST /api/ai/generate-flashcards
//@access Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide document",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not read",
                statusCode: 404
            });
        }

        //Generate flashcard using gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        //Save to database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard created successfuly'
        });

    } catch (error) {
        next(error);
    }
};

//@desc Generate quiz from document
//@route POST /api/ai/generate-quiz
//@access Private

export const generateQuiz  = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide document",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }

        //Generate quize using gemini
        const questions = await geminiService.generateQuizAI (
            document.extractedText,
            parseInt(numQuestions)
        );

        //Save to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            message: "Quiz generated successfuly",
            data: quiz
        });

    } catch (error) {
        next(error);
    }
};

//@desc Generate document summary
//@route POST /api/ai/generate-summary
//@access Private
export const generateSummary = async (req, res, next) => {
    try {
        const {documentId}= req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide document Id",
                statusCode: 401
            });
        }

        const document= await Document.findOne({
            _id: documentId, 
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready",
                statusCode: 404
            });
        }

        //Generate document summary using gemini
        const summary= await geminiService.generateSummary(document.extractedText);

        res.status(201).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: "Summary generated successfuly"
        });

    } catch (error) {
        next(error);
    }
};

//@desc Chat with document
//@route POST /api/ai/chat
//@access Private
export const chat = async (req, res, next) => {
    try {
        const {documentId, question}= req.body;

        if(!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: "Please provide document Id or Question",
                statusCode: 400
            });
        }

        const document= await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: "ready"
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404
            });
        }

        //Find relevent chunks
        const releventChunks= findRelevantChunks(document.chunks, question, 3);
        const chunkIndices= releventChunks.map(c => c.chunkIndex);

        //Get or create chat history
        let chatHistory= await ChatHistroy.findOne({
            userId: req.user._id,
            documentId: document.id,
        });

        if(!chatHistory) {
            chatHistory= await ChatHistroy.create({
                userId: req.user._id,
                documentId: document._id,
                message: []
            });
        }

        //Generate response using gemini
        const answer= await geminiService.chatWithContext(question, releventChunks);

        //Save conversation
        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                releventChunks: []
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                releventChunks: chunkIndices
            }
        );

        await chatHistory.save();

        res.status(201).json({
            success: true,
            data: {
                question,
                answer,
                releventChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: "Response generated successfuly"
        })


    } catch (error) {
        next(error);
    }
};

//@desc Explain concept from document
//@route POST /api/ai/explain-concept
//@access Private
export const explainConcept = async (req, res, next) => {
    try {
        const {documentId, concept}= req.body;

        if(!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: "Please provide document id and concept",
                statusCode: 400
            });
        }

        const document= await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or not ready",
                statusCode: 404
            });
        }

        //Find relevant chunks for the concept
        const releventChunks= findRelevantChunks(document.chunks, concept, 3);
        const context= releventChunks.map(c => c.content).join('\n\n');

        //Generate explanation using gemini
        const explanation= await geminiService.explainConcept(concept, context);

        res.status(201).json({
            success: true,
            data: {
                concept,
                explanation,
                releventChunks: releventChunks.map(c => c.chunkIndex)
            },
            message: "Explanation generated successfuly"
        });

    } catch (error) {
        next(error);
    }
};

//@desc Get chat history for document
//@route GET /api/ai/chat-history/:documentId
//@access Private
export const getChatHistory = async (req, res, next) => {
    try {
        const {documentId}= req.params;

        if(!documentId) {
            return res.status(401).json({
                success: false,
                error: "Please provide document id",
                statusCode: 401
            });
        }

        //Retrives only messages array
        const chatHistory= await ChatHistroy.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('messages');

        if(!chatHistory) {
            return res.status(401).json({
                success: false,
                error: "No chat history found for thi document",
                statusCode: 401
            });
        }

        res.status(201).json({
            success: true,
            data: chatHistory.messages,
            message: "Chat history retrived successfuly"
        });

    } catch (error) {
        next(error);
    }
};