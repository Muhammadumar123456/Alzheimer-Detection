import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiPost } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiPost('/auth/forgot-password', { email });
            setSubmitted(true);
            showToast('Recovery email process initiated', 'success');
        } catch (err) {
            showToast(err.message || 'Error processing request', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 mt-2">Enter your email to receive a 6-digit verification code.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Send Recovery Code'}
                        </button>
                    </form>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                        <p className="text-gray-500 mb-8">
                            If an account exists for <span className="font-semibold text-gray-900">{email}</span>, 
                            you'll receive a 6-digit verification code shortly.
                        </p>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 mb-8">
                            <strong>Note:</strong> Check your spam folder if you don't see it. Since we're in dev mode, check the server console for the 6-digit code.
                        </div>
                        <Link 
                            to={`/reset-password?email=${encodeURIComponent(email)}`}
                            className="block w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Enter Verification Code
                        </Link>
                    </motion.div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <Link to="/login" className="flex items-center justify-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

const Brain = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9l-.707.707M12 21v-1m6.364-1.636l-.707-.707M12 7a5 5 0 110 10 5 5 0 010-10z" />
    </svg>
);
