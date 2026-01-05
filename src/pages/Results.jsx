import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Smile, Frown, AlertTriangle, ArrowLeft, Home, FileText } from "lucide-react";

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle both cognitive test results and MRI upload results
  const { score = 0, total = 1, uploadedFile = null, analysisResult = null } = location.state || {};

  const percentage = (score / total) * 100;

  // Determine risk level
  let riskLevel, riskColor, riskIcon, riskMessage;

  if (percentage >= 80) {
    riskLevel = "Low Risk";
    riskColor = "green";
    riskIcon = <Smile className="w-16 h-16 text-green-600" />;
    riskMessage = "Your cognitive health appears to be normal. Continue maintaining a healthy lifestyle.";
  } else if (percentage >= 60) {
    riskLevel = "Moderate Risk";
    riskColor = "yellow";
    riskIcon = <AlertTriangle className="w-16 h-16 text-yellow-600" />;
    riskMessage = "Some indicators suggest monitoring may be beneficial. Consider consulting a healthcare professional.";
  } else {
    riskLevel = "Higher Risk";
    riskColor = "red";
    riskIcon = <Frown className="w-16 h-16 text-red-600" />;
    riskMessage = "Results suggest further evaluation is recommended. Please consult a healthcare specialist for proper assessment.";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="w-full bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Analysis Results</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-3xl"
        >
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-100 rounded-full">
              <BarChart3 className="w-10 h-10 text-indigo-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {uploadedFile ? "MRI Analysis Results" : "Cognitive Test Results"}
          </h2>

          {uploadedFile && (
            <p className="text-gray-600 mb-6 text-center">
              Analysis for: <span className="font-semibold text-indigo-600">{uploadedFile}</span>
            </p>
          )}

          {/* Risk Level Display */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`mx-auto mb-8 p-8 rounded-2xl ${riskColor === "green" ? "bg-green-50 border-2 border-green-200" :
                riskColor === "yellow" ? "bg-yellow-50 border-2 border-yellow-200" :
                  "bg-red-50 border-2 border-red-200"
              }`}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                {riskIcon}
              </motion.div>

              <h3 className={`text-2xl font-bold ${riskColor === "green" ? "text-green-700" :
                  riskColor === "yellow" ? "text-yellow-700" :
                    "text-red-700"
                }`}>
                {riskLevel}
              </h3>

              <div className="text-center">
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Assessment Score: <span className="font-bold text-indigo-600">{score}</span> / {total}
                </p>
                <p className="text-3xl font-bold text-gray-800">{percentage.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>

          {/* Detailed Message */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Interpretation:
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {riskMessage}
            </p>
          </div>

          {/* Recommendations */}
          <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-3">Recommendations:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Maintain a healthy diet rich in omega-3 fatty acids and antioxidants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Engage in regular physical exercise (at least 30 minutes daily)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Keep your mind active with puzzles, reading, and social activities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Get adequate sleep (7-8 hours per night)</span>
              </li>
              {percentage < 80 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="font-semibold text-red-700">
                    Consult with a neurologist or healthcare professional for a comprehensive evaluation
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Important Disclaimer */}
          <div className="mb-8 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Important Disclaimer
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              This is an <strong>educational FYP project</strong> and the results are <strong>simulated for demonstration purposes only</strong>.
              This system is NOT a substitute for professional medical diagnosis.
              For actual health concerns, please consult a qualified healthcare provider or neurologist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/home")}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Back Home
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(uploadedFile ? "/upload-mri" : "/cognitive-test")}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl shadow hover:bg-gray-300 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Take Another Test
            </motion.button>
          </div>

          {/* Secondary Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Analysis completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}/ /   c o m m i t :   R e s u l t s   p a g e   w i t h   r i s k   l e v e l s ,   r e c o m m e n d a t i o n s ,   t i m e s t a m p  
 