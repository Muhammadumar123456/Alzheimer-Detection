/**
 * =============================================================================
 * RESULTS PAGE — ML-INTEGRATED DIAGNOSTIC DISPLAY
 * =============================================================================
 * Displays AI-powered Alzheimer prediction results alongside cognitive scores.
 *
 * Data sources (priority order):
 *   1. Navigation state (immediate after submission)
 *   2. /results/my API (persistent, supports refresh)
 *   3. Cognitive-only fallback (when no MRI / no prediction)
 *
 * Sections:
 *   • AI Diagnosis Card (prediction + confidence)
 *   • Confidence Meter  (radial gauge)
 *   • Probability Chart  (4-class bar chart)
 *   • Cognitive Scores   (memory, language, attention)
 *   • Recommendations    (mapped from ML class)
 *   • History            (past results with ML data)
 * =============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BarChart3, Brain, Upload, Loader2, AlertCircle, RefreshCw, Home,
    Activity, FileText, AlertTriangle, Cpu, Clock, Zap
} from "lucide-react";
import { apiGet } from "../utils/api";
import { DiagnosisCard, ConfidenceMeter, ProbabilityChart, CLASS_META } from "../components/results";

// ─── Recommendation presets mapped to ML prediction classes ─────────────────
const RECOMMENDATIONS = {
    CN: {
        title: "Healthy Lifestyle Maintenance",
        items: [
            "Maintain a balanced Mediterranean-style diet (olive oil, fish, vegetables).",
            "Engage in at least 150 minutes of moderate aerobic activity per week.",
            "Continue cognitive stimulation through reading, puzzles, and learning.",
            "Prioritize 7–9 hours of quality sleep for brain toxin clearance.",
        ],
    },
    EMCI: {
        title: "Early Monitoring Recommended",
        items: [
            "Schedule a baseline clinical evaluation with a neurologist.",
            "Monitor for changes in short-term memory or word-finding difficulties.",
            "Check for underlying factors: Vitamin B12 deficiency, thyroid issues.",
            "Increase social engagement and group activities for neural stimulation.",
            "Implement memory aids like digital calendars or organized planners.",
        ],
    },
    LMCI: {
        title: "Clinical Follow-Up Advised",
        items: [
            "Consult a neurologist or geriatric specialist for a detailed evaluation.",
            "Request a comprehensive neuropsychological assessment.",
            "Establish a daily routine to help manage cognitive challenges.",
            "Discuss cognitive support strategies with a healthcare provider.",
            "Inform family members for supportive monitoring.",
        ],
    },
    AD: {
        title: "Immediate Specialist Consultation",
        items: [
            "Urgent: Consult a primary care physician or geriatric specialist.",
            "Request a comprehensive neuropsychological assessment.",
            "Ensure a safe home environment (remove trip hazards, improve lighting).",
            "Discuss FDA-approved cognitive medications with a specialist.",
            "Ensure all medications are managed via a pill organizer or caregiver.",
            "Inform family members or trusted friends for care coordination.",
        ],
    },
};

// ─── Cognitive-only fallback risk tiers ─────────────────────────────────────
function getCognitiveRisk(percentage) {
    if (percentage >= 80) return { level: "Low Risk", color: "emerald" };
    if (percentage >= 60) return { level: "Moderate Risk", color: "amber" };
    return { level: "Higher Risk", color: "rose" };
}

// =============================================================================
// COMPONENT
// =============================================================================
export default function Results() {
    const navigate = useNavigate();
    const location = useLocation();

    const immediateState = location.state || null;

    // ── State ────────────────────────────────────────────────────────────
    const [mlResults, setMlResults] = useState([]);
    const [cognitiveTests, setCognitiveTests] = useState([]);
    const [mriUploads, setMriUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── Data Fetching ────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            const [resultsRes, cogRes, mriRes] = await Promise.all([
                apiGet("/results/my?limit=10&sort=-createdAt"),
                apiGet("/cognitive/my?limit=10&sort=-submittedAt"),
                apiGet("/upload/my?limit=10&sort=-uploadedAt"),
            ]);

            console.log("[Results] API data loaded:", {
                results: resultsRes.data?.results?.length ?? 0,
                cognitive: cogRes.data?.tests?.length ?? 0,
                mri: mriRes.data?.files?.length ?? 0,
            });

            setMlResults(resultsRes.data?.results || []);
            setCognitiveTests(cogRes.data?.tests || []);
            setMriUploads(mriRes.data?.files || []);

            // Route protection: no data at all and no immediate state
            const tests = cogRes.data?.tests || [];
            if (!immediateState && tests.length === 0) {
                navigate("/cognitive-test", { replace: true });
                return;
            }
        } catch (err) {
            console.error("[Results] Failed to fetch data:", err);
            setError(err.message || "Failed to load results");
        } finally {
            setLoading(false);
        }
    }, [immediateState, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Derived ML prediction (prefer API data, fallback to nav state) ──
    const activePrediction = useMemo(() => {
        // 1. Try to match from API results by cognitiveTestId
        if (immediateState?.cognitiveTestId && mlResults.length > 0) {
            const match = mlResults.find(
                (r) =>
                    (r.cognitiveTest?._id || r.cognitiveTest) === immediateState.cognitiveTestId
            );
            if (match) return match;
        }

        // 2. Navigation state prediction (from auto-predict)
        if (immediateState?.prediction) {
            return immediateState.prediction;
        }

        // 3. Latest result from API
        if (mlResults.length > 0) {
            return mlResults[0];
        }

        return null;
    }, [immediateState, mlResults]);

    // ── Cognitive scores ────────────────────────────────────────────────
    const latestTest = cognitiveTests[0] || null;
    const mmseScore = latestTest?.mmseScore ?? null;
    const percentage = mmseScore != null ? Math.round((mmseScore / 30) * 100) : null;
    const cogRisk = percentage != null ? getCognitiveRisk(percentage) : null;

    // ── Active recommendation set ───────────────────────────────────────
    const activeRecommendations = useMemo(() => {
        if (activePrediction?.prediction) {
            return RECOMMENDATIONS[activePrediction.prediction] || RECOMMENDATIONS.CN;
        }
        // Fallback to cognitive-only risk tier
        if (percentage !== null) {
            if (percentage >= 80) return RECOMMENDATIONS.CN;
            if (percentage >= 60) return RECOMMENDATIONS.EMCI;
            return RECOMMENDATIONS.AD;
        }
        return null;
    }, [activePrediction, percentage]);

    // ── Has ML prediction? ──────────────────────────────────────────────
    const hasPrediction = !!(activePrediction?.prediction && activePrediction?.confidence != null);

    // =====================================================================
    // LOADING STATE
    // =====================================================================
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative mx-auto mb-6 w-20 h-20">
                        <Loader2 className="w-20 h-20 animate-spin text-indigo-600" />
                        <Cpu className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Loading AI Results...</p>
                    <p className="text-sm text-gray-400 mt-1">Retrieving your diagnostic analysis</p>
                </motion.div>
            </div>
        );
    }

    // =====================================================================
    // RENDER
    // =====================================================================
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Error Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: AI DIAGNOSIS (only if ML prediction exists)
               ═══════════════════════════════════════════════════════════════ */}
            {hasPrediction ? (
                <>
                    {/* Page Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
                            <Zap className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-bold text-indigo-700">
                                AI-Powered Diagnostic Analysis
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Your Diagnostic Results
                        </h1>
                    </motion.div>

                    {/* Diagnosis Card */}
                    <DiagnosisCard
                        prediction={activePrediction.prediction}
                        confidence={activePrediction.confidence}
                    />

                    {/* Confidence Meter + Probability Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="grid md:grid-cols-2 gap-6"
                    >
                        {/* Confidence Gauge */}
                        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                Model Confidence
                            </h3>
                            <ConfidenceMeter
                                confidence={activePrediction.confidence}
                                size={180}
                                label="AI Certainty Level"
                            />
                            {activePrediction.processingTimeMs && (
                                <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    Processed in {Math.round(activePrediction.processingTimeMs)}ms
                                </div>
                            )}
                        </div>

                        {/* Probability Distribution */}
                        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                Class Probabilities
                            </h3>
                            <ProbabilityChart
                                classProbabilities={activePrediction.classProbabilities}
                                prediction={activePrediction.prediction}
                            />
                        </div>
                    </motion.div>
                </>
            ) : (
                /* ═════════════════════════════════════════════════════════════
                   FALLBACK: Cognitive-Only Analysis (no MRI / ML failed)
                   ═════════════════════════════════════════════════════════════ */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-xl rounded-2xl p-8"
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-indigo-100 rounded-full">
                            <BarChart3 className="w-10 h-10 text-indigo-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                        Cognitive Assessment Results
                    </h2>

                    {/* No MRI notice */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800">
                                AI MRI Analysis Not Available
                            </p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                Upload an MRI scan during the diagnostic workflow to receive a full AI-powered analysis with multimodal prediction.
                            </p>
                        </div>
                    </div>

                    {percentage !== null && cogRisk && (
                        <div className={`mx-auto mb-4 p-6 rounded-2xl border-2 ${
                            cogRisk.color === "emerald" ? "bg-emerald-50 border-emerald-200" :
                            cogRisk.color === "amber" ? "bg-amber-50 border-amber-200" :
                            "bg-rose-50 border-rose-200"
                        }`}>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <h3 className={`text-xl font-bold ${
                                    cogRisk.color === "emerald" ? "text-emerald-700" :
                                    cogRisk.color === "amber" ? "text-amber-700" :
                                    "text-rose-700"
                                }`}>
                                    {cogRisk.level}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Cognitive health score: <span className="font-bold text-gray-800">{percentage}%</span>
                                </p>
                                {immediateState?.symptomsReported != null && (
                                    <p className="text-sm text-gray-500">
                                        Symptoms reported: <span className="font-semibold text-indigo-600">
                                            {immediateState.symptomsReported}
                                        </span> / {immediateState.totalAnswered ?? 30}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: COGNITIVE SCORES (always shown)
               ═══════════════════════════════════════════════════════════════ */}
            {latestTest && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: hasPrediction ? 0.25 : 0.1 }}
                    className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Cognitive Domain Scores
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Memory", value: latestTest.memoryScore, color: "purple" },
                            { label: "Language", value: latestTest.languageScore, color: "teal" },
                            { label: "Attention", value: latestTest.attentionScore, color: "blue" },
                        ].map((domain) => (
                            <div key={domain.label} className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium mb-1">{domain.label}</p>
                                <p className={`text-2xl font-extrabold ${
                                    domain.value >= 80 ? "text-emerald-600" :
                                    domain.value >= 60 ? "text-amber-600" :
                                    "text-rose-600"
                                }`}>
                                    {domain.value ?? "—"}%
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3: RECOMMENDATIONS
               ═══════════════════════════════════════════════════════════════ */}
            {activeRecommendations && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: hasPrediction ? 0.3 : 0.2 }}
                    className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        {activeRecommendations.title}
                    </h3>
                    <ul className="space-y-3">
                        {activeRecommendations.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    {/* Disclaimer */}
                    <div className="mt-6 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                        <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Important Disclaimer
                        </h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                            This is an <strong>educational FYP project</strong>. Results are for{" "}
                            <strong>demonstration purposes only</strong>. This system is NOT a
                            substitute for professional medical diagnosis.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 4: PREDICTION HISTORY (ML Results)
               ═══════════════════════════════════════════════════════════════ */}
            {mlResults.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-indigo-600" />
                        AI Prediction History
                    </h3>
                    <div className="space-y-3">
                        {mlResults.map((result) => {
                            const meta = CLASS_META[result.prediction] || CLASS_META.CN;
                            const Icon = meta.icon;
                            const pct = Math.round((result.confidence ?? 0) * 100);

                            return (
                                <div
                                    key={result._id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${meta.colors.border} ${meta.colors.bg}`}
                                >
                                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                        <div className={`p-2 rounded-lg ${meta.colors.iconBg}`}>
                                            <Icon className={`w-5 h-5 ${meta.colors.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {meta.label}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(result.createdAt).toLocaleDateString()} at{" "}
                                                {new Date(result.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-12 sm:ml-0">
                                        <div className="text-right">
                                            <span className={`text-sm font-bold ${meta.colors.text}`}>
                                                {pct}% confidence
                                            </span>
                                            {result.cognitiveTest?.totalScore != null && (
                                                <p className="text-xs text-gray-500">
                                                    Symptoms: {result.cognitiveTest.totalScore}/30
                                                </p>
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${meta.colors.badge}`}>
                                            {result.prediction}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 5: COGNITIVE TEST HISTORY
               ═══════════════════════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    Cognitive Test History
                </h3>
                {cognitiveTests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No cognitive tests taken yet</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate("/cognitive-test")}
                            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Take Your First Test
                        </motion.button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cognitiveTests.map((test) => {
                            const score = test.mmseScore ?? 0;
                            return (
                                <div
                                    key={test._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                        <div className={`p-2 rounded-lg ${score >= 24 ? "bg-green-100" : score >= 18 ? "bg-yellow-100" : "bg-red-100"}`}>
                                            <Brain className={`w-5 h-5 ${score >= 24 ? "text-green-600" : score >= 18 ? "text-yellow-600" : "text-red-600"}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {test.totalScore != null
                                                    ? `Symptoms: ${test.totalScore}/30 · Health: ${score}/30`
                                                    : `MMSE: ${score}/30 · MoCA: ${test.mocaScore}/30`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(test.submittedAt).toLocaleDateString()} at{" "}
                                                {new Date(test.submittedAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm ml-12 sm:ml-0">
                                        <span className="text-gray-600">
                                            Memory: <span className="font-semibold">{test.memoryScore}%</span>
                                        </span>
                                        <span className="text-gray-600">
                                            Language: <span className="font-semibold">{test.languageScore}%</span>
                                        </span>
                                        <span className="text-gray-600">
                                            Attention: <span className="font-semibold">{test.attentionScore}%</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 6: MRI UPLOAD HISTORY
               ═══════════════════════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white shadow-xl rounded-2xl p-6 sm:p-8"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-blue-600" />
                    MRI Upload History
                </h3>
                {mriUploads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No MRI scans uploaded yet</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => navigate("/upload-mri")}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Upload Your First Scan
                        </motion.button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mriUploads.map((file) => (
                            <div
                                key={file._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <Upload className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-none">
                                            {file.fileName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(file.uploadedAt).toLocaleDateString()} at{" "}
                                            {new Date(file.uploadedAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                    Uploaded
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════
                ACTION BUTTONS
               ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row gap-4 pb-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold transition-colors"
                >
                    <Home className="w-5 h-5" /> Dashboard
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/upload-mri")}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-semibold transition-colors"
                >
                    <RefreshCw className="w-5 h-5" /> New Diagnosis
                </motion.button>
            </div>
        </div>
    );
}