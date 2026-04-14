import React, { useEffect, useState } from 'react';
import { 
    FileText, 
    Brain, 
    Activity, 
    ChevronRight, 
    Calendar,
    User,
    Download,
    ExternalLink,
    Filter,
} from 'lucide-react';
import { apiGet } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';

export default function AdminReports() {
    const { showToast } = useToast();
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('predictions');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await apiGet('/admin/reports');
            setReports(response.data.reports);
        } catch (err) {
            showToast('Failed to load system reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'predictions', label: 'Predictions', icon: Activity, count: reports?.predictions?.length || 0 },
        { id: 'mri', label: 'MRI Scans', icon: Brain, count: reports?.mriUploads?.length || 0 },
        { id: 'cognitive', label: 'Cognitive Tests', icon: FileText, count: reports?.cognitiveTests?.length || 0 },
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
                    <p className="text-gray-500 mt-1">Unified view of all clinical data across the platform.</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-200/50 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white text-indigo-700 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            activeTab === tab.id ? 'bg-indigo-100' : 'bg-gray-200'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* List View */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {activeTab === 'predictions' && reports?.predictions?.map((pred, i) => (
                        <motion.div 
                            key={pred._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 hover:bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                                    pred.prediction === 'AD' ? 'bg-rose-100 text-rose-600 shadow-rose-200/50' : 
                                    pred.prediction === 'LMCI' ? 'bg-orange-100 text-orange-600 shadow-orange-200/50' : 
                                    pred.prediction === 'EMCI' ? 'bg-amber-100 text-amber-600 shadow-amber-200/50' : 
                                    pred.prediction === 'MCI' ? 'bg-yellow-100 text-yellow-600 shadow-yellow-200/50' : 
                                    'bg-emerald-100 text-emerald-600 shadow-emerald-200/50'
                                } shadow-lg`}>
                                    {pred.prediction[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        Patient: {pred.user?.name || 'Unknown Patient'}
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            pred.prediction === 'AD' ? 'bg-rose-100 text-rose-700' : 
                                            pred.prediction === 'LMCI' ? 'bg-orange-100 text-orange-700' : 
                                            pred.prediction === 'EMCI' ? 'bg-amber-100 text-amber-700' : 
                                            pred.prediction === 'MCI' ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {pred.prediction}
                                        </span>
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(pred.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 font-semibold text-gray-900">
                                            <Activity size={14} className="text-indigo-600" /> 
                                            {Math.round(pred.confidence * 100)}% Confidence
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm flex items-center gap-2">
                                    <FileText size={18} /> Full Case
                                </button>
                                <button className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100">
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {activeTab === 'mri' && reports?.mriUploads?.map((mri, i) => (
                        <motion.div 
                            key={mri._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 hover:bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                                    <Brain size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg truncate max-w-xs">{mri.fileName}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1 font-medium text-gray-900"><User size={14} className="text-blue-500" /> {mri.user?.name || 'Unknown User'}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(mri.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                    <Download size={18} />
                                </button>
                                <button className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-100">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {activeTab === 'cognitive' && reports?.cognitiveTests?.map((test, i) => (
                        <motion.div 
                            key={test._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 hover:bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        Test: Cognitive Assessment
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold">
                                            {test.totalScore != null ? `Symptoms: ${test.totalScore}/30` : `MMSE: ${test.mmseScore}/30`}
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1 font-medium text-gray-900"><User size={14} className="text-purple-500" /> {test.user?.name || 'Unknown' }</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(test.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden lg:flex gap-4 mr-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Memory</p>
                                        <p className="text-sm font-bold text-gray-900">{test.memoryScore}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Attention</p>
                                        <p className="text-sm font-bold text-gray-900">{test.attentionScore}%</p>
                                    </div>
                                </div>
                                <button className="p-3 bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-all shadow-md shadow-purple-100">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty states if count is 0 */}
                    {reports?.[activeTab === 'predictions' ? 'predictions' : activeTab === 'mri' ? 'mriUploads' : 'cognitiveTests']?.length === 0 && (
                        <div className="p-20 text-center text-gray-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No {activeTab} reports found in the system yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
