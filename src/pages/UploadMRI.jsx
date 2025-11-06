import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle } from "lucide-react";

export default function UploadMRI() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
    // Simulate upload
    setTimeout(() => {
      setUploaded(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl text-center"
      >
        <div className="flex justify-center mb-6">
          <Upload className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Upload MRI Scan
        </h2>
        <p className="text-gray-600 mb-6">
          Please upload your MRI image for AI-based analysis.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 border border-gray-300 rounded-lg px-3 py-2 w-full"
        />

        <motion.button
          onClick={handleUpload}
          whileHover={{ scale: 1.05 }}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700"
        >
          Upload
        </motion.button>

        {uploaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center justify-center gap-2 text-green-600"
          >
            <CheckCircle className="w-6 h-6" />
            <span>Upload successful! Analysis in progress...</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
