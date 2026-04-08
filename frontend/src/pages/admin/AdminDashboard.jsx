import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    FileText, 
    Brain, 
    TrendingUp, 
    Clock, 
    AlertTriangle,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { apiGet } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function AdminDashboard() {
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiGet('/admin/stats');
                setStats(response.data.stats);
            } catch (err) {
                showToast('Failed to load dashboard stats', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const cards = [
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'indigo' },
        { title: 'MRI Scans', value: stats?.totalMRIs || 0, icon: Brain, color: 'blue' },
        { title: 'Cognitive Tests', value: stats?.totalCognitiveTests || 0, icon: FileText, color: 'purple' },
        { title: 'Total Predictions', value: stats?.totalPredictions || 0, icon: Activity, color: 'emerald' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 mt-2">Overview of the Alzheimer Detection System performance and activity.</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6"
                    >
                        <div className={`p-4 bg-${card.color}-100 text-${card.color}-600 rounded-2xl`}>
                            <card.icon size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-600" />
                            Recent Registrations
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats?.recentUsers?.map((user) => (
                            <div key={user._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Predictions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-600" />
                            Latest AI Analysis
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats?.recentPredictions?.map((pred) => (
                            <div key={pred._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        pred.prediction === 'AD' ? 'bg-rose-100 text-rose-600' : 
                                        pred.prediction === 'MCI' ? 'bg-amber-100 text-amber-600' : 
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        <Brain size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{pred.prediction}</p>
                                        <p className="text-xs text-gray-500">{pred.user?.name || 'Anonymous'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{Math.round(pred.confidence * 100)}% Match</p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(pred.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
