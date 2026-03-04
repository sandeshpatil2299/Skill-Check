import React, { useState } from 'react';
import { RotateCcw, Star } from 'lucide-react';

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const question = flashcard?.question || 'No question';
    const answer = flashcard?.answer || 'No answer';
    const isStarred = flashcard?.isStarred || false;
    const difficulty = flashcard?.difficulty || 'medium';

    const handleStarClick = (e) => {
        e.stopPropagation();
        if (onToggleStar) {
            onToggleStar(flashcard);
        }
    };

    const getDifficultyColor = (level) => {
        const colors = {
            easy: 'bg-green-100 text-green-700 border-green-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            hard: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[level?.toLowerCase()] || colors.medium;
    };

    return (
        <div className="w-full max-w-2xl">
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full h-80 cursor-pointer"
                style={{ perspective: '1000px' }}
            >
                <div
                    className="relative w-full h-full transition-transform duration-500"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front - Question */}
                    <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* Difficulty Badge - Only on Front ✅ */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(difficulty)}`}>
                                {difficulty}
                            </span>
                        </div>

                        {/* Star Button - Only on Front ✅ */}
                        {onToggleStar && (
                            <button
                                onClick={handleStarClick}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm group"
                                aria-label={isStarred ? "Remove from starred" : "Add to starred"}
                            >
                                <Star
                                    className={`w-5 h-5 transition-all ${isStarred
                                            ? 'fill-yellow-300 text-yellow-300'
                                            : 'text-white group-hover:text-yellow-200'
                                        }`}
                                    strokeWidth={2}
                                />
                            </button>
                        )}

                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-emerald-100 mb-4 uppercase tracking-wider">
                                Question
                            </p>
                            <p className="text-2xl font-bold text-white leading-relaxed">
                                {question}
                            </p>
                        </div>
                        <p className="absolute bottom-6 text-sm text-emerald-100 font-medium">
                            Click to reveal answer
                        </p>
                    </div>

                    {/* Back - Answer (NO difficulty badge, NO star button) ✅ */}
                    <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-blue-100 mb-4 uppercase tracking-wider">
                                Answer
                            </p>
                            <p className="text-xl font-semibold text-white whitespace-pre-wrap leading-relaxed">
                                {answer}
                            </p>
                        </div>
                        <p className="absolute bottom-6 text-sm text-blue-100 font-medium">
                            Click to see question
                        </p>
                    </div>
                </div>
            </div>

            {/* Flip hint */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
                <RotateCcw className="w-4 h-4" />
                <span>Click card to flip</span>
            </div>
        </div>
    );
};

export default Flashcard;