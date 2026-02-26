import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X } from 'lucide-react'

const Sidebar = ({ isSideBarOpen, toggleSidebar }) => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const navLinks = [
        {
            to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard'
        },
        {
            to: '/documents', icon: FileText, text: 'Documents'
        },
        {
            to: '/flashcards', icon: BookOpen, text: 'Flashcards'
        },
        {
            to: '/quizzes', icon: BrainCircuit, text: 'Quizzes'
        },
        {
            to: '/profile', icon: User, text: 'Profile'
        }
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isSideBarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
                    w-64 transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static
                    ${isSideBarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="w-9 h-9 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">SkillCheck</span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <link.icon
                                            size={20}
                                            className={isActive ? 'text-blue-600' : 'text-gray-500'}
                                        />
                                        <span>{link.text}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar