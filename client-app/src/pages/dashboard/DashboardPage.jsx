import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await progressService.getDashboardData();
                console.log("Data__getDashboardData", response);

                // ✅ Extract the data property from response
                setDashboardData(response.data || response);

            } catch (error) {
                toast.error('Failed to fetch dashboard data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!dashboardData || !dashboardData.overview) {
        return (
            <div className='h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4'>
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 text-sm">No Dashboard Data Available</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Documents",
            value: dashboardData.overview.totalDocuments || 0,
            icon: FileText,
            gradient: 'from-blue-400 to-cyan-500',
            shadowColor: 'shadow-blue-500/25'
        },
        {
            label: "Total Flashcards",
            value: dashboardData.overview.totalFlashcards || 0,
            icon: BookOpen,
            gradient: 'from-purple-400 to-pink-500',
            shadowColor: 'shadow-purple-500/25'
        },
        {
            label: "Total Quizzes",
            value: dashboardData.overview.totalQuizzes || 0,
            icon: BrainCircuit,
            gradient: 'from-emerald-400 to-teal-500',
            shadowColor: 'shadow-emerald-500/25'
        }
    ];

    return (
        <div className='min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50'>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Track your learning progress and activity
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => {
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        {stat.label}
                                    </span>
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                        <stat.icon className='w-6 h-6 text-white' strokeWidth={2} />
                                    </div>
                                </div>

                                <div className="text-4xl font-bold text-gray-900">
                                    {stat.value}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Clock className='w-5 h-5 text-gray-600' strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Recent Activity
                        </h3>
                    </div>

                    {dashboardData.recentActivity &&
                        (dashboardData.recentActivity.documents?.length > 0 ||
                            dashboardData.recentActivity.quizzes?.length > 0) ? (
                        <div className="space-y-1">
                            {[
                                ...(dashboardData.recentActivity.documents || []).map(doc => ({
                                    id: doc._id,
                                    description: doc.title,
                                    timestamp: doc.lastAccessed,
                                    link: `/documents/${doc._id}`,
                                    type: 'document'
                                })),
                                ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
                                    id: quiz._id,
                                    description: quiz.title,
                                    timestamp: quiz.lastAccessed,
                                    link: `/quizzes/${quiz._id}`,
                                    type: 'quiz'
                                }))
                            ]
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((activity, index) => (
                                    <div
                                        key={activity.id || index}
                                        className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.type === 'document'
                                                ? 'bg-blue-500'
                                                : 'bg-emerald-500'
                                                }`} />

                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 font-medium">
                                                    {activity.type === 'document' ? 'Accessed Document' : 'Attempted Quiz'}:{' '}
                                                    <span className="font-normal">
                                                        {activity.description}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(activity.timestamp).toLocaleString('en-US', {
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {activity.link && (
                                            <Link
                                                to={activity.link}
                                                className="text-teal-500 hover:text-teal-600 font-medium text-sm px-4 py-2 hover:bg-teal-50 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                View
                                            </Link>
                                        )}
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                                <Clock className='w-8 h-8 text-gray-400' />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">No recent activity yet.</p>
                            <p className="text-gray-500 text-sm">Start learning to see your progress here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;