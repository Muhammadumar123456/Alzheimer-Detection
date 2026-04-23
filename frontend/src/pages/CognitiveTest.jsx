import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle, Loader2, AlertCircle, ShieldCheck, Send } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiPost } from "../utils/api";
import { useToast } from "../context/ToastContext";

// =============================================================================
// 30 CLINICAL QUESTIONS — EXACT ORDER FROM ML TRAINING (testing_gui.py)
// DO NOT reorder, add, or remove questions without retraining the model.
// =============================================================================
const sections = [
    {
        title: "Memory",
        subtitle: "MOCA / ADAS-Cog",
        color: "purple",
        questions: [
            "Difficulty remembering recent events?",
            "Repeats the same questions?",
            "Forgets appointments?",
            "Misplaces objects frequently?",
            "Difficulty recalling names?",
            "Needs reminders for daily tasks?",
            "Confused about recent conversations?",
            "Difficulty learning new information?",
        ],
    },
    {
        title: "Attention & Processing Speed",
        subtitle: "MOCA",
        color: "blue",
        questions: [
            "Difficulty focusing on tasks?",
            "Easily distracted?",
            "Trouble following conversations?",
            "Mental fatigue during thinking?",
            "Slow thinking speed?",
            "Difficulty multitasking?",
        ],
    },
    {
        title: "Executive Function",
        subtitle: "ADAS-Cog",
        color: "indigo",
        questions: [
            "Difficulty planning activities?",
            "Trouble problem-solving?",
            "Poor decision-making?",
            "Difficulty managing finances?",
            "Struggles with complex tasks?",
            "Reduced mental flexibility?",
        ],
    },
    {
        title: "Language",
        subtitle: "ADAS-Cog",
        color: "teal",
        questions: [
            "Word-finding difficulty?",
            "Trouble naming familiar objects?",
            "Reduced speech fluency?",
            "Difficulty understanding language?",
        ],
    },
    {
        title: "Orientation",
        subtitle: "MOCA",
        color: "amber",
        questions: [
            "Confused about time or date?",
            "Disoriented in familiar places?",
            "Difficulty recognizing surroundings?",
        ],
    },
    {
        title: "Daily Functioning",
        subtitle: "CDRSB / ADL",
        color: "rose",
        questions: [
            "Needs help with daily activities?",
            "Reduced independence?",
            "Difficulty with self-care?",
        ],
    },
];

const TOTAL_QUESTIONS = 30;

// Color utility for Tailwind classes
const sectionColors = {
    purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    blue:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
    teal:   { bg: "bg-teal-50",   border: "border-teal-200",   badge: "bg-teal-100 text-teal-700",     dot: "bg-teal-500" },
    amber:  { bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
    rose:   { bg: "bg-rose-50",   border: "border-rose-200",   badge: "bg-rose-100 text-rose-700",     dot: "bg-rose-500" },
};

export default function CognitiveTest() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const mriUploadId = location.state?.mriUploadId || null;

    // 30 answers: null = unanswered, 0 = No, 1 = Yes
    const [answers, setAnswers] = useState(Array(TOTAL_QUESTIONS).fill(null));
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const answeredCount = answers.filter((a) => a !== null).length;
    const allAnswered = answeredCount === TOTAL_QUESTIONS;
    const progress = (answeredCount / TOTAL_QUESTIONS) * 100;

    // Set answer for a specific question index
    const setAnswer = (globalIndex, value) => {
        setAnswers((prev) => {
            const next = [...prev];
            next[globalIndex] = value;
            return next;
        });
    };

    // Submit handler — sends rawAnswers to backend
    const handleSubmit = async () => {
        if (!allAnswered) return;

        setSubmitting(true);
        setSubmitError("");

        const symptomsReported = answers.filter((a) => a === 1).length;

        try {
            if (import.meta.env.DEV) {
                console.log("[CognitiveTest] Submitting assessment with MRI ID:", mriUploadId);
            }

            const response = await apiPost("/cognitive/submit", {
                rawAnswers: answers,
                mriUploadId,
                notes: `Clinical assessment: ${symptomsReported}/30 symptoms reported`,
            });

            if (import.meta.env.DEV) {
                console.log("[CognitiveTest] Submission response:", response.data);
            }

            // Extract ML prediction if the auto-prediction ran
            const predictionData = response.data.prediction || null;

            const isPending = response.data.prediction?.status === "pending";

            showToast(
                isPending
                    ? "Assessment submitted — MRI analysis starting..."
                    : response.data.prediction
                        ? "Assessment submitted — AI analysis complete!"
                        : "Cognitive assessment submitted successfully!",
                "success"
            );

            navigate("/results", {
                state: {
                    testType: "cognitive",
                    cognitiveTestId: response.data.cognitiveTest._id,
                    totalAnswered: TOTAL_QUESTIONS,
                    symptomsReported,
                    mriUploadId,
                    // ML prediction payload (null if no MRI was linked)
                    prediction: predictionData,
                },
            });
        } catch (err) {
            setSubmitError(err.message || "Failed to submit assessment. Please try again.");
            showToast("Failed to submit assessment", "error");
            setSubmitting(false);
        }
    };

    // Track global question index across sections
    let globalIndex = 0;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                        <Brain className="w-10 h-10 text-purple-600" />
                    </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Cognitive Assessment</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Answer each question honestly based on your recent experiences. Select <strong>Yes</strong> if you have noticed the symptom, or <strong>No</strong> if you have not.
                </p>
            </motion.div>

            {/* MRI Link Banner */}
            {mriUploadId && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900">Step 2/2: Cognitive Assessment</p>
                        <p className="text-xs text-indigo-700">MRI Scan linked — complete this assessment to generate your combined analysis.</p>
                    </div>
                </motion.div>
            )}

            {/* Sticky Progress Bar */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm pb-3 pt-1 -mx-1 px-1">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-indigo-600">{answeredCount} / {TOTAL_QUESTIONS}</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
            </div>

            {/* Question Sections */}
            <div className="space-y-8 mt-6">
                {sections.map((section) => {
                    const colors = sectionColors[section.color];
                    const sectionStart = globalIndex;

                    const sectionContent = (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sectionStart * 0.02 }}
                            className={`rounded-2xl border ${colors.border} overflow-hidden`}
                        >
                            {/* Section Header */}
                            <div className={`${colors.bg} px-6 py-4 flex items-center gap-3`}>
                                <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{section.subtitle}</span>
                                </div>
                                <span className="ml-auto text-sm text-gray-500 font-medium">
                                    {section.questions.filter((_, i) => answers[sectionStart + i] !== null).length}/{section.questions.length}
                                </span>
                            </div>

                            {/* Questions */}
                            <div className="divide-y divide-gray-100">
                                {section.questions.map((question, qIndex) => {
                                    const idx = sectionStart + qIndex;
                                    const answer = answers[idx];

                                    return (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-3 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-start gap-3 flex-1">
                                                <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{question}</p>
                                            </div>
                                            <div className="flex gap-2 ml-8 sm:ml-4 flex-shrink-0">
                                                <button
                                                    onClick={() => setAnswer(idx, 1)}
                                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                        answer === 1
                                                            ? "bg-red-500 text-white ring-2 ring-red-200 shadow-md"
                                                            : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                                                    }`}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={() => setAnswer(idx, 0)}
                                                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                        answer === 0
                                                            ? "bg-green-500 text-white ring-2 ring-green-200 shadow-md"
                                                            : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 border border-gray-200"
                                                    }`}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );

                    globalIndex += section.questions.length;
                    return sectionContent;
                })}
            </div>

            {/* Submit Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 bg-white shadow-xl rounded-2xl p-6 sm:p-8"
            >
                {/* Error */}
                {submitError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{submitError}</p>
                    </motion.div>
                )}

                {/* Summary */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Ready to Submit</h3>
                        <p className="text-sm text-gray-500">
                            {allAnswered
                                ? `All ${TOTAL_QUESTIONS} questions answered. ${answers.filter((a) => a === 1).length} symptom(s) reported.`
                                : `${TOTAL_QUESTIONS - answeredCount} question(s) remaining.`}
                        </p>
                    </div>
                    {allAnswered && <CheckCircle className="w-8 h-8 text-green-500" />}
                </div>

                {!allAnswered && (
                    <p className="text-sm text-amber-600 font-medium mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Please answer all questions before submitting.
                    </p>
                )}

                <motion.button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    whileHover={allAnswered && !submitting ? { scale: 1.02 } : {}}
                    whileTap={allAnswered && !submitting ? { scale: 0.98 } : {}}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                        allAnswered && !submitting
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {submitting ? (
                        <><Loader2 className="w-6 h-6 animate-spin" /><span>{mriUploadId ? "Processing AI Analysis..." : "Submitting Assessment..."}</span></>
                    ) : (
                        <><Send className="w-5 h-5" /><span>Submit Assessment</span></>
                    )}
                </motion.button>
            </motion.div>

            {/* Disclaimer */}
            <div className="max-w-3xl mx-auto mt-6 text-center text-sm text-gray-400 pb-8">
                <p>
                    <span className="font-semibold">Note:</span> This assessment is for screening purposes only and does not constitute a medical diagnosis.
                    Answer based on observations over the past few weeks. Consult a healthcare professional for formal evaluation.
                </p>
            </div>
        </div>
    );
}
