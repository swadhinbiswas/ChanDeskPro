import { motion } from 'framer-motion';
import { X, Plus, MoreVertical } from 'lucide-react';
import { useTabStore } from '../../stores/tabStore';
import { getBoardTheme } from '../../lib/design-tokens';
import { useState, useRef, useEffect } from 'react';

export default function TabBar() {
    const tabs = useTabStore((state) => state.tabs);
    const activeTabId = useTabStore((state) => state.activeTabId);
    const setActiveTab = useTabStore((state) => state.setActiveTab);
    const closeTab = useTabStore((state) => state.closeTab);
    const openTab = useTabStore((state) => state.openTab);
    const closeAllTabs = useTabStore((state) => state.closeAllTabs);
    const closeOtherTabs = useTabStore((state) => state.closeOtherTabs);

    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        tabId: string;
    } | null>(null);

    const contextMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };

        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [contextMenu]);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        closeTab(tabId);
    };

    const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            tabId,
        });
    };

    const handleNewTab = () => {
        // Open a default board or show board selector
        openTab({
            type: 'catalog',
            title: '/g/ - Technology',
            board: 'g',
        });
    };

    return (
        <>
            <div className="bg-dark-surface border-b border-dark-border flex items-center h-10 overflow-x-auto scrollbar-hide">
                <div className="flex items-center h-full">
                    {tabs.map((tab) => {
                        const isActive = tab.id === activeTabId;
                        const themeColor = tab.board ? getBoardTheme(tab.board) : '#6b7280';

                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                onContextMenu={(e) => handleContextMenu(e, tab.id)}
                                className={`tab relative flex items-center gap-2 px-4 h-full border-r border-dark-border min-w-[120px] max-w-[200px] group ${isActive ? 'tab-active bg-dark-elevated' : 'tab-inactive'
                                    }`}
                                whileHover={{ backgroundColor: isActive ? undefined : 'rgba(255, 255, 255, 0.05)' }}
                            >
                                {/* Board color indicator */}
                                {tab.board && (
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                )}

                                {/* Tab title */}
                                <span className="truncate flex-1 text-sm">
                                    {tab.title}
                                </span>

                                {/* New replies indicator */}
                                {tab.hasNewReplies && (
                                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                                )}

                                {/* Close button */}
                                <button
                                    onClick={(e) => handleCloseTab(e, tab.id)}
                                    className="hover:bg-dark-hover rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>

                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}

                    {/* New Tab Button */}
                    <button
                        onClick={handleNewTab}
                        className="tab tab-inactive flex items-center justify-center px-3 h-full hover:bg-dark-hover"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="context-menu fixed"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                        zIndex: 1000,
                    }}
                >
                    <button
                        onClick={() => {
                            closeTab(contextMenu.tabId);
                            setContextMenu(null);
                        }}
                        className="context-menu-item w-full text-left"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            closeOtherTabs(contextMenu.tabId);
                            setContextMenu(null);
                        }}
                        className="context-menu-item w-full text-left"
                    >
                        Close Others
                    </button>
                    <button
                        onClick={() => {
                            closeAllTabs();
                            setContextMenu(null);
                        }}
                        className="context-menu-item w-full text-left"
                    >
                        Close All
                    </button>
                </div>
            )}
        </>
    );
}
