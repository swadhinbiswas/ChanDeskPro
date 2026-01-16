/**
 * Browser Tab Bar
 * 
 * Displays browser tabs and allows switching between them.
 * Shows when external links are opened in the app.
 */

import { X, Globe, ArrowLeft, RotateCw } from 'lucide-react';
import { useBrowserTabsStore } from '../../stores/browserTabsStore';
import type { BrowserTab } from '../../stores/browserTabsStore';

interface TabItemProps {
    tab: BrowserTab;
    isActive: boolean;
    onSwitch: () => void;
    onClose: () => void;
}

function TabItem({ tab, isActive, onSwitch, onClose }: TabItemProps) {
    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-all min-w-0 max-w-48
                ${isActive
                    ? 'bg-dark-surface border-t border-l border-r border-dark-border'
                    : 'bg-dark-elevated/50 hover:bg-dark-elevated'
                }`}
            onClick={onSwitch}
        >
            {/* Favicon or default icon */}
            {tab.favicon ? (
                <img src={tab.favicon} alt="" className="w-4 h-4 flex-shrink-0" />
            ) : (
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}

            {/* Title */}
            <span className="text-sm truncate flex-1 min-w-0">
                {tab.isLoading ? 'Loading...' : tab.title}
            </span>

            {/* Loading indicator */}
            {tab.isLoading && (
                <RotateCw className="w-3 h-3 text-gray-400 animate-spin flex-shrink-0" />
            )}

            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="p-0.5 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
            >
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
            </button>
        </div>
    );
}

export default function BrowserTabBar() {
    const { tabs, activeTabId, switchTab, closeTab, closeAllTabs, hideBrowser } = useBrowserTabsStore();

    if (tabs.length === 0) return null;

    return (
        <div className="bg-dark-bg border-b border-dark-border">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-2 pt-2">
                {/* Back to app button */}
                <button
                    onClick={hideBrowser}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-500 
                              rounded-t-lg text-sm font-medium transition-colors mr-2 flex-shrink-0"
                    title="Return to ChanDesk"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">ChanDesk</span>
                </button>

                {/* Tab list - scrollable */}
                <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-dark-border">
                    {tabs.map((tab) => (
                        <TabItem
                            key={tab.id}
                            tab={tab}
                            isActive={tab.id === activeTabId}
                            onSwitch={() => switchTab(tab.id)}
                            onClose={() => closeTab(tab.id)}
                        />
                    ))}
                </div>

                {/* Close all button */}
                {tabs.length > 1 && (
                    <button
                        onClick={closeAllTabs}
                        className="ml-2 px-2 py-1 text-xs text-gray-400 hover:text-red-400 
                                  hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                        title="Close all tabs"
                    >
                        Close All
                    </button>
                )}
            </div>
        </div>
    );
}
