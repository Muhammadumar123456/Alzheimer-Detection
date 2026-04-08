import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Brain } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { value: '70%', label: 'Better outcomes with early detection', icon: 'Heart' },
    { value: '5-10 yrs', label: 'Years of symptom management possible', icon: 'Shield' },
    { value: '100%', label: 'Confidential and secure analysis', icon: 'Brain' }
  ];

  const iconMap = { Heart, Shield, Brain };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-12 mb-20"
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Early Detection Matters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, type: "spring" }}
              whileHover={{ scale: 1.04, y: -8 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <IconComponent className="w-16 h-16 text-purple-600" />
              </motion.div>
              <motion.div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                {stat.value}
              </motion.div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
