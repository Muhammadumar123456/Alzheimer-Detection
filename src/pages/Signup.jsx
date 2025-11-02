import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, CheckCircle, Brain, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!acceptedTerms) {
      alert("Please accept the terms and conditions.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // TODO: real signup flow. Demo navigates to home after submit
    navigate("/home");
  }

  // Floating particles animation
  const particles = [...Array(15)].map((_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    duration: Math.random() * 10 + 10
  }));

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-purple-200 via-indigo-100 to-purple-300 p-4 overflow-hidden relative">
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: '-10%'
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.random() * 100 - 50],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: parseFloat(particle.animationDelay)
          }}
        />
      ))}

      {/* Animated Brain Icons */}
      <motion.div
        className="absolute top-10 left-10 text-indigo-300 opacity-20"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity }}
      >
        <Brain size={80} />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-purple-300 opacity-20"
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 15, repeat: Infinity }}
      >
        <Sparkles size={60} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full relative z-10"
      >
        {/* Left Image Section */}
        <motion.div 
          className="md:w-1/2 hidden md:flex justify-center items-center bg-gradient-to-br from-purple-100 to-indigo-100 relative overflow-hidden"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Animated circles in background */}
          <motion.div
            className="absolute w-64 h-64 bg-indigo-200 rounded-full opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-48 h-48 bg-purple-200 rounded-full opacity-30"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <motion.img
            src="https://img.freepik.com/free-vector/autism-man-disorder-illustration-isolated_24911-115123.jpg?w=740"
            alt="Alzheimer Awareness"
            className="w-3/4 h-auto rounded-2xl shadow-lg relative z-10"
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          />
        </motion.div>

        {/* Right Form Section */}
        <div className="md:w-1/2 w-full p-8 md:p-10 flex flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2 text-center md:text-left"
              animate={{ 
                backgroundPosition: ['0%', '100%'],
              }}
            >
              Create Account
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-6 text-center md:text-left"
            >
              Join us in the fight against Alzheimer's
            </motion.p>
          </motion.div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <User size={16} className="text-indigo-600" />
                Full Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: '#6366f1' }}
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                required
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-indigo-600" />
                Email
              </label>
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: '#6366f1' }}
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Lock size={16} className="text-indigo-600" />
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: '#6366f1' }}
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                required
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Lock size={16} className="text-indigo-600" />
                Confirm Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: '#6366f1' }}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                required
              />
            </motion.div>

            {/* Terms & Conditions */}
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
                />
              </motion.div>
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-gray-600 flex items-center gap-1"
              >
                I agree to the{" "}
                <motion.a
                  href="/terms"
                  className="text-indigo-600 hover:underline"
                  whileHover={{ scale: 1.05 }}
                >
                  terms & conditions
                </motion.a>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition relative overflow-hidden group"
            >
              <motion.span className="relative z-10 flex items-center justify-center gap-2">
                Sign Up
                <CheckCircle size={18} />
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
              />
            </motion.button>
          </form>

          <motion.p 
            className="text-center text-gray-500 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Already have an account?{" "}
            <motion.a 
              href="/login" 
              className="text-indigo-600 hover:underline font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Sign In
            </motion.a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}