import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { apiPost } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function ContactSection() {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiPost('/contact', formData);
            setSubmitted(true);
            showToast('Message sent successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to send message', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (submitted) {
        return (
            <motion.section id="contact" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-16 max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4">Message Received!</h2>
                    <p className="text-slate-500 text-lg leading-relaxed mb-10">
                        Thank you for reaching out. Our team will review your inquiry and get back to you within 24-48 business hours.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)}
                        className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        Send Another Message
                    </button>
                </div>
            </motion.section>
        );
    }

    return (
        <section id="contact" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-slate-900 mb-6 underline decoration-indigo-500 decoration-8 underline-offset-8">
                    Get in Touch
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                    Have questions about the system or need technical support? We're here to help you.
                </motion.p>
            </div>

            <div className="grid lg:grid-cols-5 gap-12 items-start">
                {/* Contact Info Cards */}
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-6">
                    <div className="bg-indigo-600 rounded-[2rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <motion.div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Email Support</p>
                                    <p className="text-lg font-medium">Muhammadumr012@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Phone Inquiry</p>
                                    <p className="text-lg font-medium">+92 3105689027</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-lg font-medium">Islamabad, Pakistan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 md:p-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Your Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Subject</label>
                            <input type="text" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Inquiry about detection"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Message</label>
                            <textarea name="message" required value={formData.message} onChange={handleChange} placeholder="Write your message here..." rows="5"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium resize-none" />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group disabled:bg-indigo-400"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message</>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
