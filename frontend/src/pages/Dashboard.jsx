import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Upload, Brain, BarChart3, TrendingUp,
    Activity, Clock, CheckCircle, ArrowRight, AlertCircle, Loader2, Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../utils/api";

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await apiGet('/report/my');
                setReport(response.data.report);
            } catch (err) {
                console.error('Failed to fetch report:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    const userName = user?.name || user?.email?.split('@')[0] || "User";

    // Prediction class labels for display
    const predictionLabels = { AD: "Alzheimer's", CN: "Normal", EMCI: "Early MCI", LMCI: "Late MCI" };

    const latestPred = report?.summary?.latestPrediction;
    const stats = report ? [
        { label: "Tests Completed", value: String(report.summary.totalCognitiveTests), icon: CheckCircle, color: "green" },
        { label: "MRI Scans", value: String(report.summary.totalMRIScans), icon: Upload, color: "blue" },
        { label: "AI Predictions", value: String(report.summary.totalPredictions), icon: TrendingUp, color: "purple" },
        { label: "Latest Diagnosis", value: latestPred ? predictionLabels[latestPred.prediction] || latestPred.prediction : "N/A", icon: Clock, color: "orange" }
    ] : [
        { label: "Tests Completed", value: "0", icon: CheckCircle, color: "green" },
        { label: "MRI Scans", value: "0", icon: Upload, color: "blue" },
        { label: "AI Predictions", value: "0", icon: TrendingUp, color: "purple" },
        { label: "Latest Diagnosis", value: "N/A", icon: Clock, color: "orange" }
    ];

    const quickActions = [
        { title: "Upload MRI Scan", description: "Upload brain MRI images for AI analysis", icon: Upload, gradient: "from-blue-500 to-blue-600", path: "/upload-mri" },
        { title: "Cognitive Test", description: "Take comprehensive cognitive assessment", icon: Brain, gradient: "from-purple-500 to-purple-600", path: "/cognitive-test" },
        { title: "View Results", description: "Check your AI diagnostic results", icon: BarChart3, gradient: "from-indigo-500 to-indigo-600", path: "/results" }
    ];

    const recentActivity = [];
    if (report) {
        // Add AI predictions to activity feed
        report.predictions?.slice(0, 3).forEach((pred) => {
            const pct = Math.round((pred.confidence ?? 0) * 100);
            recentActivity.push({
                id: pred._id,
                type: "AI Prediction",
                date: new Date(pred.createdAt).toLocaleDateString(),
                time: new Date(pred.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                result: predictionLabels[pred.prediction] || pred.prediction,
                score: `${pct}% confidence`,
                status: pred.prediction === "CN" ? "success" : "warning"
            });
        });
        report.cognitiveTests?.slice(0, 3).forEach((test) => {
            recentActivity.push({
                id: test._id,
                type: "Cognitive Test",
                date: new Date(test.submittedAt).toLocaleDateString(),
                time: new Date(test.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                result: "Completed",
                score: test.totalScore != null ? `Symptoms: ${test.totalScore}/30` : `MMSE: ${test.mmseScore}/30`,
                status: test.mmseScore >= 24 ? "success" : "warning"
            });
        });
        report.mriScans?.slice(0, 3).forEach((scan) => {
            recentActivity.push({
                id: scan._id,
                type: "MRI Upload",
                date: new Date(scan.uploadedAt).toLocaleDateString(),
                time: new Date(scan.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                result: "Uploaded",
                score: scan.fileName,
                status: "success"
            });
        });
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Error Banner */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {/* Welcome Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                    Welcome back, {userName}! 👋
                </h2>
                <p className="text-gray-600 text-lg">Track your cognitive health journey and access your assessments</p>
            </motion.div>

            {/* Statistics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div key={index} whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${stat.color === "green" ? "bg-green-100" : stat.color === "blue" ? "bg-blue-100" : stat.color === "purple" ? "bg-purple-100" : "bg-orange-100"}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color === "green" ? "text-green-600" : stat.color === "blue" ? "text-blue-600" : stat.color === "purple" ? "text-purple-600" : "text-orange-600"}`} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Access Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-600" /> Quick Access
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <motion.div key={index} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(action.path)} className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group">
                            <div className={`h-2 bg-gradient-to-r ${action.gradient}`} />
                            <div className="p-6">
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} mb-4`}>
                                    <action.icon className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-800 mb-2">{action.title}</h4>
                                <p className="text-gray-600 mb-4">{action.description}</p>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-600" /> Recent Activity
                </h3>
                {recentActivity.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No activity yet</p>
                        <p className="text-sm mt-1">Take a cognitive test or upload an MRI scan to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.slice(0, 5).map((activity) => (
                            <motion.div key={activity.id} whileHover={{ x: 5 }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                                    <div className={`p-2 rounded-lg ${activity.status === "success" ? "bg-green-100" : "bg-yellow-100"}`}>
                                        {activity.type === "AI Prediction" ? (
                                            <TrendingUp className={`w-5 h-5 ${activity.status === "success" ? "text-green-600" : "text-yellow-600"}`} />
                                        ) : activity.type === "Cognitive Test" ? (
                                            <Brain className={`w-5 h-5 ${activity.status === "success" ? "text-green-600" : "text-yellow-600"}`} />
                                        ) : (
                                            <Upload className={`w-5 h-5 ${activity.status === "success" ? "text-green-600" : "text-yellow-600"}`} />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{activity.type}</h4>
                                        <p className="text-sm text-gray-600">{activity.date} at {activity.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-14 sm:ml-0">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{activity.result}</p>
                                        <p className={`font-semibold ${activity.status === "success" ? "text-green-600" : "text-yellow-600"}`}>{activity.score}</p>
                                    </div>
                                    <CheckCircle className={`w-5 h-5 ${activity.status === "success" ? "text-green-500" : "text-yellow-500"}`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/results")} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                    View All Results
                </motion.button>
            </motion.div>

            {/* Info Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
                <p className="text-blue-800">
                    <span className="font-semibold">💡 Tip:</span> Regular cognitive assessments help track your brain health over time. Consider taking a test every few weeks for better insights.
                </p>
            </motion.div>
        </div>
    );
}
