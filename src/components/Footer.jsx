import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer className="bg-white border-t border-gray-200 mt-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p>© 2024 AlzDetect. All rights reserved.</p>
          <p className="text-sm mt-2">Early detection saves lives</p>
        </div>
      </div>
    </motion.footer>
  );
}
