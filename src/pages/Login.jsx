import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Brain, Sparkles, Zap, Heart } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    // TODO: validate / call API — demo navigates to home
    navigate("/home");
  }

  // Floating particles
  const particles = [...Array(12)].map((_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 15 + 10
  }));

  return (
    <div
      className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-purple-300 via-purple-200 to-purple-50 p-6 overflow-hidden relative"
      style={{ minHeight: "100vh" }}
    >
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
            x: [0, Math.random() * 80 - 40],
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Floating decorative icons */}
      <motion.div
        className="absolute top-20 left-20 text-purple-400 opacity-20"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.3, 1],
          y: [0, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity }}
      >
        <Brain size={70} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-20 text-indigo-400 opacity-20"
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.4, 1],
          x: [0, 20, 0]
        }}
        transition={{ duration: 18, repeat: Infinity }}
      >
        <Sparkles size={60} />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-10 text-purple-300 opacity-15"
        animate={{ 
          rotate: [0, 180, 360],
          y: [0, 30, 0]
        }}
        transition={{ duration: 12, repeat: Infinity }}
      >
        <Zap size={50} />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 left-10 text-pink-300 opacity-15"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        <Heart size={55} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full mx-auto relative z-10"
      >
        {/* Left Image Section */}
        <motion.div 
          className="md:w-1/2 w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-8 relative overflow-hidden"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Animated background circles */}
          <motion.div
            className="absolute w-80 h-80 bg-indigo-200 rounded-full opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 40, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-60 h-60 bg-purple-200 rounded-full opacity-20"
            animate={{
              scale: [1, 1.4, 1],
              x: [0, -30, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />

          <motion.img
            src="https://img.freepik.com/free-vector/autism-man-disorder-illustration-isolated_24911-115123.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Login Illustration"
            className="max-w-[80%] h-auto object-contain relative z-10"
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            whileHover={{ scale: 1.05, rotate: 3 }}
          />
        </motion.div>

        {/* Right Form Section */}
        <div className="md:w-1/2 w-full p-10 flex flex-col justify-center bg-gradient-to-br from-white to-indigo-50 relative">
          {/* Decorative animated circles */}
          <motion.div
            className="absolute top-0 right-0 w-40 h-40 bg-purple-200 rounded-full opacity-10"
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl font-bold text-indigo-700 mb-2 text-center md:text-left"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Welcome Back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-8 text-center md:text-left"
            >
              Log in to continue your health journey
            </motion.p>
          </motion.div>

          <div className="space-y-5">
            {/* Email Input */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={16} className="text-indigo-600" />
                Email
              </label>
              <motion.input
                whileFocus={{ 
                  scale: 1.02, 
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Lock size={16} className="text-indigo-600" />
                Password
              </label>
              <motion.input
                whileFocus={{ 
                  scale: 1.02, 
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
              />
            </motion.div>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-right"
            >
              <motion.a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
                whileHover={{ scale: 1.05, x: 5 }}
              >
                Forgot Password?
              </motion.a>
            </motion.div>

            {/* Login Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 15px 35px rgba(99, 102, 241, 0.4)"
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogin}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition relative overflow-hidden group"
            >
              <motion.span className="relative z-10 flex items-center justify-center gap-2">
                Log In
                <LogIn size={18} />
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>

          <motion.p 
            className="text-center text-gray-500 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Don't have an account?{" "}
            <motion.a 
              href="/signup" 
              className="text-indigo-600 hover:underline font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Sign Up
            </motion.a>
          </motion.p>

          {/* OR Divider */}
          <motion.div 
            className="flex items-center my-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </motion.div>

          {/* Google Sign In Button */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button 
              className="flex items-center px-6 py-2 bg-white text-black border border-gray-300 rounded-xl hover:bg-gray-100 transition relative overflow-hidden group"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">Sign in with Google</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}