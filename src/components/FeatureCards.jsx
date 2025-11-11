import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCards({ features, handleNavigation }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 60, rotateX: -12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: index * 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
          whileHover={{ y: -12, scale: 1.03 }}
          className="relative group perspective-1000"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div className="bg-white rounded-3xl shadow-xl p-8 h-full border border-transparent hover:border-indigo-200 transition-all relative overflow-hidden" whileHover={{ boxShadow: "0 25px 50px -12px rgba(99,102,241,0.2)" }}>
            <motion.div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }} />

            <motion.div className="absolute -top-4 -right-4 text-6xl" animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              {feature.emoji}
            </motion.div>

            <motion.div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 relative z-10`} whileHover={{ scale: 1.2, rotate: 360, transition: { duration: 0.6 } }}>
              <feature.icon className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-800 mb-3 relative z-10">{feature.title}</h3>
            <p className="text-gray-600 mb-6 relative z-10">{feature.description}</p>

            <button onClick={() => handleNavigation(feature.action)} className={`w-full py-3 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-2xl shadow-lg relative z-10`}>
              Get Started
            </button>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
