import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import documentServices from '../../services/documentService'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import {
    ArrowLeft,
    ExternalLink,
    Download,
    MessageSquare,
    Sparkles,
    BookOpen,
    BrainCircuit,
    FileText,
    AlertCircle
} from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Tabs from '../../components/common/Tabs'
import ChatInterface from '../../components/chat/ChatInterface'
import AIActions from '../../components/ai/AIActions'
import FlashcardManager from '../../components/flashcards/FlashcardManager'
import QuizManager from '../../components/quizess/QuizManager'

const DocumentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("content");

    useEffect(() => {
        const fetchDocumentDetails = async () => {
            try {
                const data = await documentServices.getDocumentById(id);
                console.log('Document data:', data);
                setDocument(data);
            } catch (error) {
                toast.error("Failed to fetch document details");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchDocumentDetails();
    }, [id]);

    // Helper function to get the full pdf url
    const getPdfUrl = () => {
        if (!document?.data?.filePath) return null;

        const filePath = document.data.filePath;

        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
        }

        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000'; // ✅ Fixed typo

        return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    };

    const renderContent = () => {
        if (!document || !document.data || !document.data.filePath) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Not Available</h3>
                    <p className="text-gray-500 text-sm">The document file could not be loaded.</p>
                </div>
            );
        }

        const pdfUrl = getPdfUrl();

        return (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300"> {/* ✅ Fixed typo */}
                    <span className="text-sm font-medium text-gray-700">Document Viewer</span> {/* ✅ Fixed typo */}
                    <div className="flex items-center gap-2">
                        <a
                            href={pdfUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <ExternalLink size={16} />
                            Open
                        </a>
                        <a
                            href={pdfUrl}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            <Download size={16} />
                            Download
                        </a>
                    </div>
                </div >

                <div className="bg-gray-100 p-4">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-[70vh] bg-white rounded border border-gray-300"
                        title='PDF Viewer'
                        style={{
                            colorScheme: 'light',
                        }}
                    />
                </div>
            </div >
        );
    };

    const renderChat = () => {
        return (
            <ChatInterface documentId={id}/>
        );
    };

    const renderAIActions = () => {
        return (
            <AIActions documentId={id}/>    
        );
    };

    const renderFlashcardsTab = () => {
        return (
            <FlashcardManager documentId={id}/>
        );
    };

    const renderQuizzesTab = () => {
        return (
            <QuizManager documentId={id}/>
        );
    };

    const tabs = [
        { name: 'content', label: 'Content', content: renderContent }, // ✅ Pass function reference, not call it
        { name: 'chat', label: 'Chat', content: renderChat },
        { name: 'aiActions', label: 'AI Actions', content: renderAIActions },
        { name: 'flashcards', label: 'Flashcards', content: renderFlashcardsTab },
        { name: 'quizzes', label: 'Quizzes', content: renderQuizzesTab },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!document) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Not Found</h3>
                    <p className="text-gray-500 text-sm mb-6">The document you're looking for doesn't exist.</p>
                    <Link
                        to="/documents"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Documents
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6'>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link
                        to='/documents'
                        className='inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4'
                    >
                        <ArrowLeft size={16} />
                        Back to Documents
                    </Link>
                </div>

                <PageHeader
                    title={document.data?.title || 'Untitled Document'}
                    subtitle={`Uploaded ${new Date(document.data?.createdAt).toLocaleDateString()}`}
                />

                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
        </div>
    );
};

export default DocumentDetailPage;