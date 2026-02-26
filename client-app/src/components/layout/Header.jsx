import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, User, Menu, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth()
    
    const navigate = useNavigate()
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Menu Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>
                </div>

                {/* Right: Notifications & Profile */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell size={20} strokeWidth={2} className="text-gray-700" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                    <div className="px-4 py-2 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                            <p className="text-sm text-gray-900 font-medium">New quiz available</p>
                                            <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                            <p className="text-sm text-gray-900 font-medium">Flashcard review reminder</p>
                                            <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                            <p className="text-sm text-gray-900 font-medium">Document processed</p>
                                            <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-t border-gray-200">
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>

                            {/* User Info */}
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>

                            <ChevronDown size={16} className="text-gray-500 hidden md:block" />
                        </button>

                        {/* Profile Dropdown */}
                        {showProfileDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowProfileDropdown(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                    {/* User Info in Dropdown */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {user?.username || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user?.email || 'user@example.com'}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setShowProfileDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <UserCircle size={18} />
                                            <span>My Profile</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigate('/settings')
                                                setShowProfileDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                        >
                                            <Settings size={18} />
                                            <span>Settings</span>
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-200 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header