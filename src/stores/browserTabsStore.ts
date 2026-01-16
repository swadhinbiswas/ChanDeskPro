/**
 * Browser Tabs Store
 * 
 * Manages in-app browser tabs for viewing external links
 * without leaving the current reading position.
 */

import { create } from 'zustand';

export interface BrowserTab {
    id: string;
    url: string;
    title: string;
    favicon?: string;
    isLoading: boolean;
}

interface BrowserTabsState {
    tabs: BrowserTab[];
    activeTabId: string | null;
    isVisible: boolean;

    // Actions
    openTab: (url: string, title?: string) => void;
    closeTab: (id: string) => void;
    switchTab: (id: string) => void;
    updateTab: (id: string, updates: Partial<BrowserTab>) => void;
    closeAllTabs: () => void;
    hideBrowser: () => void;
    showBrowser: () => void;
}

function generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}

export const useBrowserTabsStore = create<BrowserTabsState>((set, get) => ({
    tabs: [],
    activeTabId: null,
    isVisible: false,

    openTab: (url: string, title?: string) => {
        const id = generateTabId();
        const newTab: BrowserTab = {
            id,
            url,
            title: title || extractDomain(url),
            isLoading: true,
        };

        set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: id,
            isVisible: true,
        }));
    },

    closeTab: (id: string) => {
        set((state) => {
            const newTabs = state.tabs.filter((t) => t.id !== id);
            let newActiveId = state.activeTabId;

            // If we closed the active tab, switch to another one
            if (state.activeTabId === id) {
                if (newTabs.length > 0) {
                    // Find the index of the closed tab
                    const closedIndex = state.tabs.findIndex((t) => t.id === id);
                    // Switch to the tab before it, or the first one
                    const newIndex = Math.max(0, closedIndex - 1);
                    newActiveId = newTabs[newIndex]?.id || null;
                } else {
                    newActiveId = null;
                }
            }

            return {
                tabs: newTabs,
                activeTabId: newActiveId,
                isVisible: newTabs.length > 0,
            };
        });
    },

    switchTab: (id: string) => {
        set({ activeTabId: id });
    },

    updateTab: (id: string, updates: Partial<BrowserTab>) => {
        set((state) => ({
            tabs: state.tabs.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }));
    },

    closeAllTabs: () => {
        set({
            tabs: [],
            activeTabId: null,
            isVisible: false,
        });
    },

    hideBrowser: () => {
        set({ isVisible: false });
    },

    showBrowser: () => {
        const state = get();
        if (state.tabs.length > 0) {
            set({ isVisible: true });
        }
    },
}));

// Helper hook for opening external links
export function useExternalLinkHandler() {
    const { openTab } = useBrowserTabsStore();

    const handleExternalLink = (url: string, title?: string) => {
        // Validate URL
        try {
            new URL(url);
            openTab(url, title);
        } catch {
            console.error('Invalid URL:', url);
        }
    };

    return handleExternalLink;
}
