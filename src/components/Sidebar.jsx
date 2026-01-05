import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Brain,
  Home,
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  LogOut,
  User
} from 'lucide-react';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home', delay: 0.3 },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', delay: 0.35 },
    { icon: Upload, label: 'Upload MRI', path: '/upload-mri', delay: 0.4 },
    { icon: Brain, label: 'Cognitive Test', path: '/cognitive-test', delay: 0.45 },
    { icon: BarChart3, label: 'View Results', path: '/results', delay: 0.5 }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleLogoutClick = () => {
    setIsSidebarOpen(false);
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            aria-label="Close sidebar overlay"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-50/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto"
            role="navigation"
            aria-label="Main navigation sidebar"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Brain className="w-8 h-8 text-purple-600" />
                  <span className="text-xl font-bold text-gray-800">Menu</span>
                </motion.div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>

              {/* User Info */}
              <motion.div
                className="mb-8 p-5 bg-white rounded-2xl shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <User className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-800">Guest User</p>
                    <p className="text-sm text-gray-500">guest@alzdetect.com</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Menu */}
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: item.delay }}
                      whileHover={{ x: 8, scale: 1.03 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg font-medium transition-all shadow-sm ${isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      aria-label={`Navigate to ${item.label}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}

                {/* Logout Button */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                  whileHover={{ x: 8, scale: 1.03 }}
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-5 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all shadow-md mt-4"
                  aria-label="Logout from application"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>

              {/* App Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-gray-300"
              >
                <p className="text-xs text-gray-500 text-center">
                  AlzDetect v1.0
                  <br />
                  FYP Project 2026
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
