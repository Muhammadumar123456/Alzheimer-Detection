import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BarChart3, Smile, Frown, AlertTriangle, FileText,
    Brain, Upload, Loader2, AlertCircle, RefreshCw, Home, Activity
} from "lucide-react";
import { apiGet } from "../utils/api";

export default function Results() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cognitiveTests, setCognitiveTests] = useState([]);
    const [mriUploads, setMriUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const immediateResult = location.state || null;

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const [cogRes, mriRes] = await Promise.all([
                    apiGet('/cognitive/my?limit=10&sort=-submittedAt'),
                    apiGet('/upload/my?limit=10&sort=-uploadedAt'),
                ]);
                const tests = cogRes.data?.tests || [];
                setCognitiveTests(tests);
                setMriUploads(mriRes.data?.files || []);
                
                // Route Protection: If direct access without immediate state and NO history
                if (!immediateResult && tests.length === 0) {
                    navigate("/cognitive-test", { replace: true });
                    return;
                }
            } catch (err) {
                console.error('Failed to fetch results:', err);
                setError(err.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [immediateResult, navigate]);

    const latestTest = cognitiveTests[0] || null;
    // mmseScore is now inverted: 30 = no symptoms (healthy), 0 = all symptoms (worst)
    // For old records: mmseScore may be from quiz, still 0-30 scale with higher = better
    const mmseScore = latestTest?.mmseScore ?? null;
    const percentage = mmseScore != null ? Math.round((mmseScore / 30) * 100) : null;

    const precautionsMap = {
        low: [
            "Maintain a balanced diet rich in Mediterranean-style foods (olive oil, fish, vegetables).",
            "Engage in at least 150 minutes of moderate aerobic activity per week.",
            "Continue cognitive stimulation through reading, puzzles, or learning new skills.",
            "Prioritize 7-9 hours of quality sleep to support brain toxin clearance."
        ],
        moderate: [
            "Schedule a baseline clinical evaluation with a neurologist.",
            "Monitor for changes in short-term memory or word-finding difficulties.",
            "Check for underlying factors like Vitamin B12 deficiency or thyroid issues.",
            "Increase social engagement and group activities to maintain neural pathways.",
            "Implement memory aids like digital calendars or organized daily planners."
        ],
        high: [
            "Urgent: Consult a primary care physician or a geriatric specialist.",
            "Request a comprehensive neuropsychological assessment.",
            "Ensure a safe home environment (remove trip hazards, improve lighting).",
            "Discuss potential FDA-approved cognitive medications with a specialist.",
            "Inform family members or trusted friends for supportive monitoring.",
            "Ensure all medications are managed via a pill organizer or caregiver."
        ]
    };

    let riskLevel, riskColor, riskIcon, riskMessage, currentPrecautions;
    if (percentage === null) {
        riskLevel = "No Data"; riskColor = "gray";
        riskIcon = <AlertCircle className="w-16 h-16 text-gray-400" />;
        riskMessage = "Take a cognitive test or upload an MRI scan to see your results.";
        currentPrecautions = [];
    } else if (percentage >= 80) {
        riskLevel = "Low Risk"; riskColor = "green";
        riskIcon = <Smile className="w-16 h-16 text-green-600" />;
        riskMessage = "Your cognitive health appears to be within normal ranges. Continue your healthy routines.";
        currentPrecautions = precautionsMap.low;
    } else if (percentage >= 60) {
        riskLevel = "Moderate Risk"; riskColor = "yellow";
        riskIcon = <AlertTriangle className="w-16 h-16 text-yellow-600" />;
        riskMessage = "Indicators suggest Mild Cognitive Impairment (MCI) risk. Professional monitoring is advised.";
        currentPrecautions = precautionsMap.moderate;
    } else {
        riskLevel = "Higher Risk"; riskColor = "red";
        riskIcon = <Frown className="w-16 h-16 text-red-600" />;
        riskMessage = "Results indicate significant cognitive decline. Immediate clinical consultation is recommended.";
        currentPrecautions = precautionsMap.high;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {/* Immediate Result Banner */}
            {immediateResult?.testType === "cognitive" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-xl rounded-2xl p-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-indigo-100 rounded-full"><BarChart3 className="w-10 h-10 text-indigo-600" /></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cognitive Assessment Submitted</h2>
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                        className={`mx-auto mb-6 p-8 rounded-2xl ${riskColor === "green" ? "bg-green-50 border-2 border-green-200" : riskColor === "yellow" ? "bg-yellow-50 border-2 border-yellow-200" : riskColor === "red" ? "bg-red-50 border-2 border-red-200" : "bg-gray-50 border-2 border-gray-200"}`}>
                        <div className="flex flex-col items-center gap-4">
                            {riskIcon}
                            <h3 className={`text-2xl font-bold ${riskColor === "green" ? "text-green-700" : riskColor === "yellow" ? "text-yellow-700" : riskColor === "red" ? "text-red-700" : "text-gray-700"}`}>{riskLevel}</h3>
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-700 mb-2">Symptoms Reported: <span className="font-bold text-indigo-600">{immediateResult.symptomsReported ?? "—"}</span> / {immediateResult.totalAnswered ?? 30}</p>
                                <p className="text-sm text-gray-500">Cognitive health score: <span className="font-bold text-gray-800">{percentage ?? "—"}%</span></p>
                            </div>
                        </div>
                    </motion.div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Interpretation</h4>
                        <p className="text-gray-700">{riskMessage}</p>
                    </div>
                </motion.div>
            )}

            {/* Cognitive Test History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Brain className="w-6 h-6 text-purple-600" /> Cognitive Test History</h3>
                {cognitiveTests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No cognitive tests taken yet</p>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate("/cognitive-test")} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Take Your First Test</motion.button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cognitiveTests.map((test) => {
                            const score = test.mmseScore ?? 0;
                            return (
                            <div key={test._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                    <div className={`p-2 rounded-lg ${score >= 24 ? "bg-green-100" : score >= 18 ? "bg-yellow-100" : "bg-red-100"}`}>
                                        <Brain className={`w-5 h-5 ${score >= 24 ? "text-green-600" : score >= 18 ? "text-yellow-600" : "text-red-600"}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {test.totalScore != null
                                                ? `Symptoms: ${test.totalScore}/30 · Health: ${score}/30`
                                                : `MMSE: ${score}/30 · MoCA: ${test.mocaScore}/30`
                                            }
                                        </p>
                                        <p className="text-sm text-gray-500">{new Date(test.submittedAt).toLocaleDateString()} at {new Date(test.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-sm ml-12 sm:ml-0">
                                    <span className="text-gray-600">Memory: <span className="font-semibold">{test.memoryScore}%</span></span>
                                    <span className="text-gray-600">Language: <span className="font-semibold">{test.languageScore}%</span></span>
                                    <span className="text-gray-600">Attention: <span className="font-semibold">{test.attentionScore}%</span></span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* MRI Upload History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Upload className="w-6 h-6 text-blue-600" /> MRI Upload History</h3>
                {mriUploads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No MRI scans uploaded yet</p>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate("/upload-mri")} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Upload Your First Scan</motion.button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mriUploads.map((file) => (
                            <div key={file._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100"><Upload className="w-5 h-5 text-blue-600" /></div>
                                    <div>
                                        <p className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-none">{file.fileName}</p>
                                        <p className="text-sm text-gray-500">{new Date(file.uploadedAt).toLocaleDateString()} at {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Uploaded</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                <div className={`p-6 rounded-2xl border mb-6 ${riskColor === 'green' ? 'bg-emerald-50 border-emerald-100' : riskColor === 'yellow' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                    <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${riskColor === 'green' ? 'text-emerald-900' : riskColor === 'yellow' ? 'text-amber-900' : 'text-rose-900'}`}>
                        <Activity className="w-5 h-5" /> Recommended Precautions
                    </h4>
                    <ul className="space-y-3">
                        {currentPrecautions.length > 0 ? currentPrecautions.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${riskColor === 'green' ? 'bg-emerald-500' : riskColor === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                {p}
                            </li>
                        )) : (
                            <p className="text-sm text-slate-500 italic">No precautions to display. Please complete an assessment first.</p>
                        )}
                    </ul>
                </div>
                <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                    <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Important Disclaimer</h4>
                    <p className="text-sm text-amber-800 leading-relaxed">This is an <strong>educational FYP project</strong>. Results are for <strong>demonstration purposes only</strong>. This system is NOT a substitute for professional medical diagnosis.</p>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pb-8">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/dashboard")}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold transition-colors">
                    <Home className="w-5 h-5" /> Dashboard
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/cognitive-test")}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-semibold transition-colors">
                    <RefreshCw className="w-5 h-5" /> Take Another Test
                </motion.button>
            </div>
        </div>
    );
}