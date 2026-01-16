/**
 * Enhanced ShortcutsCheatSheet
 * 
 * Complete keyboard shortcuts help modal with all available shortcuts.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Navigation, Search, MessageSquare, Eye, Settings, Grid } from 'lucide-react';

interface ShortcutsCheatSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

// All available shortcuts
const SHORTCUTS = {
    'General': [
        { key: '?', description: 'Show this help' },
        { key: 'Ctrl+K', description: 'Open global search' },
        { key: 'Ctrl+,', description: 'Open settings' },
        { key: 'Esc', description: 'Close modal / Go back' },
    ],
    'Navigation': [
        { key: 'J', description: 'Next post' },
        { key: 'K', description: 'Previous post' },
        { key: 'G then G', description: 'Go to top' },
        { key: 'G then B', description: 'Go to bottom' },
        { key: 'Home', description: 'First post' },
        { key: 'End', description: 'Last post' },
    ],
    'Thread Actions': [
        { key: 'R', description: 'Refresh current view' },
        { key: 'B', description: 'Open thread in browser' },
        { key: 'W', description: 'Toggle watch thread' },
        { key: 'O', description: 'Open current image' },
    ],
    'Browser': [
        { key: 'Ctrl+Click', description: 'Open link in external browser' },
        { key: 'Click link', description: 'Open in in-app browser' },
    ],
};

export default function ShortcutsCheatSheet({ isOpen, onClose }: ShortcutsCheatSheetProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-dark-surface border border-dark-border rounded-lg shadow-elevation-3 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-dark-border">
                        <div className="flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-primary-400" />
                            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                        </div>
                        <button onClick={onClose} className="btn-ghost p-2 hover:bg-dark-hover rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                        <div className="grid grid-cols-2 gap-6">
                            {Object.entries(SHORTCUTS).map(([category, shortcuts]) => (
                                <div key={category} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wide flex items-center gap-2">
                                        {category === 'General' && <Settings className="w-4 h-4" />}
                                        {category === 'Navigation' && <Navigation className="w-4 h-4" />}
                                        {category === 'Thread Actions' && <MessageSquare className="w-4 h-4" />}
                                        {category === 'Browser' && <Eye className="w-4 h-4" />}
                                        {category}
                                    </h3>
                                    <div className="space-y-2">
                                        {shortcuts.map((shortcut, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2 px-3 bg-dark-elevated rounded-md"
                                            >
                                                <span className="text-sm text-gray-300">{shortcut.description}</span>
                                                <kbd className="px-2 py-1 text-xs font-mono bg-dark-surface border border-dark-border rounded text-gray-400">
                                                    {shortcut.key}
                                                </kbd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-dark-border bg-dark-elevated">
                        <p className="text-xs text-gray-400 text-center">
                            Press <kbd className="px-2 py-0.5 text-xs font-mono bg-dark-surface border border-dark-border rounded">?</kbd> anytime to toggle this help
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
