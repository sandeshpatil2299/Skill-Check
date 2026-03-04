import React, { useState, useEffect } from 'react'
import { Plus, ChevronRight, ChevronLeft, Trash2, ArrowLeft, Sparkles, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import moment from 'moment'
import flashcardService from '../../services/flashcardService.js'
import aiServices from '../../services/aiService.js'
import Spinner from '../common/Spinner.jsx'
import Modal from '../common/Modal'
import Flashcard from './Flashcard'

const FlashcardManager = ({ documentId }) => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModelOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null); {
        deleting ? (
            <span className="">
                <div className="" />
                Deleting...
            </span>
        ) : "Delete Set"
    }
    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data || response || []);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            const response = await aiServices.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards.");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet && selectedSet.cards.length > 0) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet && selectedSet.cards.length > 0) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[index];

        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id);
            // toast.success("Flashcard reviewed");
        } catch (error) {
            console.error("Failed to review flashcard:", error);
        }
    };

    const handleToggleStar = async (flashcard) => {
        try {
            await flashcardService.toggleStar(flashcard._id);

            // Update local state
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === flashcard._id
                            ? { ...card, isStarred: !card.isStarred }
                            : card
                    ); // ✅ Added return

                    return { ...set, cards: updatedCards };
                }
                return set;
            });

            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));

            toast.success(
                flashcard.isStarred
                    ? "Removed from starred"
                    : "Added to starred"
            );
        } catch (error) {
            console.error('Toggle star error:', error);
            toast.error('Failed to update star status.');
        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModelOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;

        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully");
            setFlashcardSets(flashcardSets.filter(set => set._id !== setToDelete._id));
            setIsDeleteModelOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();

            // If the deleted set was selected, deselect it
            if (selectedSet?._id === setToDelete._id) {
                setSelectedSet(null);
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set");
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectedSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const handleBackToList = () => {
        setSelectedSet(null);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        if (!selectedSet || !selectedSet.cards || selectedSet.cards.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-500">No cards in this set.</p>
                    <button
                        onClick={handleBackToList}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                        Back to Sets
                    </button>
                </div>
            );
        }

        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBackToList}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sets
                    </button>

                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-900">
                            Card {currentCardIndex + 1} of {selectedSet.cards.length}
                        </p>
                    </div>

                    <div className="w-24" /> {/* Spacer for alignment */}
                </div>

                {/* Flashcard */}
                <div className="flex items-center justify-center py-8">
                    <Flashcard
                        flashcard={currentCard}
                        onToggleStar={handleToggleStar}
                    />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevCard}
                        disabled={selectedSet.cards.length <= 1}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {selectedSet.cards.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentCardIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentCardIndex
                                    ? 'bg-emerald-500 w-8'
                                    : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                                aria-label={`Go to card ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNextCard}
                        disabled={selectedSet.cards.length <= 1}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 font-medium"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress */}
                <div className="bg-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Progress</span>
                        <span className="text-sm text-slate-600">
                            {Math.round(((currentCardIndex + 1) / selectedSet.cards.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${((currentCardIndex + 1) / selectedSet.cards.length) * 100}%`
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                </div>
            );
        }

        if (flashcardSets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
                        <Brain className='w-8 h-8 text-emerald-600' strokeWidth={2} />
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Flashcards Yet</h3>
                    <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
                        Generate flashcards from your document to start studying
                    </p>

                    <button
                        className="group inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        disabled={generating}
                        onClick={handleGenerateFlashcards}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className='w-4 h-4' strokeWidth={2} />
                                Generate Flashcards
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Header with Generate Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            Your Flashcard Sets
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {flashcardSets.length}{" "}
                            {flashcardSets.length === 1 ? 'set' : 'sets'} available
                        </p>
                    </div>
                    <button
                        className="group inline-flex items-center gap-2 px-5 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-emerald-500/25"
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus className='w-4 h-4' strokeWidth={2} />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flashcard Sets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flashcardSets.map((set) => ( // ✅ Added return with parentheses
                        <div
                            key={set._id}
                            onClick={() => handleSelectedSet(set)}
                            className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteRequest(e, set)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-100 opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className='w-4 h-4' strokeWidth={2} />
                            </button>

                            {/* Set Content */}
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                                    <Brain className='w-6 h-6 text-emerald-600' strokeWidth={2} />
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 text-base mb-1">
                                        Flashcard Set
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                        Created {moment(set.createdAt).format("MMM D, YYYY")}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                        <span className="text-sm font-semibold text-emerald-700">
                                            {set.cards?.length || 0}{" "}
                                            {set.cards?.length === 1 ? 'card' : 'cards'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && setToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Flashcard Set?</h2>
                                <p className="text-gray-600 text-sm">
                                    Are you sure you want to delete this flashcard set with{' '}
                                    <strong>{setToDelete.cards?.length || 0} cards</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSetToDelete(null);
                                }}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center justify-center gap-2 font-medium"
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
                        </div> */}

                        {/* Delete confirmation model */}
                        <Modal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModelOpen(false)}
                            title='Delete Flashcard Set?'
                        >
                            <div className="space-y-6">
                                <p className="text-sm text-slate-600">
                                    Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permenantly removed.
                                </p>
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-95"
                                        type='button'
                                        onClick={() => setIsDeleteModelOpen(false)}
                                        disabled={deleting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                        onClick={() => handleConfirmDelete()}
                                        disabled={deleting}
                                    >
                                        {deleting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-white/30 border-t-white rounded-full animate-spin" />
                                                Deleting...
                                            </span>
                                        ) : "Delete Set"}
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
            )}
        </>
    );
};

export default FlashcardManager;