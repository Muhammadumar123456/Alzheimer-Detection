import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <motion.section id="about" className="mt-16 py-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <motion.div initial={{ y: 40 }} whileInView={{ y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-xl p-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">About AlzDetect</h2>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
          AlzDetect is a cutting-edge platform designed to help detect Alzheimer's disease in its early stages.
          Using advanced AI technology and medical expertise, we provide comprehensive assessments to help patients
          and doctors make informed decisions about brain health.
        </p>
      </motion.div>
    </motion.section>
  );
}
