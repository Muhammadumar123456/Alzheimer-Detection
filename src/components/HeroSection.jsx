import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection({ handleNavigation }) {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
        <motion.h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6" initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}>
          Welcome to{' '}
          <motion.span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" animate={{ backgroundPosition: ['0%', '100%', '0%'] }} transition={{ duration: 5, repeat: Infinity }}>
            AlzDetect
          </motion.span>
        </motion.h1>

        <motion.p className="text-xl text-gray-600 mb-8 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Early detection can help slow the progression of Alzheimer's disease. Take control of your brain health today with our AI-powered analysis.
        </motion.p>

        <div className="flex gap-4 flex-wrap">
          <motion.button onClick={() => handleNavigation('/cognitive-test')} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-xl" whileHover={{ scale: 1.05 }}>
            Start Your Assessment →
          </motion.button>

          <Link to="/upload-mri" className="px-6 py-4 bg-white border border-gray-200 rounded-full text-gray-800 font-semibold shadow-sm">
            Upload MRI
          </Link>
        </div>
      </motion.div>

      {/* Animated Doctor Illustration */}
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
        <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
          <svg viewBox="0 0 400 400" className="w-full h-auto">
            <motion.g animate={{ x: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <ellipse cx="200" cy="280" rx="60" ry="80" fill="#6366f1" />
              <circle cx="200" cy="180" r="40" fill="#fbbf24" />
              <path d="M 160 170 Q 200 150 240 170" fill="#374151" />
              <rect x="170" y="220" width="60" height="80" fill="white" opacity="0.95" rx="5" />
              <motion.path d="M 190 240 Q 180 260 190 280" stroke="#374151" strokeWidth="3" fill="none" animate={{ d: ["M190 240 Q180 260 190 280", "M190 240 Q185 260 195 280", "M190 240 Q180 260 190 280"] }} transition={{ duration: 2, repeat: Infinity }} />
              <circle cx="190" cy="285" r="8" fill="#ef4444" />
              <motion.ellipse cx="150" cy="260" rx="15" ry="50" fill="#6366f1" animate={{ rotate: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: "150px 240px" }} />
              <motion.ellipse cx="250" cy="260" rx="15" ry="50" fill="#6366f1" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} style={{ transformOrigin: "250px 240px" }} />
            </motion.g>

            {/* MRI Machine */}
            <motion.g animate={{ x: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <rect x="280" y="200" width="80" height="100" fill="#cbd5e1" rx="10" />
              <rect x="290" y="210" width="60" height="80" fill="#475569" rx="5" />
              <motion.rect x="295" y="215" width="50" height="5" fill="#22d3ee" animate={{ y: [215, 280, 215], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              <circle cx="320" cy="320" r="8" fill="#ef4444" />
              <circle cx="340" cy="320" r="8" fill="#22c55e" />
            </motion.g>

            {/* Brain scan floating */}
            <motion.g animate={{ y: [0, -15, 0], rotate: [0, 6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <circle cx="100" cy="150" r="35" fill="#a855f7" opacity="0.28" />
              <path d="M 80 150 Q 100 130 120 150 Q 100 170 80 150" fill="#a855f7" opacity="0.6" />
            </motion.g>

            <motion.text x="50" y="250" fontSize="30" animate={{ y: [250, 240, 250], rotate: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
              🩺
            </motion.text>
            <motion.text x="340" y="150" fontSize="30" animate={{ y: [150, 140, 150], rotate: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
              🧠
            </motion.text>
          </svg>
        </motion.div>

        <motion.div className="absolute inset-0 rounded-full blur-3xl opacity-20" animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.28, 0.15] }} transition={{ duration: 4, repeat: Infinity }} style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.25), rgba(236,72,153,0.25))' }} />
      </motion.div>
    </div>
  );
}
