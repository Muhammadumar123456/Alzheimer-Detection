/**
 * =============================================================================
 * DIAGNOSIS CARD COMPONENT
 * =============================================================================
 * Displays the primary ML prediction class with full label, severity styling,
 * icon, and confidence tag.
 *
 * Props:
 *   prediction  — "AD" | "CN" | "EMCI" | "LMCI"
 *   confidence  — 0–1 decimal (e.g., 0.89)
 * =============================================================================
 */

import { motion } from "framer-motion";
import {
    ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon,
} from "lucide-react";

// ── Class metadata ──────────────────────────────────────────────────────────
const CLASS_META = {
    CN: {
        label: "Cognitively Normal",
        shortLabel: "CN",
        description: "No significant cognitive impairment detected.",
        icon: ShieldCheck,
        colors: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-800",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            badge: "bg-emerald-100 text-emerald-700",
            glow: "shadow-emerald-200/60",
        },
    },
    EMCI: {
        label: "Early Mild Cognitive Impairment",
        shortLabel: "EMCI",
        description: "Early-stage mild cognitive changes detected. Regular monitoring is recommended.",
        icon: AlertTriangle,
        colors: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-800",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            badge: "bg-amber-100 text-amber-700",
            glow: "shadow-amber-200/60",
        },
    },
    LMCI: {
        label: "Late Mild Cognitive Impairment",
        shortLabel: "LMCI",
        description: "Notable cognitive decline detected. Professional clinical evaluation is strongly advised.",
        icon: ShieldAlert,
        colors: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-800",
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
            badge: "bg-orange-100 text-orange-700",
            glow: "shadow-orange-200/60",
        },
    },
    AD: {
        label: "Alzheimer's Disease Indicators",
        shortLabel: "AD",
        description: "Significant markers consistent with Alzheimer's Disease detected. Immediate specialist consultation recommended.",
        icon: AlertOctagon,
        colors: {
            bg: "bg-rose-50",
            border: "border-rose-200",
            text: "text-rose-800",
            iconBg: "bg-rose-100",
            iconColor: "text-rose-600",
            badge: "bg-rose-100 text-rose-700",
            glow: "shadow-rose-200/60",
        },
    },
};

export { CLASS_META };

export default function DiagnosisCard({ prediction, confidence }) {
    const meta = CLASS_META[prediction] || CLASS_META.CN;
    const Icon = meta.icon;
    const pct = Math.round((confidence ?? 0) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`relative overflow-hidden rounded-2xl border-2 ${meta.colors.border} ${meta.colors.bg} p-8 shadow-xl ${meta.colors.glow}`}
        >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 30% 20%, currentColor 0%, transparent 60%)",
                }}
            />

            <div className="relative flex flex-col items-center text-center gap-5">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.15, stiffness: 250 }}
                    className={`p-5 rounded-full ${meta.colors.iconBg}`}
                >
                    <Icon className={`w-14 h-14 ${meta.colors.iconColor}`} />
                </motion.div>

                {/* Title */}
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        AI Diagnosis
                    </p>
                    <h2 className={`text-2xl sm:text-3xl font-extrabold ${meta.colors.text}`}>
                        {meta.label}
                    </h2>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${meta.colors.badge}`}>
                        {meta.shortLabel}
                    </span>
                </div>

                {/* Confidence tag */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm"
                >
                    <span className="text-sm text-gray-500">Confidence</span>
                    <span className={`text-xl font-extrabold ${meta.colors.text}`}>{pct}%</span>
                </motion.div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                    {meta.description}
                </p>
            </div>
        </motion.div>
    );
}
