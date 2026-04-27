import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer className="bg-white border-t border-gray-200 mt-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-gray-700">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">AlzDetect</span>
          </div>
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} AlzDetect. All rights reserved.</p>
          <p className="text-xs text-gray-400">Early detection saves lives &mdash; FYP Project</p>
        </div>
      </div>
    </motion.footer>
  );
}