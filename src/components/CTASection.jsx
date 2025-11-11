import React from 'react';
import { motion } from 'framer-motion';

export default function CTASection({ handleNavigation }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-16 text-center text-white relative overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-20 bg-white rounded-full opacity-10"
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: i * 0.5 }}
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        />
      ))}

      <motion.h2 className="text-4xl font-bold mb-6 relative z-10" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        Ready to Begin Your Assessment?
      </motion.h2>
      <p className="text-xl mb-10 opacity-90 relative z-10">Our advanced AI technology combined with medical expertise provides accurate insights</p>
      <motion.button onClick={() => handleNavigation('/cognitive-test')} className="px-10 py-5 bg-white text-purple-600 font-bold rounded-full shadow-xl relative z-10" whileHover={{ scale: 1.08, y: -5 }}>
        Start Cognitive Test Now →
      </motion.button>
    </motion.div>
  );
}
