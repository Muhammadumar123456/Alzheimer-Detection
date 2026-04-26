import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Edit3, MapPin, Check, X, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiPut } from "../utils/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "John Doe");
  const [loading, setLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileData = {
    email: user?.email || "john.doe@example.com",
    role: user?.role || "User",
    joined: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "January 2026",
    location: "Not Specified"
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await apiPut('/user/profile', { name: editName });
      updateUser(response.data);
      showToast("Profile updated successfully", "success");
      setIsEditing(false);
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      await apiPut('/auth/change-password', { currentPassword, newPassword });
      showToast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8"
      >
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
        
        <div className="px-8 pb-12">
          {/* Avatar & Basic Info */}
          <div className="relative flex flex-col items-center -mt-16 mb-8 md:flex-row md:items-end md:gap-6">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-indigo-600">
                <User size={64} strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4 text-center md:text-left md:mb-2 flex-grow">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-3xl font-black text-slate-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent w-full max-w-sm"
                  autoFocus
                />
              ) : (
                <h1 className="text-3xl font-black text-slate-900">{user?.name || "John Doe"}</h1>
              )}
              <p className="text-indigo-600 font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                <Shield size={16} /> {profileData.role === 'admin' ? 'Administrator' : 'Health Partner'}
              </p>
            </div>
            <div className="md:ml-auto md:mb-2 mt-4 md:mt-0 flex gap-2">
              {isEditing ? (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsEditing(false); setEditName(user?.name); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-colors"
                    disabled={loading}
                  >
                    <X size={16} /> Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                  </motion.button>
                </>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  <Edit3 size={16} /> Edit Profile
                </motion.button>
              )}
            </div>
          </div>

          <hr className="border-slate-100 mb-10" />

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-700 opacity-80 cursor-not-allowed" title="Email address cannot be changed">
                  <Mail size={18} className="text-indigo-500" />
                  <span className="font-medium">{profileData.email}</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-700">
                  <MapPin size={18} className="text-indigo-500" />
                  <span className="font-medium">{profileData.location}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Member Since</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-700">
                  <Calendar size={18} className="text-indigo-500" />
                  <span className="font-medium">{profileData.joined}</span>
                </div>
              </div>

              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-slate-600 text-sm leading-relaxed">
                "Early detection is the first step toward a healthier tomorrow. Thank you for being part of the AlzDetect community."
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Section (Change Password) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Lock className="text-indigo-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Security Settings</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Enter current password"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={passwordLoading}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              Update Password
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
