import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    BarChart3, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    Brain,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { title: 'User Management', icon: Users, path: '/admin/users' },
        { title: 'Reports', icon: FileText, path: '/admin/reports' },
        { title: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside 
                className={`hidden md:flex flex-col bg-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Brain className="w-6 h-6" />
                    </div>
                    {!collapsed && <span className="font-bold text-xl tracking-tight">AlzDetect <span className="text-indigo-400">Admin</span></span>}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                    isActive 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="font-medium">{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">Logout Admin</span>}
                    </button>
                    
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className="mt-4 w-full flex justify-center p-2 text-slate-500 hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-50 p-6 md:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Brain className="w-8 h-8 text-indigo-500" />
                                    <span className="font-bold text-xl">AlzDetect Admin</span>
                                </div>
                                <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <nav className="space-y-4">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-4 rounded-xl ${
                                                isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'
                                            }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-lg font-medium">{item.title}</span>
                                        </Link>
                                    );
                                })}
                                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-950/20 rounded-xl mt-8">
                                    <LogOut className="w-6 h-6" />
                                    <span className="text-lg font-medium">Logout</span>
                                </button>
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
                    <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{user?.name || 'Administrator'}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold border-2 border-indigo-200 shadow-sm">
                            {user?.name?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
