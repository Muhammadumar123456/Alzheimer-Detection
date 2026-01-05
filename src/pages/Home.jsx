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
import { Upload, Brain, BarChart3, LayoutDashboard } from 'lucide-react';

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
    { title: 'Dashboard', description: 'View your health dashboard and track progress', icon: LayoutDashboard, gradient: 'from-emerald-400 to-emerald-600', action: '/dashboard', emoji: '📊' },
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
        {isSidebarOpen && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            handleLogout={handleLogout}
          />
        )}
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
