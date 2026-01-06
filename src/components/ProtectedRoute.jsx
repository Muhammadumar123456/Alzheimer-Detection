import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lock } from 'lucide-react';

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
// This component wraps protected routes and ensures only authenticated users
// can access them. If a user is not logged in, they are redirected to the
// login page with a clear message.
// ============================================================================

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const [showMessage, setShowMessage] = useState(false);

    // Show message when redirecting unauthenticated user
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            setShowMessage(true);
        }
    }, [isAuthenticated, loading]);

    // Wait for auth check to complete
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // AUTHENTICATION CHECK
    // ============================================================================
    // If user is not authenticated, redirect to login page
    // Pass the attempted location so we can redirect back after login
    // ============================================================================
    if (!isAuthenticated) {
        return (
            <>
                {/* Display warning message before redirect */}
                <AnimatePresence>
                    {showMessage && (
                        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
                            >
                                {/* Warning Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50"></div>
                                        <div className="relative p-4 bg-red-100 rounded-full">
                                            <Lock className="w-12 h-12 text-red-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Warning Message */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                        Authentication Required
                                    </h2>
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-amber-800 text-left font-medium">
                                            Please login to continue
                                        </p>
                                    </div>
                                    <p className="text-gray-600">
                                        You need to be logged in to access this feature.
                                        You will be redirected to the login page.
                                    </p>
                                </div>

                                {/* Loading indicator */}
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Redirect to login after brief delay to show message */}
                {setTimeout(() => { }, 1500)}
                <Navigate
                    to="/login"
                    state={{ from: location.pathname }}
                    replace
                />
            </>
        );
    }

    // ============================================================================
    // AUTHORIZED ACCESS
    // ============================================================================
    // User is authenticated, render the protected content
    // ============================================================================
    return children;
};

export default ProtectedRoute;
