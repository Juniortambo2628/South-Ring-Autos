import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const icons = {
        success: <CheckCircle2 className="text-emerald-500" size={18} />,
        error: <AlertCircle className="text-red-500" size={18} />,
        info: <Info className="text-blue-500" size={18} />,
        warning: <Bell className="text-amber-500" size={18} />,
    };

    const colors = {
        success: 'border-emerald-100 bg-white text-emerald-900',
        error: 'border-red-100 bg-white text-red-900',
        info: 'border-blue-100 bg-white text-blue-900',
        warning: 'border-amber-100 bg-white text-amber-900',
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col space-y-3 max-w-md w-full sm:w-auto">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`flex items-center p-4 rounded-2xl border shadow-xl ${colors[toast.type]} pointer-events-auto group`}
                        >
                            <div className="flex-shrink-0 mr-3">
                                {icons[toast.type]}
                            </div>
                            <div className="flex-grow mr-4">
                                <p className="text-sm font-bold leading-tight">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>

                            {/* Auto-progress bar */}
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${toast.type === 'success' ? 'bg-emerald-500' :
                                        toast.type === 'error' ? 'bg-red-500' :
                                            toast.type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                                    } opacity-20`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
