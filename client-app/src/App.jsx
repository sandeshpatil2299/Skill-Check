import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from "./components/auth/ProtectedRoute"
import LoginPage from "./pages/Auth/LoginPage"
import RegisterPage from "./pages/Auth/RegisterPage"
import NotFoundPage from "./pages/NotFoundPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import DocumentListPage from "./pages/documents/DocumentListPage"
import DocumentDetailPage from "./pages/documents/DocumentListPage"
import FlashcardsListPage from "./pages/Flashcards/FlashcardsListPage"
import FlashcardPage from "./pages/Flashcards/FlashcardPage"
import QuizeTakePage from "./pages/Quizess/QuizeTakePage"
import QuizeResultPage from "./pages/Quizess/QuizeResultPage"
import ProfilePage from "./pages/Profile/ProfilePage"
import { useAuth } from './context/AuthContext'

const App = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading ...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/documents' element={<DocumentListPage />} />
          <Route path='/documents/:id' element={<DocumentDetailPage />} />
          <Route path='/flashcards' element={<FlashcardsListPage />} />
          <Route path='/documents/:id/flashcards' element={<FlashcardPage />} />
          <Route path='/quizzes/:quizId' element={<QuizeTakePage />} />
          <Route path='/quizzes/:quizId/results' element={<QuizeResultPage />} />
          <Route path='/profile' element={<ProfilePage />} />
        </Route>


        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App