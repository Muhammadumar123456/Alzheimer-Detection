import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Upload,
    Brain,
    BarChart3,
    Calendar,
    TrendingUp,
    Activity,
    Clock,
    CheckCircle,
    ArrowRight,
    Menu
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
    const navigate = useNavigate();
    const userName = "Guest User"; // Mock user name
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mock statistics
    const stats = [
        { label: "Tests Completed", value: "3", icon: CheckCircle, color: "green" },
        { label: "MRI Scans", value: "1", icon: Upload, color: "blue" },
        { label: "Average Score", value: "82%", icon: TrendingUp, color: "purple" },
        { label: "Last Activity", value: "Today", icon: Clock, color: "orange" }
    ];

    // Quick access cards
    const quickActions = [
        {
            title: "Upload MRI Scan",
            description: "Upload brain MRI images for AI analysis",
            icon: Upload,
            gradient: "from-blue-500 to-blue-600",
            path: "/upload-mri"
        },
        {
            title: "Cognitive Test",
            description: "Take comprehensive cognitive assessment",
            icon: Brain,
            gradient: "from-purple-500 to-purple-600",
            path: "/cognitive-test"
        },
        {
            title: "View Results",
            description: "Check your test results and reports",
            icon: BarChart3,
            gradient: "from-indigo-500 to-indigo-600",
            path: "/results"
        }
    ];

    // Mock recent activity
    const recentActivity = [
        {
            id: 1,
            type: "Cognitive Test",
            date: "2026-01-05",
            time: "18:30",
            result: "Completed",
            score: "85%",
            status: "success"
        },
        {
            id: 2,
            type: "MRI Upload",
            date: "2026-01-04",
            time: "14:15",
            result: "Analyzed",
            score: "Low Risk",
            status: "success"
        },
        {
            id: 3,
            type: "Cognitive Test",
            date: "2026-01-03",
            time: "10:20",
            result: "Completed",
            score: "78%",
            status: "warning"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Sidebar (same as Home screen) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <Sidebar
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        handleLogout={() => { }}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="w-full bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Menu button (three lines) - same behavior as on Home screen */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSidebarOpen((prev) => !prev)}
                            className="p-3 rounded-md bg-indigo-300 hover:bg-indigo-400 text-white transition-colors shadow-sm"
                        >
                            <Menu className="w-6 h-6" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium hidden sm:inline">Home</span>
                        </motion.button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                        Welcome back, {userName}! 👋
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Track your cognitive health journey and access your assessments
                    </p>
                </motion.div>

                {/* Statistics Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-md p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${stat.color === "green" ? "bg-green-100" :
                                    stat.color === "blue" ? "bg-blue-100" :
                                        stat.color === "purple" ? "bg-purple-100" :
                                            "bg-orange-100"
                                    }`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color === "green" ? "text-green-600" :
                                        stat.color === "blue" ? "text-blue-600" :
                                            stat.color === "purple" ? "text-purple-600" :
                                                "text-orange-600"
                                        }`} />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Access Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-600" />
                        Quick Access
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(action.path)}
                                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                            >
                                <div className={`h-2 bg-gradient-to-r ${action.gradient}`} />
                                <div className="p-6">
                                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} mb-4`}>
                                        <action.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                                        {action.title}
                                    </h4>
                                    <p className="text-gray-600 mb-4">
                                        {action.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all">
                                        <span>Get Started</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        Recent Activity
                    </h3>

                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <motion.div
                                key={activity.id}
                                whileHover={{ x: 5 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                                    <div className={`p-2 rounded-lg ${activity.status === "success" ? "bg-green-100" : "bg-yellow-100"
                                        }`}>
                                        {activity.type === "Cognitive Test" ? (
                                            <Brain className={`w-5 h-5 ${activity.status === "success" ? "text-green-600" : "text-yellow-600"
                                                }`} />
                                        ) : (
                                            <Upload className={`w-5 h-5 ${activity.status === "success" ? "text-green-600" : "text-yellow-600"
                                                }`} />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{activity.type}</h4>
                                        <p className="text-sm text-gray-600">
                                            {activity.date} at {activity.time}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-14 sm:ml-0">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{activity.result}</p>
                                        <p className={`font-semibold ${activity.status === "success" ? "text-green-600" : "text-yellow-600"
                                            }`}>
                                            {activity.score}
                                        </p>
                                    </div>
                                    <CheckCircle className={`w-5 h-5 ${activity.status === "success" ? "text-green-500" : "text-yellow-500"
                                        }`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* View All Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/results")}
                        className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        View All Results
                    </motion.button>
                </motion.div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6"
                >
                    <p className="text-blue-800">
                        <span className="font-semibold">💡 Tip:</span> Regular cognitive assessments help track your brain health over time.
                        Consider taking a test every few weeks for better insights.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
