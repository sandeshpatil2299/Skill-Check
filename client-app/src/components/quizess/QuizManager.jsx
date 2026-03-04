import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import quizService from '../../services/quizService.js'
import aiServices from '../../services/aiService.js'
import Spinner from '../common/Spinner.jsx'
import Button from '../common/Button.jsx'
import QuizCard from './QuizCard'
import EmptyState from '../common/EmptyState.jsx'

const QuizManager = ({ documentId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await quizService.getQuizzeForDocument(documentId); // ✅ Fixed typo
            setQuizzes(response.data || response || []);
        } catch (error) {
            toast.error("Failed to fetch quizzes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchQuizzes();
        }
    }, [documentId]);

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setGenerating(true);

        try {
            await aiServices.generateQuiz(documentId, { numQuestions });
            toast.success("Quiz generated successfully!");
            setIsGeneratingModalOpen(false);
            setNumQuestions(5); // Reset to default
            fetchQuizzes();
        } catch (error) {
            toast.error(error.message || "Failed to generate quiz.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedQuiz) return;

        setDeleting(true);
        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success("Quiz deleted successfully");
            setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
            setIsDeleteModalOpen(false);
            setSelectedQuiz(null);
        } catch (error) {
            toast.error(error.message || "Failed to delete quiz");
        } finally {
            setDeleting(false);
        }
    };

    const renderQuizContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Spinner size="lg" />
                </div>
            );
        }

        if (quizzes.length === 0) {
            return (
                <EmptyState
                    title="No Quizzes Yet"
                    description="Generate a quiz from your document to test your knowledge."
                    buttonText="Generate Quiz"
                    onActionClick={() => setIsGeneratingModalOpen(true)}
                />
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {quizzes.map((quiz) => ( // ✅ Added return with parentheses
                    <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className='bg-white border border-slate-200 rounded-2xl p-6'>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Quiz Library</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} available
                        </p>
                    </div>
                    {quizzes.length > 0 && (
                        <Button onClick={() => setIsGeneratingModalOpen(true)}>
                            <Plus size={16} />
                            Generate Quiz
                        </Button>
                    )}
                </div>

                {renderQuizContent()}
            </div>

            {/* Generate Quiz Modal */}
            {isGeneratingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsGeneratingModalOpen(false)}
                            disabled={generating}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Generate Quiz</h2>
                            <p className="text-sm text-slate-600">
                                Create an AI-powered quiz from your document
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleGenerateQuiz} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Number of Questions
                                </label>
                                <input
                                    type="number"
                                    min="3"
                                    max="20"
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                    disabled={generating}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Choose between 3 and 20 questions
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGeneratingModalOpen(false)}
                                    disabled={generating}
                                    className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Quiz?</h2>
                                <p className="text-gray-600 text-sm">
                                    Are you sure you want to delete <strong>"{selectedQuiz.title || 'this quiz'}"</strong>?
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedQuiz(null);
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
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuizManager;