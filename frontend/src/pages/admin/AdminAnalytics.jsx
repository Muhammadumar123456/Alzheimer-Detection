import React, { useEffect, useState } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area,
    Legend
} from 'recharts';
import { 
    Activity, 
    Users, 
    Brain, 
    Target,
    Filter,
    Calendar,
    Download
} from 'lucide-react';
import { apiGet } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalytics() {
    const { showToast } = useToast();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('12m');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await apiGet(`/admin/analytics?range=${dateRange}`);
            setAnalytics(response.data.analytics);
        } catch (err) {
            showToast('Failed to load analytics data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!analytics) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Category,Metric,Value\n";
        
        // Add Summary Stats
        csvContent += `Summary,Average MMSE,${analytics.averageScores?.avgMMSE || 0}\n`;
        csvContent += `Summary,Average Memory,${analytics.averageScores?.avgMemory || 0}%\n`;
        
        // Add Distributions
        analytics.predictionsByType?.forEach(p => {
            csvContent += `Diagnosis,${p.type},${p.count}\n`;
        });
        
        analytics.userRegistrations?.forEach(r => {
            csvContent += `Growth,${r.month},${r.count}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AlzDetect_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Analytics CSV exported successfully', 'success');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Advanced Analytics</h1>
                    <p className="text-gray-500 mt-1">Deep insights into system usage and clinical trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm font-bold py-2 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="3m">Last 3 Months</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="12m">Last 12 Months</option>
                        <option value="all">All Time</option>
                    </select>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Registrations Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-indigo-600" />
                        User Growth (12 Months)
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.userRegistrations}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Predictions Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Brain size={20} className="text-emerald-600" />
                        Diagnosis Classification
                    </h2>
                    <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.predictionsByType}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="type"
                                >
                                    {analytics?.predictionsByType?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Cognitive Score Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-amber-600" />
                        MMSE Score Ranges
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.scoreDistribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis dataKey="range" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Average Cognitive Scores Radar/Comparison */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Target size={20} className="text-rose-600" />
                        Averaged Performance Metrics
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'MMSE', value: analytics?.averageScores?.avgMMSE || 0, max: 30, color: 'indigo' },
                            { label: 'MoCA', value: analytics?.averageScores?.avgMoCA || 0, max: 30, color: 'emerald' },
                            { label: 'Memory', value: analytics?.averageScores?.avgMemory || 0, max: 100, color: 'blue' },
                            { label: 'Language', value: analytics?.averageScores?.avgLanguage || 0, max: 100, color: 'purple' },
                            { label: 'Attention', value: analytics?.averageScores?.avgAttention || 0, max: 100, color: 'rose' },
                        ].map((stat) => (
                            <div key={stat.label} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                                    <span className="text-lg font-black text-gray-900">{Math.round(stat.value)}<span className="text-[10px] text-gray-400 font-normal">/{stat.max}</span></span>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                                        className={`h-full bg-${stat.color}-600 rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
