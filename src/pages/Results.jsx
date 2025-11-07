import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Smile, Frown, ArrowLeft } from "lucide-react";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { score = 0, total = 1 } = location.state || {};
  const percentage = (score / total) * 100;
  const isHealthy = percentage >= 70;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl text-center"
      >
        <div className="flex justify-center mb-6">
          <BarChart3 className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Cognitive Test Results
        </h2>

        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className={`mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-full ${
            isHealthy ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isHealthy ? (
            <Smile className="w-12 h-12 text-green-600" />
          ) : (
            <Frown className="w-12 h-12 text-red-600" />
          )}
        </motion.div>

        <p className="text-lg font-medium text-gray-700 mb-4">
          You scored <span className="font-bold text-indigo-600">{score}</span> out of{" "}
          <span className="font-bold">{total}</span>
        </p>

        <p
          className={`mb-8 ${
            isHealthy ? "text-green-700" : "text-red-700"
          } font-medium`}
        >
          {isHealthy
            ? "Your cognitive health seems normal!"
            : "Possible cognitive decline detected. Please consult a specialist."}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/home")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-5 h-5" /> Go Back Home
        </motion.button>
      </motion.div>
    </div>
  );
}
