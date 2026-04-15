/**
 * =============================================================================
 * CONFIDENCE METER COMPONENT
 * =============================================================================
 * Animated SVG radial gauge showing the ML model's confidence score.
 *
 * Props:
 *   confidence — 0–1 decimal (e.g., 0.89)
 *   size       — pixel diameter (default 180)
 *   label      — optional text below the gauge
 * =============================================================================
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

// Color stops based on confidence thresholds
function getColor(pct) {
    if (pct >= 85) return { stroke: "#059669", text: "text-emerald-600", label: "High" };
    if (pct >= 65) return { stroke: "#d97706", text: "text-amber-600", label: "Moderate" };
    return { stroke: "#dc2626", text: "text-red-600", label: "Low" };
}

export default function ConfidenceMeter({ confidence = 0, size = 180, label }) {
    const pct = Math.round(confidence * 100);
    const color = useMemo(() => getColor(pct), [pct]);

    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background ring */}
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* Animated foreground ring */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className={`text-3xl font-extrabold ${color.text}`}
                    >
                        {pct}%
                    </motion.span>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
                        {color.label}
                    </span>
                </div>
            </div>

            {label && (
                <p className="text-sm text-gray-500 font-medium">{label}</p>
            )}
        </div>
    );
}
