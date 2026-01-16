/**
 * Browser View
 * 
 * Embedded in-app browser using iframe for viewing external URLs.
 * Supports navigation controls and fallback to external browser.
 */

import { useBrowserTabsStore } from '../../stores/browserTabsStore';
import {
    ExternalLink,
    Globe,
    Copy,
    Check,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    AlertTriangle,
    X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function BrowserView() {
    const { tabs, activeTabId, updateTab, closeTab } = useBrowserTabsStore();
    const [copied, setCopied] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const activeTab = tabs.find(t => t.id === activeTabId);

    // Initialize navigation history when tab URL changes
    useEffect(() => {
        if (activeTab?.url) {
            setNavigationHistory([activeTab.url]);
            setHistoryIndex(0);
            setIframeError(false);
        }
    }, [activeTab?.id]);

    if (!activeTab) {
        return (
            <div className="flex-1 flex items-center justify-center bg-dark-bg text-gray-400">
                <p>No tab selected</p>
            </div>
        );
    }

    const currentUrl = navigationHistory[historyIndex] || activeTab.url;
    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < navigationHistory.length - 1;

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const handleOpenExternal = () => {
        window.open(currentUrl, '_blank');
    };

    const handleIframeLoad = () => {
        updateTab(activeTab.id, { isLoading: false });
        setIframeError(false);
    };

    const handleIframeError = () => {
        setIframeError(true);
        updateTab(activeTab.id, { isLoading: false });
    };

    const handleBack = () => {
        if (canGoBack) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            if (iframeRef.current) {
                iframeRef.current.src = navigationHistory[newIndex];
            }
        }
    };

    const handleForward = () => {
        if (canGoForward) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            if (iframeRef.current) {
                iframeRef.current.src = navigationHistory[newIndex];
            }
        }
    };

    const handleRefresh = () => {
        if (iframeRef.current) {
            updateTab(activeTab.id, { isLoading: true });
            iframeRef.current.src = currentUrl;
        }
    };

    // Show error fallback if iframe fails to load
    if (iframeError) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg p-8">
                <div className="max-w-lg w-full text-center space-y-6">
                    {/* Error Icon */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-400" />
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Cannot Load in Browser
                        </h2>
                        <p className="text-gray-400">
                            This website blocks embedded viewing. Open it in your external browser instead.
                        </p>
                    </div>

                    {/* URL display */}
                    <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border">
                        <p className="text-sm text-gray-500 mb-1">URL:</p>
                        <p className="text-primary-400 break-all text-sm">
                            {currentUrl}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleOpenExternal}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 
                                      bg-primary-600 hover:bg-primary-500 rounded-lg text-white 
                                      font-medium transition-colors"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Open in External Browser
                        </button>

                        <button
                            onClick={handleCopyUrl}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 
                                      bg-dark-elevated hover:bg-dark-hover rounded-lg text-gray-300 
                                      font-medium transition-colors border border-dark-border"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    Copy URL
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => closeTab(activeTab.id)}
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            Close and return
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-dark-bg">
            {/* Navigation Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-surface border-b border-dark-border">
                {/* Navigation Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleBack}
                        disabled={!canGoBack}
                        className={`p-2 rounded-lg transition-colors ${canGoBack
                                ? 'hover:bg-dark-elevated text-gray-300'
                                : 'text-gray-600 cursor-not-allowed'
                            }`}
                        title="Go back"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleForward}
                        disabled={!canGoForward}
                        className={`p-2 rounded-lg transition-colors ${canGoForward
                                ? 'hover:bg-dark-elevated text-gray-300'
                                : 'text-gray-600 cursor-not-allowed'
                            }`}
                        title="Go forward"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-lg hover:bg-dark-elevated text-gray-300 transition-colors"
                        title="Refresh"
                    >
                        <RotateCw className={`w-4 h-4 ${activeTab.isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* URL Bar */}
                <div className="flex-1 flex items-center gap-2 bg-dark-elevated rounded-lg px-3 py-1.5 border border-dark-border">
                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <input
                        type="text"
                        value={currentUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-300 focus:outline-none"
                    />
                    <button
                        onClick={handleCopyUrl}
                        className="p-1 hover:bg-dark-hover rounded transition-colors"
                        title="Copy URL"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                </div>

                {/* External Link */}
                <button
                    onClick={handleOpenExternal}
                    className="p-2 rounded-lg hover:bg-dark-elevated text-gray-300 transition-colors"
                    title="Open in external browser"
                >
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>

            {/* Loading Indicator */}
            {activeTab.isLoading && (
                <div className="h-1 bg-dark-elevated">
                    <div className="h-full bg-primary-500 animate-pulse" style={{ width: '60%' }} />
                </div>
            )}

            {/* Iframe */}
            <iframe
                ref={iframeRef}
                src={currentUrl}
                className="flex-1 w-full border-none bg-white"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={activeTab.title}
            />
        </div>
    );
}
