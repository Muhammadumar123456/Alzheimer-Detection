import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, CheckCircle, Brain, Sparkles, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth(); // Get signup function from AuthContext
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ============================================================================
  // SIGNUP HANDLER: Real signup logic with validation and error handling
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validation checks
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      // Call the signup function from AuthContext
      await signup(form.name, form.email, form.password);

      // Success: Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Handle errors (validation, network, etc.)
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Particles
  const particles = [...Array(15)].map((_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    duration: Math.random() * 10 + 10
  }));

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-purple-200 via-indigo-100 to-purple-300 p-4 overflow-hidden relative">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full opacity-20"
          style={{ width: particle.size, height: particle.size, left: particle.left, top: '-10%' }}
          animate={{ y: ['0vh', '110vh'], x: [0, Math.random() * 100 - 50], opacity: [0, 0.5, 0] }}
          transition={{ duration: particle.duration, repeat: Infinity, delay: parseFloat(particle.animationDelay) }}
        />
      ))}
      <motion.div
        className="absolute top-10 left-10 text-indigo-300 opacity-20"
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
      >
        <Brain size={80} />
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-purple-300 opacity-20"
        animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
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
          <motion.div
            className="absolute w-64 h-64 bg-indigo-200 rounded-full opacity-30"
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-48 h-48 bg-purple-200 rounded-full opacity-30"
            animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 30, 0] }}
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

        {/* Right Form */}
        <div className="md:w-1/2 w-full p-8 md:p-10 flex flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2 text-center md:text-left">
              Create Account
            </motion.h2>
            <motion.p
              className="text-gray-600 mb-6 text-center md:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Join us in the fight against Alzheimer's
            </motion.p>
          </motion.div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {['name', 'email', 'password', 'confirmPassword'].map((field, i) => {
              const labels = { name: 'Full Name', email: 'Email', password: 'Password', confirmPassword: 'Confirm Password' };
              const icons = {
                name: <User size={16} className="text-indigo-600" />,
                email: <Mail size={16} className="text-indigo-600" />,
                password: <Lock size={16} className="text-indigo-600" />,
                confirmPassword: <Lock size={16} className="text-indigo-600" />
              };
              const types = { name: 'text', email: 'email', password: 'password', confirmPassword: 'password' };
              return (
                <motion.div
                  key={field}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    {icons[field]} {labels[field]}
                  </label>
                  <motion.input
                    type={types[field]}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={field === 'name' ? 'John Doe' : field === 'email' ? 'you@example.com' : '••••••••'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                    whileFocus={{ scale: 1.02, borderColor: '#6366f1' }}
                    required
                  />
                </motion.div>
              );
            })}

            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 flex items-center gap-1">
                I agree to the <a href="/terms" className="text-indigo-600 hover:underline">terms & conditions</a>
              </label>
            </motion.div>

            <motion.button
              type="submit"
              className={`w-full py-3 mt-2 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white font-semibold rounded-xl shadow-md transition relative overflow-hidden`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={!loading ? { scale: 1.03, boxShadow: "0 10px 30px rgba(99,102,241,0.4)" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign Up <CheckCircle size={18} />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          <motion.p
            className="text-center text-gray-500 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Already have an account? <a href="/login" className="text-indigo-600 hover:underline font-medium">Sign In</a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
