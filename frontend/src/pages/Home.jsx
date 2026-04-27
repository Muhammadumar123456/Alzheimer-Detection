import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import HeroSection from '../components/HeroSection';
import FloatingIcons from '../components/FloatingIcons';
import AboutSection from '../components/AboutSection';
import FeatureCards from '../components/FeatureCards';
import StatsSection from '../components/StatsSection';
import CTASection from '../components/CTASection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { Brain, Upload, BarChart3, Activity } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Prevent Admin from staying on landing page
    React.useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleNavigation = (path) => {
        if (['/upload-mri', '/cognitive-test', '/results', '/dashboard'].includes(path)) {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
        }
        navigate(path);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        { title: 'Upload MRI', description: 'Upload brain MRI scans for AI-powered analysis and early detection.', icon: Upload, gradient: 'from-blue-500 to-cyan-500', emoji: '🧠', action: '/upload-mri' },
        { title: 'Cognitive Test', description: 'Take comprehensive cognitive assessments to evaluate brain health.', icon: Brain, gradient: 'from-purple-500 to-pink-500', emoji: '📝', action: '/cognitive-test' },
        { title: 'Dashboard', description: 'Track your cognitive health journey with detailed analytics.', icon: Activity, gradient: 'from-indigo-500 to-violet-500', emoji: '📊', action: '/dashboard' },
        { title: 'View Results', description: 'Access detailed analysis reports and personalized insights.', icon: BarChart3, gradient: 'from-emerald-500 to-teal-500', emoji: '📈', action: '/results' },
    ];

    const floatingIcons = [
        { emoji: '🧠', color: 'from-indigo-400 to-purple-500', duration: 4, delay: 0 },
        { emoji: '🔬', color: 'from-pink-400 to-rose-500', duration: 4.5, delay: 0.5 },
        { emoji: '💡', color: 'from-amber-400 to-orange-500', duration: 5, delay: 1 },
        { emoji: '❤️', color: 'from-red-400 to-pink-500', duration: 4.2, delay: 1.5 },
    ];

    return (
        <div id="home" className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} scrollToSection={scrollToSection} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <HeroSection handleNavigation={handleNavigation} />
                <FloatingIcons icons={floatingIcons} />
                <FeatureCards features={features} handleNavigation={handleNavigation} />
                <AboutSection />
                <StatsSection />
                <CTASection handleNavigation={handleNavigation} />
                <ContactSection />
            </main>

            <Footer />
        </div>
    );
}
