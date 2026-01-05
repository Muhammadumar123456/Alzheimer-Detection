import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle, ArrowLeft, AlertCircle, Loader2, X } from "lucide-react";

export default function UploadMRI() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file (JPG, PNG, etc.)");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    // Simulate upload and analysis
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);

      // Redirect to results after 1.5 seconds
      setTimeout(() => {
        navigate("/results", {
          state: {
            uploadedFile: selectedFile.name,
            analysisResult: "completed",
            // Mock result data
            score: 78,
            total: 100
          }
        });
      }, 1500);
    }, 2000);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setUploaded(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Back Button */}
      <div className="w-full bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">Upload MRI Scan</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-100 rounded-full">
              <Upload className="w-10 h-10 text-indigo-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Upload MRI Scan
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Please upload your brain MRI image for AI-based Alzheimer's detection analysis.
          </p>

          {/* File Upload Area */}
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="block w-full p-8 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-indigo-50/50 hover:bg-indigo-50"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-12 h-12 text-indigo-600" />
                <p className="text-lg font-medium text-gray-700">
                  {selectedFile ? "Change file" : "Click to select MRI image"}
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG (Max 10MB)
                </p>
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* File Preview and Details */}
          {selectedFile && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-6 bg-gray-50 rounded-xl"
            >
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                {preview && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={preview}
                      alt="MRI Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      onClick={clearFile}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* File Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">Selected File:</h3>
                  <p className="text-sm text-gray-700 break-all mb-1">
                    <span className="font-medium">Name:</span> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Size:</span> {formatFileSize(selectedFile.size)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Type:</span> {selectedFile.type}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload Button */}
          <motion.button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || uploaded}
            whileHover={!uploading && !uploaded ? { scale: 1.02 } : {}}
            whileTap={!uploading && !uploaded ? { scale: 0.98 } : {}}
            className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${uploading || uploaded
                ? "bg-gray-400 cursor-not-allowed"
                : selectedFile
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading & Analyzing...</span>
              </>
            ) : uploaded ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Upload Successful!</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload & Analyze</span>
              </>
            )}
          </motion.button>

          {/* Success Message */}
          {uploaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Analysis complete! Redirecting to results...</span>
            </motion.div>
          )}

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> This is an educational FYP project.
              Results are simulated and should not be used for actual medical diagnosis.
              Please consult a healthcare professional for medical advice.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
/ /   c o m m i t :   U p l o a d M R I   w i t h   d r a g - a n d - d r o p ,   p r e v i e w ,   v a l i d a t i o n  
 