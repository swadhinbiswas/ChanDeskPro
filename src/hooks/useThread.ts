import { useQuery } from '@tanstack/react-query';
import { fetchThread } from '../utils/apiClient';
import { useSettingsStore } from '../stores/settingsStore';
import { useWatchlistStore } from '../stores/watchlistStore';
import { useEffect } from 'react';
import type { Thread } from '../types/api';

export function useThread(board: string, threadId: number, enabled: boolean = true) {
    const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);
    const watchedThreads = useWatchlistStore((state) => state.watchedThreads);
    const updateThreadStatus = useWatchlistStore((state) => state.updateThreadStatus);

    const isWatched = watchedThreads.some((t) => t.id === threadId);

    const query = useQuery({
        queryKey: ['thread', board, threadId],
        queryFn: () => fetchThread(board, threadId),
        staleTime: 10000, // 10 seconds
        refetchInterval: isWatched && autoRefreshInterval > 0 ? autoRefreshInterval * 1000 : false,
        enabled,
        retry: 2,
    });

    // Update watchlist when thread data changes
    useEffect(() => {
        if (query.data && isWatched) {
            const threadData = query.data as Thread;
            const replyCount = threadData.posts.length - 1; // Exclude OP
            updateThreadStatus(threadId, replyCount);
        }
    }, [query.data, isWatched, threadId, updateThreadStatus]);

    return query;
}

