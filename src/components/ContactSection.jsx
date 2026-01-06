import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';

export default function ContactSection() {
  return (
    <motion.section id="contact" className="mt-24 py-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <motion.div initial={{ y: 40 }} whileInView={{ y: 0 }} viewport={{ once: true }} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-12">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="flex items-center gap-4 p-6 rounded-2xl hover:bg-purple-50 transition-colors">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-md">
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">Email</p>
              <p className="text-gray-600">support@alzdetect.com</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="flex items-center gap-4 p-6 rounded-2xl hover:bg-pink-50 transition-colors">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center shadow-md">
              <Phone className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">Phone</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
