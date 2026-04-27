import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, LayoutDashboard, Upload, BarChart3, LogOut, Menu, X, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Upload MRI', path: '/upload-mri', icon: Upload },
    { label: 'Cognitive Test', path: '/cognitive-test', icon: Brain },
    { label: 'Results', path: '/results', icon: BarChart3 },
];

export default function AppNavbar({ isSidebarOpen, setIsSidebarOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        setMobileOpen(false);
        logout();
        navigate('/');
    };
    const handleNav = (path) => {
        setMobileOpen(false);
        navigate(path);
    };
    const userName = user?.name || user?.email?.split('@')[0] || 'User';

    return (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* LEFT SIDE: Logo + Sidebar Trigger */}
                    <div className="flex items-center gap-4">
                        <motion.div className="flex items-center gap-2.5 cursor-pointer" whileHover={{ scale: 1.03 }} onClick={() => handleNav('/')}>
                            <div className="p-1.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">AlzDetect</span>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden lg:flex items-center justify-center p-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors border border-slate-200"
                            title="Toggle Navigation"
                        >
                            <Menu size={20} />
                        </motion.button>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <motion.button key={link.path} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleNav(link.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Desktop User + Logout */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{userName}</span>
                        </div>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200">
                            <LogOut className="w-4 h-4" /> Logout
                        </motion.button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                            title="Open Sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-gray-200 bg-white overflow-hidden">
                        <div className="px-4 py-3 space-y-1">
                            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-gray-800 truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                                </div>
                            </div>
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <button key={link.path} onClick={() => handleNav(link.path)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                                        <span className="flex items-center gap-3"><link.icon className="w-5 h-5" />{link.label}</span>
                                        <ChevronRight className="w-4 h-4 opacity-40" />
                                    </button>
                                );
                            })}
                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
