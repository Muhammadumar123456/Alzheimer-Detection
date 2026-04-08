import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Brain } from 'lucide-react';

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="w-full bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" /><span className="font-medium">Back</span>
                    </motion.button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Terms & Conditions</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 space-y-8">
                    <div className="text-center">
                        <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-4"><FileText className="w-10 h-10 text-indigo-600" /></div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Terms & Conditions</h2>
                        <p className="text-gray-500">Last updated: April 2026</p>
                    </div>

                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-600" /> 1. Educational Purpose</h3>
                            <p>AlzDetect is a Final Year Project (FYP) developed for academic and educational purposes only. This system is <strong>not a medical device</strong> and should not be used as a substitute for professional medical advice, diagnosis, or treatment.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-600" /> 2. No Medical Claims</h3>
                            <p>The cognitive assessments and MRI analysis provided by this platform are for <strong>demonstration purposes only</strong>. Results should not be interpreted as medical diagnoses. Always consult qualified healthcare professionals for any health-related concerns.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">3. Data Usage</h3>
                            <p>Data submitted through this platform (including MRI images and test results) is stored securely and used solely for demonstration of the system's functionality. We do not share, sell, or distribute user data to third parties.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">4. User Accounts</h3>
                            <p>Users are responsible for maintaining the confidentiality of their login credentials. You agree to provide accurate information when creating an account.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">5. Uploaded Content</h3>
                            <p>Users may upload MRI scan images for analysis. By uploading, you confirm that you have the right to share these images and understand they will be stored on our servers for processing purposes.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">6. Limitation of Liability</h3>
                            <p>The development team and institution are not liable for any decisions made based on the output of this system. This includes but is not limited to medical, health, or lifestyle decisions.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">7. Changes to Terms</h3>
                            <p>These terms may be updated at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
                        </section>
                    </div>

                    <div className="pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">By using AlzDetect, you acknowledge that you have read and agree to these terms.</p>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(-1)}
                            className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-colors">
                            I Understand
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
