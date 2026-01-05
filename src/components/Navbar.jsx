import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Brain, Home, Mail, Info, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ isSidebarOpen, setIsSidebarOpen, scrollToSection, activeSection }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const handleNavClick = (section) => {
    if (isHomePage && scrollToSection) {
      // On home page: scroll to section
      scrollToSection(section);
    } else {
      // On other pages: navigate to home first, then scroll
      navigate('/home');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gray-200 shadow-md sticky top-0 z-50 border-b border-gray-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">

          {/* LEFT SIDE: Menu + Logo */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 rounded-md bg-indigo-300 hover:bg-indigo-400 text-white transition-colors shadow-sm"
            >
              <Menu className="w-6 h-6" />
            </motion.button>

            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/home')}
            >
              <Brain className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-800">AlzDetect</span>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Nav Buttons + Dashboard + Login */}
          <div className="hidden md:flex items-center gap-3">
            {[
              { label: 'Home', icon: Home, section: 'home' },
              { label: 'Contact', icon: Mail, section: 'contact' },
              { label: 'About', icon: Info, section: 'about' }
            ].map((item) => (
              <motion.button
                key={item.section}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item.section)}
                className={`flex items-center gap-1 text-sm md:text-base font-medium px-4 py-2 rounded-md transition-colors ${activeSection === item.section && isHomePage
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                  } shadow-sm`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}

            {/* Dashboard Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className={`flex items-center gap-2 text-sm md:text-base font-medium px-4 py-2 rounded-md transition-all shadow-md ${location.pathname === '/dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </motion.button>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm md:text-base font-medium px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md"
            >
              Login
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
