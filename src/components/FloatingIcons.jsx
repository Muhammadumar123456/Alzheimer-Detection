import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingIcons({ icons }) {
  return (
    <div className="relative mb-16 min-h-[140px]">
      <div className="flex justify-center items-center gap-6 flex-wrap">
        {icons.map((item, index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -18, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
            whileHover={{ scale: 1.12, rotateY: 180, transition: { duration: 0.3 } }}
            className={`w-28 h-28 bg-gradient-to-br ${item.color} rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div className="text-white text-5xl" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              {item.emoji}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
