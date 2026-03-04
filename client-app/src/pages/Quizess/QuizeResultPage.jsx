import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import quizService from '../../services/quizService'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Trophy,
    Target,
    BookOpen,
    RotateCcw,
    Home,
    Award,
    Lightbulb
} from 'lucide-react'

const QuizResultPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await quizService.getQuizResults(quizId);
                console.log('Results data:', data);
                setResults(data);
            } catch (error) {
                toast.error("Failed to fetch results or quiz not completed");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [quizId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!results || !results.data || !results.data.quiz || !results.data.results) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg mb-4">
                        Quiz results not found or quiz not completed yet.
                    </p>
                    <Link
                        to="/quizzes"
                        className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Quizzes
                    </Link>
                </div>
            </div>
        );
    }

    const { data: { quiz, results: detailedResults } } = results;

    const score = quiz.score || 0;
    const totalQuestions = quiz.totalQuestions || detailedResults.length;
    const correctAnswers = detailedResults.filter(r => r.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-amber-500 to-orange-500';
        return 'from-rose-500 to-red-500';
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return 'Outstanding!';
        if (score >= 80) return 'Great Job!';
        if (score >= 70) return 'Good Work!';
        if (score >= 60) return 'Not Bad!';
        return 'Keep Practicing!';
    };

    const getScoreIcon = (score) => {
        if (score >= 80) return <Trophy className="w-12 h-12 text-yellow-500" />;
        if (score >= 60) return <Award className="w-12 h-12 text-orange-500" />;
        return <Target className="w-12 h-12 text-slate-500" />;
    };

    return (
        <div className='max-w-4xl mx-auto p-6'>
            {/* Back Button */}
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Document
            </Link>

            {/* Score Card */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden mb-8">
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-r ${getScoreColor(score)} p-8 text-center`}>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                        {getScoreIcon(score)}
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {score}%
                    </h1>
                    <p className="text-xl text-white/90 font-medium">
                        {getScoreMessage(score)}
                    </p>
                    <p className="text-sm text-white/80 mt-2">
                        {quiz.title || 'Quiz Results'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 divide-x divide-slate-200">
                    <div className="p-6 text-center">
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                            {totalQuestions}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                            Total Questions
                        </div>
                    </div>
                    <div className="p-6 text-center">
                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                            {correctAnswers}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                            Correct
                        </div>
                    </div>
                    <div className="p-6 text-center">
                        <div className="text-3xl font-bold text-rose-600 mb-1">
                            {incorrectAnswers}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                            Incorrect
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
                
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Detailed Review
                </h2>
                    
                {detailedResults.map((result, index) => {
                    // ✅ Question data is in the result object itself
                    const isCorrect = result.isCorrect;

                    return (
                        <div
                            key={index}
                            className={`bg-white rounded-xl border-2 p-6 transition-all ${isCorrect
                                ? 'border-emerald-200 bg-emerald-50/30'
                                : 'border-rose-200 bg-rose-50/30'
                                }`}
                        >
                            {/* Question Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCorrect
                                    ? 'bg-emerald-100'
                                    : 'bg-rose-100'
                                    }`}>
                                    {isCorrect ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-rose-600" strokeWidth={2.5} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-semibold text-slate-500">
                                            Question {result.questionIndex + 1}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isCorrect
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900 leading-relaxed">
                                        {result.question} {/* ✅ Question is in result */}
                                    </h3>
                                </div>
                            </div>

                            {/* Answers */}
                            <div className="space-y-3 ml-14">
                                {/* User's Answer */}
                                <div className={`p-4 rounded-lg border-2 ${isCorrect
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-rose-50 border-rose-200'
                                    }`}>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                        Your Answer
                                    </div>
                                    <div className={`font-medium ${isCorrect ? 'text-emerald-900' : 'text-rose-900'
                                        }`}>
                                        {result.selectedAnswer}
                                    </div>
                                </div>

                                {/* Correct Answer (if incorrect) */}
                                {!isCorrect && (
                                    <div className="p-4 rounded-lg border-2 bg-emerald-50 border-emerald-200">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                            Correct Answer
                                        </div>
                                        <div className="font-medium text-emerald-900">
                                            {result.correctAnswer}
                                        </div>
                                    </div>
                                )}

                                {/* Explanation (if available) */}
                                {result.explanation && (
                                    <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                                        <div className="flex items-start gap-2 mb-2">
                                            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                                            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                Explanation
                                            </div>
                                        </div>
                                        <div className="text-sm text-blue-900">
                                            {result.explanation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                <div className="text-center mb-4">
                    <p className="text-slate-700 font-medium">
                        {score >= 80
                            ? "Excellent work! You've mastered this topic."
                            : score >= 60
                                ? "Good job! Review the incorrect answers to improve."
                                : "Keep studying! Practice makes perfect."}
                    </p>
                </div>
                <div className="flex w-1/2 mx-auto items-center gap-3 justify-center">
                    <Link
                        to="/dashboard"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25 font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuizResultPage;