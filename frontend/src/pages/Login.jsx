import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Brain, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithToken } = useAuth();
    const { showToast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle OAuth Callback / Redirect logic
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userDataStr = params.get('user');
        const oauthError = params.get('error');

        if (token && userDataStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                loginWithToken(userData, token);
                showToast("Successfully logged in with Google!", "success");
                navigate("/dashboard");
            } catch (err) {
                showToast("Failed to process Google login", "error");
            }
        } else if (oauthError) {
            setError(decodeURIComponent(oauthError));
            showToast("Google authentication failed", "error");
        }
    }, [location, loginWithToken, navigate, showToast]);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            showToast("Welcome back!", "success");
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 
        window.location.href = `${backendBaseUrl}/api/auth/google`;
    };

    const particles = [...Array(12)].map((_, i) => ({
        id: i, size: Math.random() * 10 + 5, left: `${Math.random() * 100}%`, duration: Math.random() * 15 + 10
    }));

    return (
        <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6 overflow-hidden relative">
            {particles.map((p) => (
                <motion.div key={p.id} className="absolute bg-indigo-200 rounded-full opacity-20"
                    style={{ width: p.size, height: p.size, left: p.left, top: '-10%' }}
                    animate={{ y: ['0vh', '110vh'], x: [0, Math.random() * 80 - 40], opacity: [0, 0.4, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: Math.random() * 5 }} />
            ))}

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                className="flex flex-col md:flex-row bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden max-w-5xl w-full mx-auto relative z-10 border border-white/20">

                {/* Left Illustration */}
                <motion.div className="md:w-1/2 w-full flex flex-col items-center justify-center bg-slate-900 p-12 relative overflow-hidden"
                    initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                    
                    <motion.div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20" animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 8, repeat: Infinity }} />
                    <motion.div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20" animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
                    
                    <motion.div className="relative z-10 mb-8" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        <div className="w-48 h-48 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 backdrop-blur-sm">
                            <Brain className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                        </div>
                    </motion.div>

                    <div className="text-center relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Secure Intelligence</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                            Access your diagnostic reports and cognitive analysis securely.
                        </p>
                    </div>
                </motion.div>

                {/* Right Form */}
                <div className="md:w-1/2 w-full p-10 flex flex-col justify-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500 mb-8 font-medium">Log in to your account</p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 text-left">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm" />
                            </div>
                        </motion.div>

                        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                <Link to="/forgot-password" size={18} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}

                        <motion.button type="submit" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                            whileHover={!loading ? { scale: 1.02, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.2)" } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            disabled={loading}
                            className={`w-full py-3.5 mt-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2`}>
                            {loading ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <><LogIn size={20} /> Sign In</>}
                        </motion.button>
                    </form>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-slate-200" /><span className="mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">or</span><hr className="flex-grow border-slate-200" />
                    </div>

                    <motion.button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </motion.button>

                    <motion.p className="text-center text-slate-500 text-sm mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-bold">Sign Up Free</Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
