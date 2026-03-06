import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Loader2,
    X
} from 'lucide-react'
import toast from 'react-hot-toast'
import flashcardService from '../../services/flashcardService'
import aiServices from '../../services/aiService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import Flashcard from '../../components/flashcards/Flashcard'

const FlashcardPage = () => {
    const { id: documentId } = useParams();
    const [flashcardSets, setFlashcardSets] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            console.log('Flashcards response:', response.data);

            if (response.data && response.data.length > 0) { // ✅ Added safety check
                setFlashcardSets(response.data[0]);
                setFlashcards(response.data[0]?.cards || []);
            } else {
                setFlashcardSets(null);
                setFlashcards([]);
            }
        } catch (error) {
            toast.error("Failed to fetch flashcard set.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards();
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiServices.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcards();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards.");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        handleReview(currentCardIndex);
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const handlePrevCard = () => {
        handleReview(currentCardIndex);
        setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    };

    const handleReview = async (index) => {
        const currentCard = flashcards[index];
        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id);
            // toast.success("Flashcard reviewed."); // ✅ Removed - too noisy
        } catch (error) {
            console.error("Failed to review flashcard:", error);
        }
    };

    const handleToggleStar = async (flashcard) => { // ✅ Changed to receive flashcard object
        try {
            await flashcardService.toggleStar(flashcard._id);
            setFlashcards((prevFlashcards) =>
                prevFlashcards.map((card) =>
                    card._id === flashcard._id ? { ...card, isStarred: !card.isStarred } : card
                )
            );
            toast.success(flashcard.isStarred ? "Removed from starred" : "Added to starred");
        } catch (error) {
            toast.error("Failed to update star status.");
        }
    };

    const handleDeleteFlashcardSet = async () => {
        if (!flashcardSets) return;

        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(flashcardSets._id);
            toast.success('Flashcard set deleted successfully!');
            setIsDeleteModalOpen(false);
            setFlashcardSets(null);
            setFlashcards([]);
        } catch (error) {
            toast.error(error.message || 'Failed to delete flashcard set.');
        } finally {
            setDeleting(false);
        }
    };

    const renderFlashcardContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                </div>
            );
        }

        if (!flashcardSets || flashcards.length === 0) { // ✅ Fixed condition
            return (
                <EmptyState
                    title='No Flashcards Yet'
                    description='Generate flashcards from your document to start learning.'
                    buttonText='Generate Flashcards'
                    onActionClick={handleGenerateFlashcards}
                />
            );
        }

        const currentCard = flashcards[currentCardIndex];

        return (
            <div className="flex flex-col items-center space-y-8 py-8">
                {/* Flashcard */}
                <div className="w-full max-w-2xl">
                    <Flashcard
                        flashcard={currentCard}
                        onToggleStar={handleToggleStar}
                    />
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-6">
                    <Button
                        onClick={handlePrevCard}
                        variant='secondary'
                        disabled={flashcards.length <= 1} // ✅ Fixed: was <= 5
                        className="min-w-[120px]"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">
                            {currentCardIndex + 1} / {flashcards.length}
                        </span>
                        {/* Progress Dots */}
                        <div className="flex items-center gap-1">
                            {flashcards.slice(0, Math.min(10, flashcards.length)).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentCardIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentCardIndex
                                        ? 'bg-purple-500 w-6'
                                        : 'bg-slate-300 hover:bg-slate-400'
                                        }`}
                                    aria-label={`Go to card ${index + 1}`}
                                />
                            ))}
                            {flashcards.length > 10 && (
                                <span className="text-xs text-slate-500 ml-1">
                                    +{flashcards.length - 10}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleNextCard}
                        variant='secondary'
                        disabled={flashcards.length <= 1}
                        className="min-w-[120px]"
                    >
                        Next {/* ✅ Fixed typo: Nex → Next */}
                        <ChevronRight size={16} />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Progress</span>
                        <span className="text-sm text-slate-600">
                            {Math.round(((currentCardIndex + 1) / flashcards.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Back Button */}
            <div className="mb-6">
                <Link
                    to={`/flashcards`}
                    // to={`/documents/${documentId}`}
                    className='inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors'
                >
                    <ArrowLeft size={16} />
                    Back to Flashcard Set
                </Link>
            </div>

            {/* Header */}
            <PageHeader title='Flashcards'>
                <div className="flex items-center gap-3">
                    {!loading && (
                        flashcards.length > 0 ? (
                                <Button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    disabled={deleting}
                                    variant="secondary"
                                >
                                    <Trash2 size={16} />
                                    Delete Set
                                </Button>
                        ) : (
                            <Button
                                onClick={handleGenerateFlashcards}
                                disabled={generating}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Generate Flashcards
                                    </>
                                )}
                            </Button>
                        )
                    )}
                </div>
            </PageHeader>

            {/* Content */}
            {renderFlashcardContent()}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        {/* Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Delete Flashcard Set?
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Are you sure you want to delete all <strong>{flashcards.length} flashcards</strong> for this document?
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                type='button'
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteFlashcardSet}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashcardPage;