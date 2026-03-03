import React, {useState, useEffect} from 'react'
import { Plus, ChevronRight, ChevronLeft, Trash2, ArrowLeft, Sparkles, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import moment from 'moment'
import flashcardService from '../../services/flashcardService.js'
import aiServices from '../../services/aiService.js'
import Spinner from '../common/Spinner.jsx'
import Modal from '../common/Modal'
import Flashcard from './Flashcard'

const FlashcardManager = ({documentId}) => {
    const [flashcardSets, setFlashcardSets]= useState([]);
    const [selectedSet, setSelectedSet]= useState(null);
    const [loading, setLoading]= useState(null);
    const [generating, setGenerating]= useState(false);
    const [currentCardIndex, setCurrentCardIndex]= useState(0);
    const [isDeletedModalOpen, setIsDeletedModalOpen]= useState(false);
    const [deleting, setDeleting]= useState(false);
    const [setToDelete, setSetToDelete]= useState(null);

    const fetchFlashcardSets= async () => {
        setLoading(true);
        try {
            const response= await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards= async () => {
        setGenerating(true);
        try {
            const response= await aiServices.generateFlashcards(documentId);
            toast.success("Flashcard generated successfully.");
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards.")
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard= () => {
        if(selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard= () => {
        if(selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview= async (index) => {
        const currenCard= selectedSet?.cards[currentCardIndex];

        if(!currenCard) return;

        try {
            const response= await flashcardService.reviewFlashcard(index);
        } catch (error) {
            
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200/50">
                <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Flashcards Yet</h3>
            <p className="text-slate-500 text-sm text-center max-w-md mb-6">
                Generate flashcards from this document to start studying effectively.
            </p>
            <button
                onClick={() => navigate(`/flashcards/generate?docId=${id}`)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 font-medium"
            >
                Generate Flashcards
            </button>
        </div>
    )
}

export default FlashcardManager