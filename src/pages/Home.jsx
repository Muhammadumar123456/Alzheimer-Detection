// import { useState } from 'react';
// import { Link } from "react-router-dom";

// import { motion, AnimatePresence } from 'framer-motion';
// import { Menu, X, Home, Mail, Phone, User, LogOut, Settings, FileText, Brain, Upload, ClipboardList, BarChart3, Info, Heart, Shield } from 'lucide-react';

// export default function HomePage() {
//   // const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeSection, setActiveSection] = useState('home');

//   const handleLogout = () => {
//     alert('Logging out...');
//     // In your actual app: localStorage.removeItem('authToken'); navigate('/login');
//   };

//   const scrollToSection = (sectionId) => {
//     setActiveSection(sectionId);
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//     //  setActiveSection(sectionId);
//   };

//   const features = [
//     {
//       title: 'Upload MRI',
//       description: 'Upload your MRI reports for AI-powered analysis',
//       icon: Upload,
//       gradient: 'from-blue-400 to-blue-600',
//       action: '/upload-mri',
//       emoji: '🔬'
//     },
//     {
//       title: 'Cognitive Test',
//       description: 'Take our comprehensive cognitive assessment',
//       icon: Brain,
//       gradient: 'from-purple-400 to-purple-600',
//       action: '/cognitive-test',
//       emoji: '🧩'
//     },
//     {
//       title: 'View Results',
//       description: 'Check your test results and recommendations',
//       icon: BarChart3,
//       gradient: 'from-indigo-400 to-indigo-600',
//       action: '/results',
//       emoji: '📊'
//     }
//   ];

//   const floatingIcons = [
//     { emoji: '🏥', color: 'from-blue-400 to-blue-600', delay: 0, duration: 4 },
//     { emoji: '👨‍⚕️', color: 'from-purple-400 to-purple-600', delay: 0.5, duration: 3.5 },
//     { emoji: '🧠', color: 'from-indigo-400 to-indigo-600', delay: 1, duration: 4.5 },
//     { emoji: '👩‍⚕️', color: 'from-pink-400 to-pink-600', delay: 1.5, duration: 3.8 },
//     { emoji: '💊', color: 'from-green-400 to-green-600', delay: 2, duration: 4.2 },
//     { emoji: '📋', color: 'from-orange-400 to-orange-600', delay: 2.5, duration: 3.9 }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-x-hidden">
//       {/* Top Navigation Bar with Animation */}
//       <motion.nav 
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="bg-white shadow-md sticky top-0 z-40"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo and Menu Button */}
//             <div className="flex items-center gap-4">
//               <motion.button
//                 whileHover={{ scale: 1.1, rotate: 90 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={() => setIsSidebarOpen(true)}
//                 className="p-2 rounded-lg hover:bg-indigo-50 transition-colors"
//               >
//                 <Menu className="w-6 h-6 text-indigo-600" />
//               </motion.button>
//               <motion.div 
//                 className="flex items-center gap-2"
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <motion.div
//                   animate={{ rotate: [0, 10, -10, 0] }}
//                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//                 >
//                   <Brain className="w-8 h-8 text-indigo-600" />
//                 </motion.div>
//                 <span className="text-xl font-bold text-indigo-700">AlzDetect</span>
//               </motion.div>
//             </div>

//             {/* Navigation Links */}
//             <div className="hidden md:flex items-center gap-6">
//               <motion.button
//                 whileHover={{ scale: 1.1, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => scrollToSection('home')}
//                 className={`flex items-center gap-2 transition-colors ${
//                   activeSection === 'home' ? 'text-indigo-600' : 'text-white-700 hover:text-indigo-600'
//                 }`}
//               >
//                 <Home className="w-4 h-4" />
//                 <span className="font-medium">Home</span>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.1, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => scrollToSection('contact')}
//                 className={`flex items-center gap-2 transition-colors ${
//                   activeSection === 'contact' ? 'text-indigo-600' : 'text-white-700 hover:text-indigo-600'
//                 }`}
//               >
//                 <Mail className="w-4 h-4" />
//                 <span className="font-medium">Contact Us</span>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.1, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => scrollToSection('about')}
//                 className={`flex items-center gap-2 transition-colors ${
//                   activeSection === 'about' ? 'text-indigo-600' : 'text-white-700 hover:text-indigo-600'
//                 }`}
//               >
//                 <Info className="w-4 h-4" />
//                 <span className="font-medium">About</span>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
//               >
//                 <User className="w-4 h-4" />
//                 <span className="font-medium">Profile</span>
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </motion.nav>

//       {/* Side Drawer */}
//       <AnimatePresence>
//         {isSidebarOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsSidebarOpen(false)}
//               className="fixed inset-0 bg-black bg-opacity-50 z-40"
//             />

//             <motion.div
//               initial={{ x: -300 }}
//               animate={{ x: 0 }}
//               exit={{ x: -300 }}
//               transition={{ type: 'spring', damping: 25 }}
//               className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto"
//             >
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-8">
//                   <motion.div 
//                     className="flex items-center gap-2"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.2 }}
//                   >
//                     <Brain className="w-8 h-8 text-indigo-600" />
//                     <span className="text-xl font-bold text-indigo-700">Menu</span>
//                   </motion.div>
//                   <motion.button
//                     whileHover={{ rotate: 90 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={() => setIsSidebarOpen(false)}
//                     className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                   >
//                     <X className="w-6 h-6 text-gray-600" />
//                   </motion.button>
//                 </div>

//                 <motion.div 
//                   className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                 >
//                   <div className="flex items-center gap-3">
//                     <motion.div 
//                       className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center"
//                       whileHover={{ scale: 1.1, rotate: 360 }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       <User className="w-6 h-6 text-white" />
//                     </motion.div>
//                     <div>
//                       <p className="font-semibold text-gray-800">John Doe</p>
//                       <p className="text-sm text-gray-600">john@example.com</p>
//                     </div>
//                   </div>
//                 </motion.div>

//                 <div className="space-y-2">
//                   {[ 
//                     { icon: User, label: 'My Profile', delay: 0.4 },
//                     { icon: FileText, label: 'Medical History', delay: 0.45 },
//                     { icon: Settings, label: 'Settings', delay: 0.5 },
//                     { icon: ClipboardList, label: 'Appointments', delay: 0.55 }
//                   ].map((item) => (
//                     <motion.button
//                       key={item.label}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: item.delay }}
//                       whileHover={{ x: 10, backgroundColor: 'rgba(229, 229, 236, 0.1)' }}
//                       className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg transition-colors"
//                     >
//                       <item.icon className="w-5 h-5" />
//                       <span className="font-medium">{item.label}</span>
//                     </motion.button>
//                   ))}
//                   <motion.button
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.6 }}
//                     whileHover={{ x: 10, backgroundColor: 'rgba(21, 20, 20, 0.1)' }}
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg transition-colors mt-4"
//                   >
//                     <LogOut className="w-5 h-5" />
//                     <span className="font-medium">Logout</span>
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <section id="home">
//           <motion.div
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-center mb-16"
//           >
//             <motion.h1 
//               className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               transition={{ duration: 0.8, ease: "easeOut" }}
//             >
//               Welcome to{' '}
//               <motion.span 
//                 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
//                 animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
//                 transition={{ duration: 5, repeat: Infinity }}
//               >
//                 AlzDetect
//               </motion.span>
//             </motion.h1>
//             <motion.p 
//               className="text-lg text-gray-600 max-w-2xl mx-auto"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               Early detection can help slow the progression of Alzheimer's disease. Take control of your brain health today.
//             </motion.p>
//           </motion.div>

//           <div className="relative mb-16 min-h-[300px]">
//             <div className="flex justify-center items-center gap-6 flex-wrap">
//               {floatingIcons.map((item, index) => (
//                 <motion.div
//                   key={index}
//                   animate={{ y: [0, -20, 0], rotateY: [0, 360], rotateZ: [0, 10, -10, 0] }}
//                   transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
//                   whileHover={{ scale: 1.2, rotateY: 180, transition: { duration: 0.3 } }}
//                   className={`w-28 h-28 bg-gradient-to-br ${item.color} rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer`}
//                   style={{ transformStyle: 'preserve-3d' }}
//                 >
//                   <motion.div className="text-white text-5xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
//                     {item.emoji}
//                   </motion.div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>

//           {/* Feature Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={feature.title}
//                 initial={{ opacity: 0, y: 60, rotateX: -15 }}
//                 animate={{ opacity: 1, y: 0, rotateX: 0 }}
//                 transition={{ delay: index * 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
//                 whileHover={{ y: -15, scale: 1.05, rotateY: 5, transition: { duration: 0.3 } }}
//                 className="relative group perspective-1000"
//                 style={{ transformStyle: 'preserve-3d' }}
//               >
//                 <motion.div 
//                   className="bg-white rounded-2xl shadow-xl p-8 h-full border-2 border-transparent hover:border-indigo-200 transition-all relative overflow-hidden"
//                   whileHover={{ boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)" }}
//                 >
//                   <motion.div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} />

//                   <motion.div className="absolute -top-4 -right-4 text-6xl" animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
//                     {feature.emoji}
//                   </motion.div>

//                   <motion.div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 relative z-10`} whileHover={{ scale: 1.2, rotate: 360, transition: { duration: 0.6 } }}>
//                     <feature.icon className="w-8 h-8 text-white" />
//                   </motion.div>

//                   <h3 className="text-2xl font-bold text-gray-800 mb-3 relative z-10">{feature.title}</h3>
//                   <p className="text-gray-600 mb-6 relative z-10">{feature.description}</p>

//                   {/* Link Button */}
//                   <Link
//                     to={feature.action}
//                     className={`w-full py-3 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-xl shadow-lg relative z-10 block text-center`}
//                   >
//                     Get Started →
//                   </Link>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>

//           {/* Hero CTA Button */}
//           <motion.div className="text-center mb-16">
//             <Link
//               to="/cognitive-test"
//               className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-lg relative z-10 inline-block"
//             >
//               Start Cognitive Test Now →
//             </Link>
//           </motion.div>
//         </section>

       
//         {/* Contact Section */}
// <motion.section 
//   id="contact" 
//   className="mt-24 py-16"
//   initial={{ opacity: 0 }}
//   whileInView={{ opacity: 1 }}
//   viewport={{ once: true }}
// >
//   <motion.div
//     initial={{ y: 40 }}
//     whileInView={{ y: 0 }}
//     viewport={{ once: true }}
//     className="bg-white rounded-2xl shadow-xl p-12"
//   >
//     <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Contact Us</h2>
//     <div className="grid md:grid-cols-2 gap-8">
//       <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4">
//         <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
//           <Mail className="w-6 h-6 text-indigo-600" />
//         </div>
//         <div>
//           <p className="font-semibold text-gray-800">Email</p>
//           <p className="text-gray-600">support@alzdetect.com</p>
//         </div>
//       </motion.div>
//       <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4">
//         <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//           <Phone className="w-6 h-6 text-purple-600" />
//         </div>
//         <div>
//           <p className="font-semibold text-gray-800">Phone</p>
//           <p className="text-gray-600">+1 (555) 123-4567</p>
//         </div>
//       </motion.div>
//     </div>
//   </motion.div>
// </motion.section>

// {/* About Section */}
// <motion.section 
//   id="about" 
//   className="mt-16 py-16"
//   initial={{ opacity: 0 }}
//   whileInView={{ opacity: 1 }}
//   viewport={{ once: true }}
// >
//   <motion.div
//     initial={{ y: 40 }}
//     whileInView={{ y: 0 }}
//     viewport={{ once: true }}
//     className="bg-white rounded-2xl shadow-xl p-12"
//   >
//     <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">About AlzDetect</h2>
//     <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
//       AlzDetect is a cutting-edge platform designed to help detect Alzheimer's disease in its early stages. 
//       Using advanced AI technology and medical expertise, we provide comprehensive assessments to help patients 
//       and doctors make informed decisions about brain health.
//     </p>
//   </motion.div>
// </motion.section>

// {/* Footer */}
// <motion.footer 
//   className="bg-white border-t border-gray-200 mt-16"
//   initial={{ opacity: 0 }}
//   whileInView={{ opacity: 1 }}
//   viewport={{ once: true }}
// >
//   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//     <div className="text-center text-gray-600">
//       <p>© 2024 AlzDetect. All rights reserved.</p>
//       <p className="text-sm mt-2">Early detection saves lives</p>
//     </div>
//   </div>
// </motion.footer>


//       </main>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import NavBar from '../components/Navbar';
import Sidebar from "../components/Sidebar";
import HeroSection from "../components/HeroSection";



import FloatingIcons from '../components/FloatingIcons';
import FeatureCards from '../components/FeatureCards';
import StatsSection from '../components/StatsSection';
import CTASection from '../components/CTASection';
import ContactSection from '../components/ContactSection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import { Upload, Brain, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleLogout = () => navigate('/login');
  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsSidebarOpen(false);
  };
  const handleNavigation = (path) => { navigate(path); setIsSidebarOpen(false); };

  const features = [
    { title: 'Upload MRI', description: 'Upload your MRI reports for AI-powered analysis', icon: Upload, gradient: 'from-blue-400 to-blue-600', action: '/upload-mri', emoji: '🔬' },
    { title: 'Cognitive Test', description: 'Take our comprehensive cognitive assessment', icon: Brain, gradient: 'from-purple-400 to-purple-600', action: '/cognitive-test', emoji: '🧩' },
    { title: 'View Results', description: 'Check your test results and recommendations', icon: BarChart3, gradient: 'from-indigo-400 to-indigo-600', action: '/results', emoji: '📊' }
  ];

  const floatingIcons = [
    { emoji: '🏥', color: 'from-blue-400 to-blue-600', delay: 0, duration: 4 },
    { emoji: '👨‍⚕️', color: 'from-purple-400 to-purple-600', delay: 0.5, duration: 3.5 },
    { emoji: '🧠', color: 'from-indigo-400 to-indigo-600', delay: 1, duration: 4.5 },
    { emoji: '👩‍⚕️', color: 'from-pink-400 to-pink-600', delay: 1.5, duration: 3.8 },
    { emoji: '💊', color: 'from-green-400 to-green-600', delay: 2, duration: 4.2 },
    { emoji: '📋', color: 'from-orange-400 to-orange-600', delay: 2.5, duration: 3.9 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-x-hidden relative">
      <NavBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeSection={activeSection} scrollToSection={scrollToSection} />
      <AnimatePresence>
        {isSidebarOpen && <Sidebar setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <HeroSection handleNavigation={handleNavigation} />
        <FloatingIcons icons={floatingIcons} />
        <FeatureCards features={features} handleNavigation={handleNavigation} />
        <StatsSection />
        <CTASection handleNavigation={handleNavigation} />
        <ContactSection />
        <AboutSection />
        <Footer />
      </main>
    </div>
  );
}
