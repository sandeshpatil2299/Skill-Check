import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle2, Send, AlertCircle } from 'lucide-react'
import quizService from '../../services/quizService.js'
import PageHeader from '../../components/common/PageHeader.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'

const QuizeTakePage = () => { // ✅ Fixed typo: QuizeTakePage → QuizTakePage
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ Changed to true
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const response = await quizService.getQuizById(quizId);
                setQuiz(response.data || response);
            } catch (error) {
                toast.error("Failed to fetch quiz.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const handleOptionChange = (questionId, optionIndex) => {
        setSelectedAnswer((prev) => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNextQuestion = () => { // ✅ Fixed typo: handleNextOption → handleNextQuestion
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleQuizSubmit = async () => {
        const unansweredCount = quiz.questions.length - Object.keys(selectedAnswer).length;

        if (unansweredCount > 0) {
            toast.error(`Please answer all questions. ${unansweredCount} question${unansweredCount > 1 ? 's' : ''} remaining.`);
            return;
        }

        setSubmitting(true);

        try {
            const formattedAnswers = Object.keys(selectedAnswer).map(questionId => {
                const question = quiz.questions.find(q => q._id === questionId);
                const questionIndex = quiz.questions.findIndex(q => q._id === questionId);
                const optionIndex = selectedAnswer[questionId];
                const selectedOptionText = question.options[optionIndex];

                return {
                    questionIndex,
                    selectedAnswer: selectedOptionText
                };
            });

            console.log('Formatted answers:', formattedAnswers);

            // ✅ Pass the array directly (service will wrap it)
            await quizService.submitQuiz(quizId, formattedAnswers);

            toast.success("Quiz submitted successfully!");
            navigate(`/quizzes/${quizId}/results`);

        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to submit quiz");
            console.error(error);
        } finally {
            setSubmitting(false);
            setShowSubmitConfirm(false);
        }
    };

    // 5:46:24 

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">
                        Quiz not found or has no questions.
                    </p>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswered = selectedAnswer.hasOwnProperty(currentQuestion._id);
    const answeredCount = Object.keys(selectedAnswer).length;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const allAnswered = answeredCount === quiz.questions.length;

    return (
        <div className='max-w-4xl mx-auto p-6'>
            <PageHeader
                title={quiz.title || 'Take Quiz'}
                subtitle={`${quiz.questions.length} questions`}
            />

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    <span className="text-sm font-medium text-teal-600">
                        {answeredCount} / {quiz.questions.length} answered
                    </span>
                </div>

                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out" // ✅ Fixed: abosolute → absolute, bg-linear-to-r → bg-gradient-to-r
                        style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl mb-6"> {/* ✅ Fixed gradient */}
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-teal-700">
                        Question {currentQuestionIndex + 1}
                    </span>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-8 leading-relaxed">
                    {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer[currentQuestion._id] === index;
                        return (
                            <label
                                key={index}
                                className={`group relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                                    ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/10'
                                    : 'border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-white hover:shadow-md'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name={`question-${currentQuestion._id}`}
                                    value={index}
                                    checked={isSelected}
                                    onChange={() => handleOptionChange(currentQuestion._id, index)}
                                />

                                {/* Custom Radio Button */}
                                <div className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${isSelected
                                    ? 'border-teal-500 bg-teal-500'
                                    : 'border-slate-300 bg-white group-hover:border-teal-400'
                                    }`}>
                                    {isSelected && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>

                                {/* Option Text */}
                                <span className={`ml-4 text-base font-medium transition-colors duration-200 flex-1 ${isSelected ? 'text-teal-900' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}>
                                    {option}
                                </span>

                                {/* Selected Checkmark */}
                                {isSelected && (
                                    <CheckCircle2 className='ml-auto w-5 h-5 text-teal-500' strokeWidth={2.5} />
                                )}
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                <div className="flex-1 flex items-center justify-center">
                    {/* Question Dots */}
                    <div className="flex items-center gap-2">
                        {quiz.questions.map((q, index) => (
                            <button
                                key={q._id}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${selectedAnswer.hasOwnProperty(q._id)
                                    ? 'bg-teal-500 w-3 h-3'
                                    : index === currentQuestionIndex
                                        ? 'bg-slate-400 w-3 h-3'
                                        : 'bg-slate-300'
                                    }`}
                                aria-label={`Go to question ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {isLastQuestion && allAnswered ? (
                    <button
                        onClick={() => setShowSubmitConfirm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all shadow-lg shadow-teal-500/25 font-medium"
                    >
                        <Send className="w-5 h-5" />
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        onClick={handleNextQuestion}
                        disabled={isLastQuestion}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 font-medium"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-teal-100 rounded-full flex-shrink-0">
                                <Send className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Submit Quiz?</h2>
                                <p className="text-gray-600 text-sm">
                                    You have answered all <strong>{quiz.questions.length} questions</strong>.
                                    Are you ready to submit your quiz?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={handleQuizSubmit}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-lg transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit
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

export default QuizeTakePage;