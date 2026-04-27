import React, { useEffect, useState } from 'react';
import { 
    MessageSquare, 
    User, 
    Mail, 
    Calendar, 
    Reply, 
    CheckCircle2, 
    Clock, 
    Search,
    ChevronRight,
    Send,
    X,
    Filter
} from 'lucide-react';
import { apiGet, apiPatch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInquiries() {
    const { showToast } = useToast();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await apiGet('/contact/inquiries');
            setInquiries(response.data.inquiries);
        } catch (err) {
            showToast('Failed to load inquiries', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setIsSubmitting(true);
        try {
            await apiPatch(`/contact/inquiries/${selectedInquiry._id}/reply`, { replyMessage });
            showToast('Reply sent successfully', 'success');
            setReplyMessage('');
            setSelectedInquiry(null);
            fetchInquiries(); // Refresh list
        } catch (err) {
            showToast(err.message || 'Failed to send reply', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredInquiries = inquiries.filter(inq => {
        if (filterStatus === 'all') return true;
        return inq.status === filterStatus;
    });

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
                    <h1 className="text-3xl font-bold text-gray-900">User Inquiries</h1>
                    <p className="text-gray-500 mt-1">Manage and respond to user messages and support requests.</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                    {['all', 'pending', 'replied'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                filterStatus === status 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredInquiries.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-medium">No inquiries found matching your filter.</p>
                        </div>
                    ) : (
                        filteredInquiries.map((inq, i) => (
                            <motion.div
                                key={inq._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedInquiry(inq)}
                                className={`p-6 bg-white rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                                    selectedInquiry?._id === inq._id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-gray-100'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                            inq.status === 'replied' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {inq.status === 'replied' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900">{inq.subject}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                    inq.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {inq.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{inq.message}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                                                <span className="flex items-center gap-1"><User size={12} /> {inq.name}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(inq.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300" size={20} />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Detail/Reply View */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedInquiry ? (
                            <motion.div
                                key={selectedInquiry._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden sticky top-8"
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                                        <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                            <X size={20} className="text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">From</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {selectedInquiry.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{selectedInquiry.name}</p>
                                                    <p className="text-xs text-gray-500">{selectedInquiry.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                                            <p className="text-sm font-bold text-gray-900">{selectedInquiry.subject}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message</p>
                                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50 text-sm text-gray-700 leading-relaxed italic">
                                                "{selectedInquiry.message}"
                                            </div>
                                        </div>

                                        {selectedInquiry.status === 'replied' ? (
                                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <Reply size={12} /> Your Response
                                                </p>
                                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-sm text-emerald-900 font-medium leading-relaxed">
                                                    {selectedInquiry.replyMessage}
                                                </div>
                                                <p className="text-[10px] text-emerald-400 text-right italic">
                                                    Replied on {new Date(selectedInquiry.repliedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleReply} className="space-y-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    <Reply size={12} /> Send Response
                                                </p>
                                                <textarea
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                    required
                                                    placeholder="Type your reply to the user..."
                                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm min-h-[120px] resize-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting || !replyMessage.trim()}
                                                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
                                                >
                                                    {isSubmitting ? <Clock className="animate-spin" size={18} /> : <><Send size={18} /> Send Reply</>}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center h-[400px]">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <MessageSquare className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-gray-900 font-bold mb-1">Select an inquiry</h3>
                                <p className="text-gray-400 text-sm">Choose a message from the list to view details and send a reply.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
