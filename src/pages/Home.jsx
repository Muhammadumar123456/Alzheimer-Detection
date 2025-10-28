import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div
      className="relative min-h-screen w-screen overflow-x-hidden bg-fixed bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/png-vector/20230728/ourlarge/pngtree-neurosurgeon-clipart-cartoon-character-of-brain-doctor-with-brain-vector-png-image_6809995.png')",
      }}
    >
      {/* Purple Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700/80 via-indigo-700/80 to-purple-500/80" />

      {/* Top Navbar */}
      <header className="relative z-20 w-full flex items-center justify-between px-6 py-4 bg-white/20 backdrop-blur-md shadow-md">
        <h1 className="text-2xl font-bold text-white tracking-wide">🧠 Alzheimer Detection</h1>

        <nav className="hidden md:flex space-x-8 text-white font-medium">
          <Link to="/home" className="hover:text-indigo-200 transition">Home</Link>
          <Link to="/contact" className="hover:text-indigo-200 transition">Contact Us</Link>
          <Link to="/about" className="hover:text-indigo-200 transition">About</Link>
          <Link to="/help" className="hover:text-indigo-200 transition">Help</Link>
        </nav>

        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden text-white hover:text-indigo-200 transition"
          aria-label="Open menu"
        >
          <Menu size={28} />
        </button>
      </header>

      {/* Side Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="w-64 bg-white h-full shadow-xl p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-indigo-700">Menu</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-600 hover:text-indigo-600">
                <X size={22} />
              </button>
            </div>

            <Link to="/profile" className="text-gray-800 hover:text-indigo-600 transition">Profile</Link>
            <Link to="/settings" className="text-gray-800 hover:text-indigo-600 transition">Settings</Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 transition text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Center Section */}
      <main className="relative z-10 w-full flex flex-col justify-center items-center text-center min-h-[80vh] p-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-white mb-12 drop-shadow-lg max-w-4xl"
        >
          Welcome to the Alzheimer Detection Portal
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Upload MRI */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/upload")}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg"
          >
            Upload MRI
          </motion.button>

          {/* Cognitive Test */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/test")}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl shadow-lg"
          >
            Cognitive Test
          </motion.button>

          {/* Results */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/results")}
            className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-2xl shadow-lg"
          >
            View Results
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
