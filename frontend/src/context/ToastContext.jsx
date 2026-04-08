import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const TOAST_STYLES = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
};
const ICON_MAP = { success: CheckCircle, error: AlertCircle, info: Info };
const ICON_COLORS = { success: 'text-green-600', error: 'text-red-600', info: 'text-blue-600' };

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const Icon = ICON_MAP[toast.type] || Info;
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${TOAST_STYLES[toast.type]}`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`} />
                                <p className="text-sm font-medium flex-1">{toast.message}</p>
                                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
