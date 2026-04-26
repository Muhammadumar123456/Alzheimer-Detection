import React, { useEffect, useState } from 'react';
import { 
    MessageSquare, 
    Calendar, 
    Reply, 
    CheckCircle2, 
    Clock, 
    HelpCircle,
    Send,
    ExternalLink,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { apiGet } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function UserInquiries() {
    const { showToast } = useToast();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await apiGet('/contact/inquiries');
            setInquiries(response.data.inquiries);
        } catch (err) {
            showToast('Failed to load your inquiries', 'error');
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

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Inquiries</h1>
                    <p className="text-gray-500 mt-1">Track the status of your messages and view admin replies.</p>
                </div>
                <Link 
                    to="/#contact" 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 w-fit"
                >
                    <Send size={18} /> New Inquiry
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* List View */}
                <div className={`${selectedInquiry ? 'md:col-span-5 hidden md:block' : 'md:col-span-12'} space-y-4`}>
                    {inquiries.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <HelpCircle size={40} className="text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No inquiries yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">You haven't sent any messages to our team yet. Use the contact form on the home page to get started.</p>
                            <Link to="/#contact" className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1">
                                Go to Contact Form <ExternalLink size={14} />
                            </Link>
                        </div>
                    ) : (
                        inquiries.map((inq, i) => (
                            <motion.div
                                key={inq._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedInquiry(inq)}
                                className={`p-6 bg-white rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl ${
                                    selectedInquiry?._id === inq._id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                            inq.status === 'replied' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {inq.status === 'replied' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{inq.subject}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <Calendar size={12} /> {new Date(inq.createdAt).toLocaleDateString()}
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    inq.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inq.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300" size={20} />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Detail View */}
                {selectedInquiry && (
                    <div className="md:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden sticky top-8"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <button 
                                        onClick={() => setSelectedInquiry(null)}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Back to List
                                    </button>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                                        selectedInquiry.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {selectedInquiry.status}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedInquiry.subject}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">ME</div>
                                        <span>Sent on {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm">
                                        <MessageSquare size={14} className="text-indigo-400" />
                                    </div>
                                    <p className="text-gray-700 leading-relaxed italic">"{selectedInquiry.message}"</p>
                                </div>

                                {selectedInquiry.status === 'replied' ? (
                                    <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                                                <Reply size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Admin Response</p>
                                                <p className="text-[10px] text-gray-400 italic">{new Date(selectedInquiry.repliedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100 relative">
                                            <div className="absolute -top-2 left-6 w-4 h-4 bg-indigo-600 rotate-45 transform"></div>
                                            <p className="text-sm font-medium leading-relaxed">
                                                {selectedInquiry.replyMessage}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 text-emerald-700 text-xs font-medium">
                                            <CheckCircle2 size={16} />
                                            This inquiry has been resolved.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-6 border-t border-dashed border-gray-200">
                                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                                            <Clock className="text-amber-500 mt-1" size={20} />
                                            <div>
                                                <p className="text-sm font-bold text-amber-900 mb-1">Awaiting Response</p>
                                                <p className="text-xs text-amber-700 leading-relaxed">
                                                    Our medical and support team is reviewing your inquiry. You will receive a notification and see the reply here once it's processed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
