import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { loginWithToken } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await apiPost('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
            showToast('Password reset successful!', 'success');
            
            // Automatically log in the user after reset
            setTimeout(() => {
                loginWithToken(response.data.user, response.data.token);
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            showToast(err.message || 'Error resetting password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
                {!success ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
                            <p className="text-gray-500 mt-2">Almost there! Create a strong password now.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">New Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="password" 
                                            required 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            placeholder="Min. 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="password" 
                                            required 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            placeholder="Repeat new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Set New Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-10"
                    >
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Password Set!</h3>
                        <p className="text-gray-500 mb-8">
                            Your password has been updated. Logging you in automatically...
                        </p>
                        <div className="animate-pulse flex justify-center">
                            <div className="h-1.5 w-32 bg-indigo-200 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-indigo-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
