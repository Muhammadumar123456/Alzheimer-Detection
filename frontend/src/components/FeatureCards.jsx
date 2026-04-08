import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCards({ features, handleNavigation }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      {features.map((feature, index) => {
        const Icon = feature.icon;

        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 60, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: index * 0.15, duration: 0.8, type: "spring", stiffness: 100 }}
            whileHover={{ y: -12, scale: 1.03 }}
            className="relative group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div className="bg-white rounded-2xl shadow-xl p-7 h-full border border-transparent hover:border-indigo-200 transition-all relative overflow-hidden" whileHover={{ boxShadow: "0 25px 50px -12px rgba(99,102,241,0.2)" }}>
              <motion.div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }} />
              <motion.div className="absolute -top-4 -right-4 text-5xl" animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                {feature.emoji}
              </motion.div>
              <motion.div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 relative z-10`} whileHover={{ scale: 1.2, rotate: 360, transition: { duration: 0.6 } }}>
                <Icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">{feature.title}</h3>
              <p className="text-gray-600 mb-5 text-sm relative z-10">{feature.description}</p>
              <button onClick={() => handleNavigation(feature.action)} className={`w-full py-2.5 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-xl shadow-lg relative z-10 text-sm`}>
                Get Started
              </button>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
