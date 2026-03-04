import React, { useState, useEffect } from 'react'
import flashcardService from '../../services/flashcardService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import FlashcardSetCard from './FlashcardSetCard'

const FlashcardsListPage = () => {
    const [flashcardSets, setFlashcardSet] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlashcardSets = async () => {
            try {
                const response = await flashcardService.getAllFlashcardSets();
                console.log(response.data)
                setFlashcardSet(response.data);
            } catch (error) {
                toast.error("Failed to fetch flashcardsets")
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchFlashcardSets();
    }, [])

    const renderContent = () => {
        if (loading) {
            return (
                <Spinner />
            )
        }

        if (flashcardSets.length === 0) {
            return (
                <EmptyState
                    title={`No Flashcard Set Found`}
                    description="You haven't generated any flashcards yet, Go to a document to create first flashcard set."
                />
            )
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    flashcardSets.map((set) => {
                        return <FlashcardSetCard key={set._id} flashcardSet={set} />
                    })
                }
            </div>
        )
    }

    return (
        <div className='min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6'>
            <PageHeader title="All Flashcard Sets" />
            {renderContent()}
        </div>
    )
}

export default FlashcardsListPage