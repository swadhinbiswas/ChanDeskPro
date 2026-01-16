import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchedThread {
    id: number;
    board: string;
    title: string;
    lastChecked: number;
    lastReplyCount: number;
    hasNewReplies: boolean;
}

interface WatchlistState {
    watchedThreads: WatchedThread[];

    // Actions
    watchThread: (thread: Omit<WatchedThread, 'lastChecked' | 'hasNewReplies'>) => void;
    unwatchThread: (id: number) => void;
    updateThreadStatus: (id: number, replyCount: number) => void;
    markThreadAsRead: (id: number) => void;
    clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set) => ({
            watchedThreads: [],

            watchThread: (thread) => {
                set((state) => {
                    // Check if already watching
                    if (state.watchedThreads.some((t) => t.id === thread.id)) {
                        return state;
                    }

                    return {
                        watchedThreads: [
                            ...state.watchedThreads,
                            {
                                ...thread,
                                lastChecked: Date.now(),
                                hasNewReplies: false,
                            },
                        ],
                    };
                });
            },

            unwatchThread: (id) => {
                set((state) => ({
                    watchedThreads: state.watchedThreads.filter((t) => t.id !== id),
                }));
            },

            updateThreadStatus: (id, replyCount) => {
                set((state) => ({
                    watchedThreads: state.watchedThreads.map((t) => {
                        if (t.id === id) {
                            return {
                                ...t,
                                lastChecked: Date.now(),
                                hasNewReplies: replyCount > t.lastReplyCount,
                                lastReplyCount: replyCount,
                            };
                        }
                        return t;
                    }),
                }));
            },

            markThreadAsRead: (id) => {
                set((state) => ({
                    watchedThreads: state.watchedThreads.map((t) =>
                        t.id === id ? { ...t, hasNewReplies: false } : t
                    ),
                }));
            },

            clearWatchlist: () => {
                set({ watchedThreads: [] });
            },
        }),
        {
            name: 'watchlist-storage',
        }
    )
);
