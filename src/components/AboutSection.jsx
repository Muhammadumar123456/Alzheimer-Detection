import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, Target, Award, BookOpen, Lightbulb } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms for accurate detection"
    },
    {
      icon: Target,
      title: "Early Detection",
      description: "Identify potential risks in early stages for better outcomes"
    },
    {
      icon: Award,
      title: "Research-Based",
      description: "Built on established medical research and cognitive science"
    }
  ];

  const teamMembers = [
    {
      name: "Development Team",
      role: "Final Year Project",
      description: "Computer Science Students"
    }
  ];

  return (
    <motion.section
      id="about"
      className="mt-16 py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="space-y-12">
        {/* Main About Card */}
        <motion.div
          initial={{ y: 40 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-purple-100 rounded-full">
              <Brain className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            About AlzDetect
          </h2>

          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto leading-relaxed mb-8">
            AlzDetect is an innovative platform designed to assist in the early detection of Alzheimer's disease.
            Combining advanced AI technology with cognitive assessments, we aim to provide accessible screening
            tools that can help identify potential risks and encourage timely medical intervention.
          </p>

          {/* Project Context */}
          <div className="bg-indigo-50 rounded-xl p-6 border-l-4 border-indigo-500">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-indigo-900 mb-2">Final Year Project (FYP)</h3>
                <p className="text-gray-700 leading-relaxed">
                  This system is developed as a Final Year Project to demonstrate the application of
                  artificial intelligence and web technologies in healthcare. The project focuses on creating
                  an accessible, user-friendly platform for Alzheimer's disease screening and cognitive assessment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Objectives */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-indigo-600" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Project Objectives</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Early Detection Support</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Provide accessible tools for early screening and risk assessment of Alzheimer's disease
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">AI-Powered Analysis</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Integrate machine learning models for analyzing MRI scans and cognitive test results
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">User-Friendly Interface</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Create an intuitive, responsive platform accessible to users of all technical backgrounds
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Educational Impact</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Raise awareness about Alzheimer's disease and the importance of cognitive health
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Key Features</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full shadow-md mb-4">
                    <feature.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-purple-600" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Development Team</h3>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-1">FYP Development Team</h4>
                <p className="text-indigo-600 font-medium mb-3">Computer Science Students</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dedicated team of final year students working on innovative healthcare solutions
                  using artificial intelligence and modern web technologies.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-6 md:p-8"
        >
          <h4 className="font-bold text-amber-900 mb-3 text-lg">⚠️ Important Notice</h4>
          <p className="text-amber-800 leading-relaxed">
            <strong>This is an educational project</strong> developed for academic purposes.
            While the system demonstrates AI capabilities in healthcare, it is <strong>not intended
              for actual medical diagnosis</strong>. Results shown are simulated for demonstration purposes.
            For any health concerns, please consult qualified healthcare professionals.
          </p>
        </motion.div>

        {/* University Context */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6 text-center"
        >
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">Academic Project</span> •
            Final Year Project (FYP) •
            2026 •
            Computer Science Department
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
/ /   c o m m i t :   A b o u t S e c t i o n   w i t h   F Y P   c o n t e x t ,   o b j e c t i v e s ,   t e a m   i n f o  
 