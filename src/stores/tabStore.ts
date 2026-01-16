import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabType = 'catalog' | 'thread';

export interface Tab {
    id: string;
    type: TabType;
    title: string;
    board?: string;
    threadId?: number;
    hasNewReplies?: boolean;
}

interface TabState {
    tabs: Tab[];
    activeTabId: string | null;

    // Actions
    openTab: (tab: Omit<Tab, 'id'>) => string;
    closeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    reorderTabs: (fromIndex: number, toIndex: number) => void;
    updateTab: (id: string, updates: Partial<Tab>) => void;
    closeAllTabs: () => void;
    closeOtherTabs: (id: string) => void;
}

export const useTabStore = create<TabState>()(
    persist(
        (set, get) => ({
            tabs: [],
            activeTabId: null,

            openTab: (tabData) => {
                const id = `tab-${Date.now()}-${Math.random()}`;
                const newTab: Tab = { id, ...tabData };

                set((state) => ({
                    tabs: [...state.tabs, newTab],
                    activeTabId: id,
                }));

                return id;
            },

            closeTab: (id) => {
                set((state) => {
                    const newTabs = state.tabs.filter((tab) => tab.id !== id);
                    let newActiveTabId = state.activeTabId;

                    // If closing the active tab, switch to the last tab
                    if (state.activeTabId === id) {
                        newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
                    }

                    return {
                        tabs: newTabs,
                        activeTabId: newActiveTabId,
                    };
                });
            },

            setActiveTab: (id) => {
                set({ activeTabId: id });
            },

            reorderTabs: (fromIndex, toIndex) => {
                set((state) => {
                    const newTabs = [...state.tabs];
                    const [movedTab] = newTabs.splice(fromIndex, 1);
                    newTabs.splice(toIndex, 0, movedTab);
                    return { tabs: newTabs };
                });
            },

            updateTab: (id, updates) => {
                set((state) => ({
                    tabs: state.tabs.map((tab) =>
                        tab.id === id ? { ...tab, ...updates } : tab
                    ),
                }));
            },

            closeAllTabs: () => {
                set({ tabs: [], activeTabId: null });
            },

            closeOtherTabs: (id) => {
                set((state) => ({
                    tabs: state.tabs.filter((tab) => tab.id === id),
                    activeTabId: id,
                }));
            },
        }),
        {
            name: 'tab-storage',
            partialize: (state) => ({
                tabs: state.tabs,
                activeTabId: state.activeTabId,
            }),
        }
    )
);
