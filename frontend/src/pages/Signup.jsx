import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, Brain, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { showToast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSignup(e) {
        e.preventDefault();
        setError("");

        // Validate name (letters and spaces only)
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            setError("Name must contain only letters and spaces (no numbers or special characters).");
            return;
        }

        // Validate email domain
        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'riphah.edu.pk', 'gov.pk', 'edu.pk', 'edu', 'ac.uk'];
        const emailParts = email.split('@');
        if (emailParts.length !== 2) {
            setError("Please enter a valid email address.");
            return;
        }
        const domain = emailParts[1].toLowerCase();
        const isValidDomain = allowedDomains.some(d => domain === d || domain.endsWith('.' + d));
        if (!isValidDomain) {
            setError("Please use a proper mailing address (e.g., @gmail.com) or an institutional email.");
            return;
        }

        if (!agreedTerms) {
            setError("Please agree to the Terms & Conditions");
            return;
        }
        setLoading(true);
        try {
            await signup(name, email, password);
            showToast("Account created successfully! Welcome!", "success");
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Failed to sign up. Please try again.");
        } finally {
            setLoading(false);
        }
    }

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

                {/* Left Illustration: Premium Brain Graphic */}
                <motion.div className="md:w-1/2 w-full flex flex-col items-center justify-center bg-slate-900 p-12 relative overflow-hidden"
                    initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                    
                    {/* Animated background glows */}
                    <motion.div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20" animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 8, repeat: Infinity }} />
                    <motion.div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20" animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
                    
                    <motion.div 
                        className="relative z-10 mb-8"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="w-48 h-48 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 backdrop-blur-sm">
                            <Brain className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                        </div>
                        
                        {/* Orbiting data points */}
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 bg-indigo-400 rounded-full"
                                animate={{
                                    rotate: 360,
                                    x: 100 * Math.cos((i * 90 * Math.PI) / 180),
                                    y: 100 * Math.sin((i * 90 * Math.PI) / 180),
                                }}
                                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                            />
                        ))}
                    </motion.div>

                    <div className="text-center relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Advanced Neuro-Diagnostics</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                            Join thousands of patients benefiting from early AI-powered Alzheimer's detection.
                        </p>
                    </div>

                    <div className="mt-12 flex gap-4 relative z-10">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle size={12} className="text-indigo-500" /> Trusted by 500+ clinics
                        </p>
                    </div>
                </motion.div>

                {/* Right Form */}
                <div className="md:w-1/2 w-full p-10 flex flex-col justify-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Get Started</h2>
                        <p className="text-slate-500 mb-8 font-medium">Create your secure medical profile</p>
                    </motion.div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm" />
                                </div>
                            </motion.div>

                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm" />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => checkPassword(e.target.value)} placeholder="••••••••" required
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            
                            {/* Requirement Checklist */}
                            {password.length > 0 && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                                    {requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                {req.met && <CheckCircle size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-[10px] font-bold ${req.met ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Terms Checkbox */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="flex items-center gap-3 py-2">
                            <input type="checkbox" id="terms" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
                                className="w-5 h-5 text-indigo-600 border-slate-200 rounded-lg focus:ring-indigo-500 bg-slate-50" />
                            <label htmlFor="terms" className="text-xs text-slate-500 font-medium">
                                I accept the <Link to="/terms" className="text-indigo-600 font-bold hover:underline">User Agreement</Link> & Privacy Policy
                            </label>
                        </motion.div>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}

                        <motion.button type="submit" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
                            whileHover={!loading ? { scale: 1.03, boxShadow: "0 15px 35px rgba(99, 102, 241, 0.4)" } : {}}
                            whileTap={!loading ? { scale: 0.97 } : {}}
                            disabled={loading}
                            className={`w-full py-3 mt-2 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-semibold rounded-xl shadow-md transition relative overflow-hidden`}>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <><motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> Creating account...</>
                                ) : (<>Create Account <UserPlus size={18} /></>)}
                            </span>
                        </motion.button>
                    </form>

                    <motion.p className="text-center text-gray-500 text-sm mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-600 hover:underline font-medium">Log In</Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
