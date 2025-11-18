// import React from 'react';
// import { motion } from 'framer-motion';
// import { Menu, Brain, Home, Mail, Info, User } from 'lucide-react';

// export default function Navbar({ isSidebarOpen, setIsSidebarOpen, scrollToSection, activeSection }) {
//   return (
//     <motion.nav
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//       className="bg-white/70 backdrop-blur-xl shadow-lg sticky top-0 z-40 border-b border-purple-100"
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center gap-4">
//             <motion.button
//               whileHover={{ scale: 1.1, rotate: 90 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsSidebarOpen(true)}
//               className="p-2 rounded-xl hover:bg-purple-100 transition-colors"
//             >
//               <Menu className="w-6 h-6 text-purple-600" />
//             </motion.button>

//             <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
//               <motion.div
//                 animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
//                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//               >
//                 <Brain className="w-8 h-8 text-purple-600" />
//               </motion.div>
//               <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AlzDetect</span>
//             </motion.div>
//           </div>

//           <div className="hidden md:flex items-center gap-6">
//             {[
//               { label: 'Home', icon: Home, section: 'home' },
//               { label: 'Contact Us', icon: Mail, section: 'contact' },
//               { label: 'About', icon: Info, section: 'about' }
//             ].map((item) => (
//               <motion.button
//                 key={item.section}
//                 whileHover={{ scale: 1.1, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => scrollToSection(item.section)}
//                 className={`flex items-center gap-2 transition-colors font-medium ${
//                   activeSection === item.section ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
//                 }`}
//               >
//                 <item.icon className="w-4 h-4" />
//                 <span>{item.label}</span>
//               </motion.button>
//             ))}

//             <motion.button
//               whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)" }}
//               whileTap={{ scale: 0.95 }}
//               className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
//               onClick={() => scrollToSection('about')}
//             >
//               <User className="w-4 h-4" />
//               <span className="font-medium">Profile</span>
//             </motion.button>
//           </div>
//         </div>
//       </div>
//     </motion.nav>
//   );
// }


import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Brain, Home, Mail, Info } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Navbar({ isSidebarOpen, setIsSidebarOpen, scrollToSection, activeSection }) {
  const navigate = useNavigate();

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
            {/* Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-md bg-indigo-300 hover:bg-indigo-400 text-white transition-colors shadow-sm"
            >
              <Menu className="w-6 h-6" />
            </motion.button>

            {/* Logo */}
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <Brain className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-800">AlzDetect</span>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Nav Buttons + Login */}
          <div className="hidden md:flex items-center gap-3">
            {/* Navigation Buttons */}
            {[
              { label: 'Home', icon: Home, section: 'home' },
              { label: 'Contact', icon: Mail, section: 'contact' },
              { label: 'About', icon: Info, section: 'about' }
            ].map((item) => (
              <motion.button
                key={item.section}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.section)}
                className={`flex items-center gap-1 text-sm md:text-base font-medium px-4 py-2 rounded-md transition-colors ${
                  activeSection === item.section
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                } shadow-sm`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}

            {/* Single Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm md:text-base font-medium px-5 py-2.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md"
            >
              Login
            </motion.button>
          </div>

        </div>
      </div>
    </motion.nav>
  );
}
