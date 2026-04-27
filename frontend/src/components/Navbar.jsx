import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Brain, Home, Mail, Info, LayoutDashboard, LogOut, X, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function Navbar({ isSidebarOpen, setIsSidebarOpen, scrollToSection, activeSection }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const isHomePage = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section) => {
    setMobileMenuOpen(false);
    if (isHomePage && scrollToSection) {
      scrollToSection(section);
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navItems = [
    { label: 'Home', icon: Home, section: 'home' },
    { label: 'Contact', icon: Mail, section: 'contact' },
    { label: 'About', icon: Info, section: 'about' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LEFT SIDE: Logo + Sidebar Trigger */}
          <div className="flex items-center gap-6">
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">AlzDetect</span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex items-center justify-center p-2.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors border border-slate-200"
              title="Toggle Navigation"
            >
              <Menu size={20} />
            </motion.button>
          </div>

          {/* RIGHT SIDE — Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => handleNavClick(item.section)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                  activeSection === item.section && isHomePage
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="mx-2 w-px h-6 bg-slate-200" />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200"
                  >
                    <LayoutDashboard size={18} className="text-indigo-400" />
                    Admin
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  My Dashboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate("/login")}
                  className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:text-indigo-600 transition-colors"
                >
                  Log In
                </button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => navigate("/signup")}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all border border-indigo-500"
                >
                  Get Started Free
                </motion.button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE — Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-3 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-colors"
                title="Open Sidebar"
            >
                <Menu size={20} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="md:hidden bg-white border-t border-slate-100 shadow-2xl origin-top"
          >
            <div className="px-6 py-8 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  className="w-full flex items-center gap-4 py-3 text-slate-600 font-bold text-lg"
                >
                  <item.icon size={22} className="text-indigo-500" />
                  {item.label}
                </button>
              ))}
              
              <div className="h-px bg-slate-100 my-4" />

              {isAuthenticated ? (
                  <>
                    {user?.role === 'admin' && (
                        <button onClick={() => handleNavigate('/admin')} className="w-full flex items-center gap-4 py-3 text-slate-900 font-bold text-lg">
                            <LayoutDashboard size={22} className="text-purple-600" /> Admin Panel
                        </button>
                    )}
                    <button onClick={() => handleNavigate('/dashboard')} className="w-full flex items-center gap-4 py-3 text-indigo-600 font-bold text-lg">
                        <LayoutDashboard size={22} /> Dashboard
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 py-3 text-rose-600 font-bold text-lg">
                        <LogOut size={22} /> Logout 
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <button onClick={() => handleNavigate('/login')} className="w-full flex items-center gap-4 py-3 text-slate-600 font-bold text-lg">
                        <LogIn size={22} className="text-indigo-600" /> Log In
                    </button>
                    <button onClick={() => handleNavigate('/signup')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-center shadow-lg shadow-indigo-100">
                        Create Free Account
                    </button>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}