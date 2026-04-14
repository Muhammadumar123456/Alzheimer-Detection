import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle, AlertCircle, Loader2, X, ImagePlus, Trash2 } from "lucide-react";
import { apiUpload } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function UploadMRI() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [error, setError] = useState("");

    const MAX_FILES = 4;
    const MAX_SIZE = 50 * 1024 * 1024;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setError("");

        if (files.length === 0) return;

        const totalFiles = selectedFiles.length + files.length;
        if (totalFiles > MAX_FILES) {
            setError(`You can upload up to ${MAX_FILES} images at a time. You already have ${selectedFiles.length} selected.`);
            return;
        }

        const validFiles = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError("Please select valid image files (JPG, PNG, etc.)");
                return;
            }
            if (file.size > MAX_SIZE) {
                setError(`File "${file.name}" exceeds 50MB limit`);
                return;
            }
            validFiles.push(file);
        }

        const newPreviews = [];
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === validFiles.length) {
                    setPreviews((prev) => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setSelectedFiles((prev) => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
        setError("");
        setUploaded(false);
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setPreviews([]);
        setError("");
        setUploaded(false);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError("Please select at least one file");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append('mriFiles', file);
            });

            const response = await apiUpload('/upload/mri', formData);
            const savedFiles = response.data?.files || [];

            setUploaded(true);
            showToast(`${selectedFiles.length} MRI scan(s) uploaded successfully!`, 'success');

            setTimeout(() => {
                navigate("/cognitive-test", { state: { mriUploadId: savedFiles[0]?.id } });
            }, 1500);
        } catch (err) {
            setError(err.message || "Upload failed. Please try again.");
            showToast("Upload failed. Please try again.", "error");
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dt = e.dataTransfer;
        if (dt.files && dt.files.length > 0) {
            const fakeEvent = { target: { files: dt.files } };
            handleFileChange(fakeEvent);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-indigo-100 rounded-full">
                        <Upload className="w-10 h-10 text-indigo-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Upload MRI Scans</h2>
                <p className="text-gray-600 mb-8 text-center">
                    Upload up to {MAX_FILES} brain MRI images for AI-based Alzheimer's detection analysis.
                </p>

                {/* Drop Zone */}
                <div className="mb-6"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <label htmlFor="file-upload" className="block w-full p-8 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-indigo-50/50 hover:bg-indigo-50">
                        <div className="flex flex-col items-center gap-3">
                            <ImagePlus className="w-12 h-12 text-indigo-600" />
                            <p className="text-lg font-medium text-gray-700">
                                {selectedFiles.length > 0 ? "Add more images" : "Click or drag & drop MRI images"}
                            </p>
                            <p className="text-sm text-gray-500">Supported: JPG, PNG (Max 50MB each, up to {MAX_FILES} files)</p>
                            {selectedFiles.length > 0 && (
                                <span className="text-sm font-medium text-indigo-600">{selectedFiles.length} / {MAX_FILES} selected</span>
                            )}
                        </div>
                    </label>
                    <input id="file-upload" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                </div>

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Preview Grid */}
                {selectedFiles.length > 0 && !error && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-800">Selected Files ({selectedFiles.length})</h3>
                            <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                                <Trash2 className="w-4 h-4" /> Clear All
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="relative group bg-gray-50 rounded-xl p-2 border border-gray-200">
                                    {previews[index] && (
                                        <img src={previews[index]} alt={`MRI ${index + 1}`} className="w-full h-28 object-cover rounded-lg" />
                                    )}
                                    <button onClick={() => removeFile(index)} className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-md opacity-0 group-hover:opacity-100">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <p className="text-xs text-gray-600 mt-2 truncate font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Upload Button */}
                <motion.button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || uploading || uploaded}
                    whileHover={!uploading && !uploaded && selectedFiles.length > 0 ? { scale: 1.02 } : {}}
                    whileTap={!uploading && !uploaded && selectedFiles.length > 0 ? { scale: 0.98 } : {}}
                    className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${uploading || uploaded ? "bg-gray-400 cursor-not-allowed text-white" : selectedFiles.length > 0 ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-300 cursor-not-allowed text-gray-500"}`}
                >
                    {uploading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading {selectedFiles.length} file(s)...</span></>
                    ) : uploaded ? (
                        <><CheckCircle className="w-5 h-5" /><span>Upload Successful!</span></>
                    ) : (
                        <><Upload className="w-5 h-5" /><span>Upload & Begin Assessment ({selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''})</span></>
                    )}
                </motion.button>

                {/* Success */}
                {uploaded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Upload complete! Redirecting to cognitive test...</span>
                    </motion.div>
                )}

                {/* Info Note */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note:</span> This is an educational FYP project. ML-based analysis will be available once the model is integrated. Currently, files are securely uploaded for future processing.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
