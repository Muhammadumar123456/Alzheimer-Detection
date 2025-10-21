import { motion } from "framer-motion";

export default function SignUp() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full"
      >
        {/* Left Image Section */}
        <div className="md:w-1/2 w-full">
          <img
            src="https://img.freepik.com/free-vector/autism-man-disorder-illustration-isolated_24911-115123.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Alzheimer Awareness"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="md:w-1/2 w-full p-10 flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-indigo-700 mb-6 text-center md:text-left"
          >
            Create Your Account
          </motion.h2>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              Sign Up
            </motion.button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Sign In
            </a>
          </p>

          
{/* OR Divider */}
<div className="flex items-center my-4">
  <hr className="flex-grow border-gray-300" />
  <span className="mx-3 text-gray-500 text-sm">or</span>
  <hr className="flex-grow border-gray-300" />
</div>

{/* Google Sign Up Button */}
<div className="flex justify-center">
  <button className="flex items-center px-6 py-2 bg-white text-black border border-gray-300 rounded-xl hover:bg-gray-100 transition">
    <img
      src="https://www.svgrepo.com/show/475656/google-color.svg"
      alt="Google"
      className="w-5 h-5 mr-2"
    />
    Sign up with Google
  </button>
</div>
   </div>
      </motion.div>
    </div>
  );
}