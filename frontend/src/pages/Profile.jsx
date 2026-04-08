import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Edit3, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  // Fallback if user data isn't loaded yet
  const profileData = {
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    role: user?.role || "User",
    joined: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "January 2026",
    location: "Not Specified"
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
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
            <div className="mt-4 text-center md:text-left md:mb-2">
              <h1 className="text-3xl font-black text-slate-900">{profileData.name}</h1>
              <p className="text-indigo-600 font-bold flex items-center justify-center md:justify-start gap-2">
                <Shield size={16} /> {profileData.role === 'admin' ? 'Administrator' : 'Health Partner'}
              </p>
            </div>
            <div className="md:ml-auto md:mb-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                <Edit3 size={16} /> Edit Profile
              </motion.button>
            </div>
          </div>

          <hr className="border-slate-100 mb-10" />

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-700">
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
    </div>
  );
}
