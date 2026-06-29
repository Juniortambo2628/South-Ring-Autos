"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface BulkActionsBarProps {
    count: number;
    label: string;
    onDelete: () => void;
    onCancel: () => void;
}

export function BulkActionsBar({ count, label, onDelete, onCancel }: BulkActionsBarProps) {
    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#003366] text-white rounded-2xl p-4 mb-8 flex items-center justify-between shadow-xl shadow-[#003366]/10"
                >
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest pl-4">
                        <span className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center">
                            {count}
                        </span>
                        {label} Selected
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 h-10 rounded-xl hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onDelete}
                            className="bg-red-600 hover:bg-red-700 h-10 px-6 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Delete Selected
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
