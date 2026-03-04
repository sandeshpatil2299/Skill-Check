import React, {useState, useEffect} from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import flashcardService from '../../services/flashcardService'
import aiServices from '../../services/aiService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Flashcard from '../../components/flashcards/Flashcard'

const FlashcardPage = () => {
    const {id: documentId}= useParams();
    const [flashcardSets, setFlashcardSets]= useState([]);
    const [flashcards, setFlashcards]= useState([]);
    const [loading, setLoading]= useState(false);
    const [generating, setGenerating]= useState(false);
    const [currentCardIndex, setCurrentCardIndex]= useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen]= useState(false);
    const [deleting, setDeleting]= useState(false);
    return (
        <div>FlashcardPage</div>
    )
}

export default FlashcardPage