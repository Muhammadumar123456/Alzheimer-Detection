import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, Mail, Hash, CheckCircle } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiPost } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { loginWithToken } = useAuth();
    
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const checkPassword = (val) => {
        setPassword(val);
        setPasswordRequirements({
            length: val.length >= 8,
            uppercase: /[A-Z]/.test(val),
            lowercase: /[a-z]/.test(val),
            number: /[0-9]/.test(val),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`]/.test(val)
        });
    };

    const requirements = [
        { label: '8+ Characters', met: passwordRequirements.length },
        { label: 'Uppercase Letter', met: passwordRequirements.uppercase },
        { label: 'Lowercase Letter', met: passwordRequirements.lowercase },
        { label: 'Number', met: passwordRequirements.number },
        { label: 'Special Character', met: passwordRequirements.special },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (otp.length !== 6) {
            showToast('Please enter a valid 6-digit code', 'error');
            return;
        }

        if (password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await apiPost('/auth/reset-password', { 
                email, 
                otp, 
                newPassword: password 
            });
            
            setSuccess(true);
            showToast('Password reset successful!', 'success');
            
            // Automatically log in the user after reset
            setTimeout(() => {
                loginWithToken(response.data.user, response.data.token);
                if (response.data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }, 2500);
        } catch (err) {
            showToast(err.message || 'Error resetting password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
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
                            <h1 className="text-3xl font-bold text-gray-900">Verify Identity</h1>
                            <p className="text-gray-500 mt-2">Enter the code sent to your email to reset your password.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="email" 
                                        required 
                                        readOnly={!!searchParams.get('email')}
                                        className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${!!searchParams.get('email') ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Verification Code</label>
                                <div className="relative">
                                    <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        required 
                                        maxLength={6}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-mono tracking-widest text-lg"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>

                            <hr className="border-gray-100 my-2" />

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">New Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required 
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => checkPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                
                                {/* Requirement Checklist */}
                                {password.length > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                                        {requirements.map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                                    {req.met && <CheckCircle size={10} className="text-white" />}
                                                </div>
                                                <span className={`text-[10px] font-bold ${req.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm New Password</label>
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

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-10 text-center"
                    >
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Success!</h3>
                        <p className="text-gray-500 mb-8">
                            Your password has been updated successfully. Redirecting you to the dashboard...
                        </p>
                        <div className="animate-pulse flex justify-center">
                            <div className="h-1.5 w-32 bg-indigo-200 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-indigo-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.5 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
                
                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
