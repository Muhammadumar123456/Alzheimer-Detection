/**
 * =============================================================================
 * PROBABILITY CHART COMPONENT
 * =============================================================================
 * Animated horizontal bar chart for 4-class prediction probabilities.
 *
 * Props:
 *   classProbabilities — { AD: 0.12, CN: 0.72, EMCI: 0.09, LMCI: 0.07 }
 *   prediction         — highlighted/active class (e.g., "CN")
 * =============================================================================
 */

import { motion } from "framer-motion";

const BAR_CONFIG = {
    CN:   { label: "Cognitively Normal",   color: "bg-emerald-500", textColor: "text-emerald-700" },
    EMCI: { label: "Early MCI",            color: "bg-amber-500",   textColor: "text-amber-700" },
    LMCI: { label: "Late MCI",             color: "bg-orange-500",  textColor: "text-orange-700" },
    AD:   { label: "Alzheimer's Disease",  color: "bg-rose-500",    textColor: "text-rose-700" },
};

// Ordered for display (most favourable → most severe)
const CLASS_ORDER = ["CN", "EMCI", "LMCI", "AD"];

export default function ProbabilityChart({ classProbabilities = {}, prediction }) {
    return (
        <div className="space-y-4">
            {CLASS_ORDER.map((cls, index) => {
                const prob = classProbabilities[cls] ?? 0;
                const pct = Math.round(prob * 100);
                const cfg = BAR_CONFIG[cls];
                const isActive = cls === prediction;

                return (
                    <motion.div
                        key={cls}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 * index + 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isActive ? cfg.textColor : "text-gray-600"}`}>
                                    {cfg.label}
                                </span>
                                {isActive && (
                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                                        predicted
                                    </span>
                                )}
                            </div>
                            <span className={`text-sm font-extrabold ${isActive ? cfg.textColor : "text-gray-500"}`}>
                                {pct}%
                            </span>
                        </div>

                        {/* Bar track */}
                        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${cfg.color} ${isActive ? "opacity-100" : "opacity-50"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(pct, 1)}%` }}
                                transition={{ duration: 0.8, delay: 0.15 * index + 0.3, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
