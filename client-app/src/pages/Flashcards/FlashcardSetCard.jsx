import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Sparkles, TrendingUp, ChevronRight } from 'lucide-react'
import moment from 'moment'

const FlashcardSetCard = ({ flashcardSet }) => {
    {
        const navigate = useNavigate();

        const handleStudyNow = () => {
            navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
        };

        const reviewCount = flashcardSet.cards.filter(card => card.lastReviewed).length;
        const totalCards = flashcardSet.cards.length;
        const progressPercentage = totalCards > 0 ? Math.round((reviewCount / totalCards) * 100) : 0;

        return (
            <div
                className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-blue-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1"
                onClick={handleStudyNow}
            >
                <div className="space-y-4">
                    {/* Icon and title */}
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100/20 to-blue-200/20 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <BookOpen className='w-6 h-6 text-blue-500' strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate mb-1" title={flashcardSet?.documentId?.title}>
                                {flashcardSet?.documentId?.title || 'Flashcard Set'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Created {moment(flashcardSet.createdAt).fromNow()}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-sm font-semibold text-purple-700">
                                {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
                            </span>
                        </div>

                        {reviewCount > 0 && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                <TrendingUp className='w-4 h-4 text-emerald-600' strokeWidth={2.5} />
                                <span className="text-sm font-semibold text-emerald-700">
                                    {progressPercentage}% reviewed
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {totalCards > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-600">
                                    Progress
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                    {reviewCount}/{totalCards} reviewed
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Study Button */}
                    <div className="pt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStudyNow();
                            }}
                            className="group/btn relative w-full h-11 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Sparkles className='w-4 h-4' strokeWidth={2.5} />
                                Study Now
                                <ChevronRight className='w-4 h-4 group-hover/btn:translate-x-1 transition-transform' />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };
}

export default FlashcardSetCard