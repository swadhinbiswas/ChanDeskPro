import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LastSeenPost {
    threadId: number;
    lastPostNo: number;
    timestamp: number;
}

interface LastSeenStore {
    lastSeen: LastSeenPost[];

    // Get last seen post number for a thread
    getLastSeen: (threadId: number) => number | null;

    // Update last seen post for a thread
    updateLastSeen: (threadId: number, postNo: number) => void;

    // Check if a post is new (was added since last visit)
    isNewPost: (threadId: number, postNo: number) => boolean;

    // Clear old entries (older than 7 days)
    cleanup: () => void;
}

export const useLastSeenStore = create<LastSeenStore>()(
    persist(
        (set, get) => ({
            lastSeen: [],

            getLastSeen: (threadId) => {
                const entry = get().lastSeen.find(e => e.threadId === threadId);
                return entry ? entry.lastPostNo : null;
            },

            updateLastSeen: (threadId, postNo) => {
                set((state) => {
                    const existing = state.lastSeen.find(e => e.threadId === threadId);
                    if (existing) {
                        // Only update if we've seen a newer post
                        if (postNo > existing.lastPostNo) {
                            return {
                                lastSeen: state.lastSeen.map(e =>
                                    e.threadId === threadId
                                        ? { ...e, lastPostNo: postNo, timestamp: Date.now() }
                                        : e
                                ),
                            };
                        }
                        return state;
                    } else {
                        return {
                            lastSeen: [
                                ...state.lastSeen,
                                { threadId, lastPostNo: postNo, timestamp: Date.now() },
                            ],
                        };
                    }
                });
            },

            isNewPost: (threadId, postNo) => {
                const lastSeen = get().getLastSeen(threadId);
                if (lastSeen === null) return false; // First visit, nothing is "new"
                return postNo > lastSeen;
            },

            cleanup: () => {
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                set((state) => ({
                    lastSeen: state.lastSeen.filter(e => e.timestamp > sevenDaysAgo),
                }));
            },
        }),
        {
            name: 'last-seen-storage',
        }
    )
);
