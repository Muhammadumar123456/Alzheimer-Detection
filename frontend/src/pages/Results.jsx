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
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    BarChart3, Brain, Upload, Loader2, AlertCircle, RefreshCw, Home,
    Activity, FileText, AlertTriangle, Cpu, Clock, Zap, Download, ChevronRight, X
} from "lucide-react";
import { apiGet } from "../utils/api";
import { useToast } from "../context/ToastContext";
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
    const { showToast } = useToast();

    const immediateState = location.state || null;

    // ── State ────────────────────────────────────────────────────────────
    const [mlResults, setMlResults] = useState(immediateState?.prediction ? [immediateState.prediction] : []);
    const [cognitiveTests, setCognitiveTests] = useState([]);
    const [mriUploads, setMriUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Modal States
    const [selectedCase, setSelectedCase] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── Case Detail Functions ──────────────────────────────────────────
    const handleViewDetails = (result) => {
        setSelectedCase(result);
        setIsModalOpen(true);
    };

    const getFileUrl = (file) => {
        if (!file || !file.fileUrl) return "/mri-placeholder.png";
        if (file.fileUrl.startsWith('http')) return file.fileUrl;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
        return `${baseUrl}${file.fileUrl}`;
    };

    const loadImageAsBase64 = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg"));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    const handleDownloadIndividualReport = async (result) => {
        try {
            const { user, mriScan, cognitiveTest, prediction, confidence, createdAt, details } = result;
            const doc = new jsPDF();
            
            // 1. Header & Title
            doc.setFillColor(30, 41, 59); // Slate-900
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("ALZDETECT DIAGNOSTIC REPORT", 20, 25);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 32);

            // 2. Patient Information Section
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Patient Information", 20, 55);
            
            autoTable(doc, {
                startY: 60,
                head: [['Field', 'Detail']],
                body: [
                    ['Patient Name', user?.name || 'N/A'],
                    ['Patient Email', user?.email || 'N/A'],
                    ['Case Reference', result._id.slice(-8).toUpperCase()],
                    ['Assessment Date', new Date(createdAt).toLocaleDateString()],
                ],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            });

            // 3. AI Diagnostic Results
            let currentY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text("AI Diagnostic Results", 20, currentY);
            
            autoTable(doc, {
                startY: currentY + 5,
                head: [['Metric', 'Value']],
                body: [
                    ['AI Prediction', CLASS_META[prediction]?.label || prediction],
                    ['Model Confidence', `${Math.round((confidence || 0) * 100)}%`],
                    ['Analysis Status', 'Verified'],
                    ['Notes', typeof details === 'string' ? details : 'No clinical notes provided.'],
                ],
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] },
            });

            // 4. MRI Visualization (If exists)
            currentY = doc.lastAutoTable.finalY + 15;
            if (mriScan && mriScan.fileUrl) {
                doc.setFontSize(14);
                doc.text("Clinical MRI Scan", 20, currentY);
                
                const imageUrl = getFileUrl(mriScan);
                if (imageUrl && !imageUrl.includes('placeholder')) {
                    const base64Img = await loadImageAsBase64(imageUrl);
                    if (base64Img) {
                        doc.addImage(base64Img, 'JPEG', 20, currentY + 5, 100, 70);
                        currentY += 80;
                    } else {
                        doc.setFontSize(10);
                        doc.setTextColor(150);
                        doc.text("[MRI Image not available for preview]", 20, currentY + 10);
                        currentY += 15;
                    }
                }
            }

            // 5. Cognitive Performance Breakdown
            if (cognitiveTest) {
                if (currentY > 240) { doc.addPage(); currentY = 20; }
                doc.setTextColor(30, 41, 59);
                doc.setFontSize(14);
                doc.text("Cognitive Performance Breakdown", 20, currentY);
                
                autoTable(doc, {
                    startY: currentY + 5,
                    head: [['Domain', 'Score (%)', 'Status']],
                    body: [
                        ['Memory Performance', `${cognitiveTest.memoryScore}%`, cognitiveTest.memoryScore >= 60 ? 'Stable' : 'Impaired'],
                        ['Language Performance', `${cognitiveTest.languageScore}%`, cognitiveTest.languageScore >= 60 ? 'Stable' : 'Impaired'],
                        ['Attention Performance', `${cognitiveTest.attentionScore}%`, cognitiveTest.attentionScore >= 60 ? 'Satisfactory' : 'Impaired'],
                        ['Total Symptom Count', `${cognitiveTest.totalScore != null ? cognitiveTest.totalScore : (30 - cognitiveTest.mmseScore)}/30`, (cognitiveTest.totalScore || (30 - cognitiveTest.mmseScore)) > 15 ? 'High Risk' : 'Low Risk'],
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: [147, 51, 234] }, // Purple-600
                });
            }

            // 6. Footer Disclaimer
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text("DISCLAIMER: This is an educational project report generated by AlzDetect AI. It is NOT a professional medical diagnosis.", 20, 285);

            const patientName = (user?.name || 'Patient').replace(/\s+/g, '_');
            const dateStr = new Date(createdAt).toISOString().split('T')[0];
            const fileName = `Report_${prediction}_${patientName}_${dateStr}.pdf`;
            doc.save(fileName);
            if (typeof showToast === 'function') showToast('Report downloaded successfully', 'success');
        } catch (err) {
            console.error("PDF Export Error Details:", err);
            if (typeof showToast === 'function') showToast(`Failed to generate PDF: ${err.message || 'Unknown error'}`, 'error');
        }
    };

    // ── Data Fetching ────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            const [resultsRes, cogRes, mriRes] = await Promise.all([
                apiGet("/results/my?limit=10&sort=-createdAt"),
                apiGet("/cognitive/my?limit=10&sort=-submittedAt"),
                apiGet("/upload/my?limit=10&sort=-uploadedAt"),
            ]);

            if (import.meta.env.DEV) {
                console.log("[Results] API data loaded:", {
                    results: resultsRes.data?.results?.length ?? 0,
                    cognitive: cogRes.data?.tests?.length ?? 0,
                    mri: mriRes.data?.files?.length ?? 0,
                });
            }

            setMlResults(resultsRes.data?.results || []);
            setCognitiveTests(cogRes.data?.tests || []);
            setMriUploads(mriRes.data?.files || []);

            // Route protection logic removed to allow viewing empty results page
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error("[Results] Failed to fetch data:", err);
            }
            setError(err.message || "Failed to load results");
        } finally {
            setLoading(false);
        }
    }, [immediateState, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Derived ML prediction (prefer matching API data, fallback to nav state) ──
    const activePrediction = useMemo(() => {
        // 1. If we have a specific test ID from navigation, only look for that match
        if (immediateState?.cognitiveTestId) {
            // Check API results for this specific test
            const apiMatch = mlResults.find(
                (r) => (r.cognitiveTest?._id || r.cognitiveTest) === immediateState.cognitiveTestId
            );
            if (apiMatch) return apiMatch;

            // Check navigation state (from immediate submission)
            if (immediateState.prediction) {
                return immediateState.prediction;
            }

            // CRITICAL FIX: If we just submitted a test and NO prediction is linked to it,
            // we MUST return null to show the cognitive-only risk level.
            // DO NOT fall through to step 2 (latest global result).
            return null;
        }

        // 2. If no immediateState (page refresh/direct visit), show latest global result
        if (mlResults.length > 0) {
            return mlResults[0];
        }

        return null;
    }, [immediateState, mlResults]);

    // ── Polling for Pending Results ──────────────────────────────────────
    useEffect(() => {
        let pollInterval = null;

        if (activePrediction?.status === "pending") {
            if (import.meta.env.DEV) {
                console.log("[Results] Active prediction is pending. Starting polling...");
            }
            pollInterval = setInterval(() => {
                // We use a silent fetch here (could pass a flag to fetchData if needed)
                fetchData();
            }, 4000); // Poll every 4 seconds
        }

        return () => {
            if (pollInterval) {
                if (import.meta.env.DEV) {
                    console.log("[Results] Cleaning up polling interval.");
                }
                clearInterval(pollInterval);
            }
        };
    }, [activePrediction?.status, fetchData]);

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
        // Fallback to cognitive-only risk tier (NO 'AD' label here)
        if (percentage !== null) {
            if (percentage >= 80) return RECOMMENDATIONS.CN;
            if (percentage >= 60) return RECOMMENDATIONS.EMCI;
            
            // For very low scores without MRI, we use a generic but serious warning
            return {
                title: "Cognitive Assessment: Clinical Review Required",
                items: [
                    "Your assessment score indicates significant cognitive symptoms.",
                    "Consult a healthcare professional for a formal clinical evaluation.",
                    "Consider uploading an MRI scan for AI-powered multimodal analysis.",
                    "Keep a log of memory or behavioral changes to share with your doctor.",
                ],
            };
        }
        return null;
    }, [activePrediction, percentage]);

    // ── Has ML prediction? ──────────────────────────────────────────────
    const hasPrediction = !!(activePrediction?.prediction && activePrediction?.confidence != null);
    const isPending = activePrediction?.status === 'pending';
    const isFailed = activePrediction?.status === 'failed';
    const showAiSection = hasPrediction || isPending;

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
            {showAiSection ? (
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
                                {isPending ? "AI Analysis in Progress" : "AI-Powered Diagnostic Analysis"}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            {isPending ? "Processing Your MRI..." : "Your Diagnostic Results"}
                        </h1>
                    </motion.div>

                    {/* Diagnosis Card (handles its own loading state) */}
                    <DiagnosisCard
                        prediction={activePrediction.prediction}
                        confidence={activePrediction.confidence}
                        loading={isPending}
                    />

                    {/* Confidence Meter + Probability Chart (only if completed) */}
                    {!isPending && hasPrediction && (
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
                    )}
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

                    {/* Prediction Loading/Error states */}
                    {!hasPrediction && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800">
                                    {isPending ? "AI Analysis in Progress..." : isFailed ? "AI Analysis Failed" : "AI MRI Analysis Not Available"}
                                </p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    {isPending 
                                        ? "Our AI model is currently processing your MRI scan. This usually takes 10-30 seconds. Please refresh the page in a moment."
                                        : isFailed
                                        ? `There was an issue processing your MRI scan: ${activePrediction.errorMessage || "Unknown error"}. Please contact support.`
                                        : "Upload an MRI scan during the diagnostic workflow to receive a full AI-powered analysis with multimodal prediction."}
                                </p>
                            </div>
                        </div>
                    )}

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
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Cpu className="w-6 h-6 text-indigo-600" />
                            AI Prediction History
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {mlResults.map((result) => {
                            const meta = CLASS_META[result.prediction] || CLASS_META.CN;
                            const Icon = meta.icon;
                            const pct = Math.round((result.confidence ?? 0) * 100);

                            return (
                                <div
                                    key={result._id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group ${meta.colors.border} ${meta.colors.bg}`}
                                    onClick={() => handleViewDetails(result)}
                                >
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${meta.colors.iconBg}`}>
                                            <Icon className={`w-6 h-6 ${meta.colors.iconColor}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 leading-none">
                                                    {meta.label}
                                                </p>
                                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-tighter ${meta.colors.badge}`}>
                                                    {result.prediction}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Status Badges */}
                                        <div className="hidden md:flex items-center gap-2">
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${result.mriScan ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                <Upload size={10} /> MRI
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${result.cognitiveTest ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                                                <Brain size={10} /> COG
                                            </div>
                                        </div>

                                        <div className="text-right min-w-[100px]">
                                            <p className={`text-sm font-black ${meta.colors.text}`}>
                                                {pct}% <span className="text-[10px] font-bold opacity-70">CONFIDENCE</span>
                                            </p>
                                            {result.cognitiveTest?.totalScore != null && (
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    Symptoms: {result.cognitiveTest.totalScore}/30
                                                </p>
                                            )}
                                        </div>

                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadIndividualReport(result);
                                            }}
                                            title="Download Clinical Report"
                                            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-90"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
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
                                <div className="flex items-center gap-4">
                                    {file.fileUrl ? (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                            <img
                                                src={getFileUrl(file)}
                                                alt="MRI Thumbnail"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/mri-placeholder.png";
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                                            <Upload className="w-6 h-6 text-blue-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-xs">
                                            {file.fileName}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>
                                                {file.fileSize
                                                    ? `${(file.fileSize / 1024).toFixed(1)} KB`
                                                    : "Size unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {file.mimeType?.split('/')[1] || 'IMG'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        ID: {file._id.slice(-6)}
                                    </span>
                                </div>
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

            {/* ═══════════════════════════════════════════════════════════════
                REPORT MODAL
               ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isModalOpen && selectedCase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full relative z-10 max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                        <FileText size={20} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Case Detail View</h3>
                                        <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">
                                            ID: {selectedCase._id.slice(-8)} · {new Date(selectedCase.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50/30">
                                <div className="space-y-8">
                                    {/* MRI Section */}
                                    <section>
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Activity size={16} className="text-blue-600" />
                                            Clinical MRI Data
                                        </h4>
                                        {selectedCase.mriScan ? (
                                            <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 bg-black aspect-video flex items-center justify-center">
                                                <img 
                                                    src={getFileUrl(selectedCase.mriScan)}
                                                    alt="MRI Scan"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                                    <p className="text-white text-xs font-bold truncate">
                                                        {selectedCase.mriScan.fileName}
                                                    </p>
                                                    <p className="text-gray-300 text-[10px]">
                                                        Uploaded on {new Date(selectedCase.mriScan.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                                                <Upload size={32} className="mb-2 opacity-20" />
                                                <p className="text-sm font-medium">No MRI scan associated with this record</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Diagnostic Results */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-5 rounded-2xl border-2 ${CLASS_META[selectedCase.prediction]?.colors.border || 'border-gray-100'} ${CLASS_META[selectedCase.prediction]?.colors.bg || 'bg-white'}`}>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">AI Prediction</label>
                                            <p className={`text-2xl font-black ${CLASS_META[selectedCase.prediction]?.colors.text || 'text-gray-900'}`}>
                                                {CLASS_META[selectedCase.prediction]?.label || selectedCase.prediction}
                                            </p>
                                        </div>
                                        <div className="p-5 bg-white rounded-2xl border-2 border-gray-100">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Model Confidence</label>
                                            <p className="text-2xl font-black text-gray-900">
                                                {Math.round((selectedCase.confidence || 0) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cognitive Breakdown */}
                                    <section>
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Brain size={16} className="text-purple-600" />
                                            Cognitive Performance
                                        </h4>
                                        {selectedCase.cognitiveTest ? (
                                            <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 space-y-6">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">Total Symptom Count</p>
                                                        <p className="text-xl font-bold text-rose-600">
                                                            {selectedCase.cognitiveTest.totalScore != null ? selectedCase.cognitiveTest.totalScore : (30 - selectedCase.cognitiveTest.mmseScore)}/30
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-medium">Higher score indicates higher risk</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Assessment Date</p>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {new Date(selectedCase.cognitiveTest.submittedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {[
                                                        { label: "Memory", val: selectedCase.cognitiveTest.memoryScore, color: "purple" },
                                                        { label: "Language", val: selectedCase.cognitiveTest.languageScore, color: "indigo" },
                                                        { label: "Attention", val: selectedCase.cognitiveTest.attentionScore, color: "blue" }
                                                    ].map(d => (
                                                        <div key={d.label} className="text-center">
                                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                                                                <div 
                                                                    className={`h-full bg-${d.color}-500 rounded-full`} 
                                                                    style={{ width: `${d.val}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{d.label}</p>
                                                            <p className="text-sm font-bold text-gray-900">{d.val}%</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400">
                                                <p className="text-sm font-medium">No cognitive data for this assessment</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 bg-white flex gap-4 sticky bottom-0 z-20">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => handleDownloadIndividualReport(selectedCase)}
                                    className="flex-1 py-4 px-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <Download size={18} /> Download Case File
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}