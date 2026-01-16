/**
 * Update Checker Component
 * 
 * Checks for app updates and shows notification banner when update is available.
 * Uses Tauri's updater plugin for automatic updates.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error' | 'upToDate';

interface UpdateInfo {
    version: string;
    body: string;
    date: string;
}

export default function UpdateChecker() {
    const [status, setStatus] = useState<UpdateStatus>('idle');
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    // Check for updates on mount and periodically
    useEffect(() => {
        // Check after 5 seconds to not slow down initial load
        const initialCheck = setTimeout(() => {
            checkForUpdates();
        }, 5000);

        // Check every 6 hours
        const interval = setInterval(() => {
            checkForUpdates();
        }, 6 * 60 * 60 * 1000);

        return () => {
            clearTimeout(initialCheck);
            clearInterval(interval);
        };
    }, []);

    const checkForUpdates = async () => {
        try {
            setStatus('checking');
            setError(null);

            const update = await check();

            if (update) {
                setUpdateInfo({
                    version: update.version,
                    body: update.body || 'Bug fixes and improvements',
                    date: update.date || new Date().toISOString(),
                });
                setStatus('available');
                setDismissed(false);
            } else {
                setStatus('upToDate');
                // Hide "up to date" after 3 seconds
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (err) {
            // Fail silently - update server may not be configured yet
            console.warn('Update check failed:', err);
            setStatus('idle');
        }
    };

    const downloadAndInstall = async () => {
        try {
            setStatus('downloading');
            setProgress(0);

            const update = await check();
            if (!update) {
                setStatus('idle');
                return;
            }

            // Download with progress
            await update.downloadAndInstall((event: any) => {
                if (event.event === 'Started') {
                    console.log('Download started');
                } else if (event.event === 'Progress') {
                    const eventData = event.data as any;
                    const total = eventData?.contentLength || eventData?.total || 0;
                    const downloaded = eventData?.chunkLength || eventData?.downloaded || 0;
                    if (total > 0) {
                        setProgress(Math.round((downloaded / total) * 100));
                    }
                } else if (event.event === 'Finished') {
                    console.log('Download finished');
                }
            });

            setStatus('ready');
        } catch (err) {
            console.error('Update download failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to download update');
            setStatus('error');
        }
    };

    const restartApp = async () => {
        try {
            await relaunch();
        } catch (err) {
            console.error('Failed to restart:', err);
        }
    };

    // Don't show if dismissed or idle
    if (dismissed || status === 'idle') {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-[60] flex justify-center p-2"
            >
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white max-w-2xl">
                    {/* Status Icon */}
                    {status === 'checking' && (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    )}
                    {status === 'available' && (
                        <Download className="w-5 h-5" />
                    )}
                    {status === 'downloading' && (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    )}
                    {status === 'ready' && (
                        <CheckCircle className="w-5 h-5" />
                    )}
                    {status === 'upToDate' && (
                        <CheckCircle className="w-5 h-5" />
                    )}
                    {status === 'error' && (
                        <AlertCircle className="w-5 h-5" />
                    )}

                    {/* Message */}
                    <div className="flex-1">
                        {status === 'checking' && (
                            <span className="text-sm">Checking for updates...</span>
                        )}
                        {status === 'available' && updateInfo && (
                            <span className="text-sm">
                                <strong>Update available!</strong> ChanDesk v{updateInfo.version}
                            </span>
                        )}
                        {status === 'downloading' && (
                            <span className="text-sm">
                                Downloading update... {progress}%
                            </span>
                        )}
                        {status === 'ready' && (
                            <span className="text-sm">
                                Update ready! Restart to apply.
                            </span>
                        )}
                        {status === 'upToDate' && (
                            <span className="text-sm">You're on the latest version!</span>
                        )}
                        {status === 'error' && (
                            <span className="text-sm text-red-200">{error}</span>
                        )}
                    </div>

                    {/* Actions */}
                    {status === 'available' && (
                        <button
                            onClick={downloadAndInstall}
                            className="px-3 py-1 text-sm font-medium bg-white text-primary-600 rounded hover:bg-gray-100 transition-colors"
                        >
                            Update Now
                        </button>
                    )}
                    {status === 'ready' && (
                        <button
                            onClick={restartApp}
                            className="px-3 py-1 text-sm font-medium bg-white text-primary-600 rounded hover:bg-gray-100 transition-colors"
                        >
                            Restart
                        </button>
                    )}
                    {status === 'error' && (
                        <button
                            onClick={checkForUpdates}
                            className="px-3 py-1 text-sm font-medium bg-white/20 rounded hover:bg-white/30 transition-colors"
                        >
                            Retry
                        </button>
                    )}

                    {/* Dismiss */}
                    {['available', 'error', 'upToDate'].includes(status) && (
                        <button
                            onClick={() => setDismissed(true)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
