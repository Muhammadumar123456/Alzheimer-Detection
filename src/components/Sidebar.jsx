import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, User, FileText, Settings, ClipboardList, LogOut } from 'lucide-react';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const menuItems = [
    { icon: User, label: 'My Profile', delay: 0.4, action: () => {} },
    { icon: FileText, label: 'Medical History', delay: 0.45, action: () => {} },
    { icon: Settings, label: 'Settings', delay: 0.5, action: () => {} },
    { icon: ClipboardList, label: 'Appointments', delay: 0.55, action: () => {} }
  ];

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Brain className="w-8 h-8 text-purple-600" />
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Menu</span>
                </motion.div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>

              <motion.div className="mb-8 p-5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center gap-3">
                  <motion.div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg" whileHover={{ scale: 1.05, rotate: 360 }} transition={{ duration: 0.5 }}>
                    <User className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-800">John Doe</p>
                    <p className="text-sm text-gray-600">john@example.com</p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-2">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.delay }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    onClick={() => { item.action(); setIsSidebarOpen(false); }}
                  >
                    <item.icon className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ x: 10 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
