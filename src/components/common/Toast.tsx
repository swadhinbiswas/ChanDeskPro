/**
 * Toast Notification Store & Component
 * 
 * Global toast notification system using Zustand.
 */

import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Zustand store
export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (toast) => {
        const id = generateId();
        const newToast = { ...toast, id };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        // Auto-remove after duration
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
    })),

    clearAll: () => set({ toasts: [] }),
}));

// Helper functions for common toast types
export const toast = {
    success: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'error', title, message }),
    info: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'warning', title, message }),
};

// Toast icon mapping
const toastIcons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

// Toast color mapping
const toastColors = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    info: 'bg-blue-600 border-blue-500',
    warning: 'bg-yellow-600 border-yellow-500',
};

// Toast Container Component
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {toasts.map((t) => {
                    const Icon = toastIcons[t.type];

                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 ${toastColors[t.type]} text-white`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{t.title}</p>
                                {t.message && (
                                    <p className="text-sm opacity-90 mt-0.5">{t.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export default ToastContainer;
