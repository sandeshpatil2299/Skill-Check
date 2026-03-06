import React, { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import authService from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const ProfilePage = () => {
    const { user, logout } = useAuth()

    const [loading, setLoading] = useState(true)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Visibility toggles for password fields
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // Load user data on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true)
                const profile = await authService.getProfile()
                setUsername(profile.username || user?.username || '')
                setEmail(profile.email || user?.email || '')
            } catch (err) {
                // Fallback to context values if API call fails
                setUsername(user?.username || '')
                setEmail(user?.email || '')
                toast.error('Failed to load profile data.')
            } finally {
                setLoading(false)
            }
        }

        loadProfile()
    }, [user])

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match.')
            return
        }

        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters.')
            return
        }

        setPasswordLoading(true)
        try {
            await authService.changePassword({ currentPassword, newPassword })
            toast.success('Password changed successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => {
                logout();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }, 3000)

        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to change password.'
            toast.error(message)
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Spinner />
            </div>
        )
    }

    return (
        <div className='bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6'>
            {/* <PageHeader title="Profile Settings" /> */}
            <h1 className="text-3xl font-semibold text-slate-800 w-2/3 mb-5 mx-auto">Profile Settings</h1>
            <div className="space-y-6 w-2/3 mx-auto">

                {/* ── User Information ── */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        User Information
                    </h3>

                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-neutral-400" />
                                </div>
                                <p className="w-full h-9 pl-9 pr-3 flex items-center border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
                                    {username}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-neutral-400" />
                                </div>
                                <p className="w-full h-9 pl-9 pr-3 flex items-center border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900">
                                    {email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Change Password ── */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                        Change Password
                    </h3>

                    <form onSubmit={handlePasswordChange} className="space-y-4">

                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    className="w-full h-9 pl-9 pr-10 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                                >
                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    className="w-full h-9 pl-9 pr-10 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {newPassword && newPassword.length < 8 && (
                                <p className="mt-1 text-xs text-red-500">
                                    Password must be at least 8 characters.
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-neutral-400" />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    className="w-full h-9 pl-9 pr-10 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">
                                    Passwords do not match.
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <Button type="submit" disabled={passwordLoading}>
                                {passwordLoading ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default ProfilePage