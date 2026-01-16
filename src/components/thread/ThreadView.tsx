import { useRef, useEffect } from 'react';
import { RefreshCw, Eye, EyeOff, Share2, Globe } from 'lucide-react';
import { useThread } from '../../hooks/useThread';
import { useWatchlistStore } from '../../stores/watchlistStore';
import Post from './Post';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { getThreadUrl } from '../../utils/apiClient';
import { useBrowserTabsStore } from '../../stores/browserTabsStore';
import { Button } from '@/components/ui/button';

interface ThreadViewProps {
    board: string;
    threadId: number;
}

export default function ThreadView({ board, threadId }: ThreadViewProps) {
    const { data: thread, isLoading, error, refetch, isFetching } = useThread(board, threadId);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { openTab } = useBrowserTabsStore();

    const watchedThreads = useWatchlistStore((state) => state.watchedThreads);
    const watchThread = useWatchlistStore((state) => state.watchThread);
    const unwatchThread = useWatchlistStore((state) => state.unwatchThread);
    const markThreadAsRead = useWatchlistStore((state) => state.markThreadAsRead);

    const isWatched = watchedThreads.some((t) => t.id === threadId);

    useEffect(() => {
        if (isWatched) {
            markThreadAsRead(threadId);
        }
    }, [isWatched, threadId, markThreadAsRead]);

    const handleWatch = () => {
        if (isWatched) {
            unwatchThread(threadId);
        } else {
            const op = thread?.posts[0];
            watchThread({
                id: threadId,
                board,
                title: op?.sub || op?.semantic_url || `Thread #${threadId}`,
                lastReplyCount: thread?.posts.length ? thread.posts.length - 1 : 0,
            });
        }
    };

    const handleShare = () => {
        const url = getThreadUrl(board, threadId);
        navigator.clipboard.writeText(url);
        // TODO: Show toast notification
    };

    const handleOpenInBrowser = () => {
        const url = getThreadUrl(board, threadId);
        const title = thread?.posts[0]?.sub || `/${board}/ - Thread #${threadId}`;
        openTab(url, title);
    };

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-red-400 mb-4">
                    <p className="text-lg font-semibold">Failed to load thread</p>
                    <p className="text-sm text-gray-400">{(error as Error).message}</p>
                </div>
                <button onClick={() => refetch()} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    if (isLoading || !thread) {
        return (
            <div className="flex-1 overflow-y-auto p-6">
                <LoadingSkeleton variant="thread" />
            </div>
        );
    }

    const op = thread.posts[0];
    const replies = thread.posts.slice(1);

    return (
        <div className="flex flex-col h-full">
            {/* Thread Header */}
            <div className="bg-dark-surface border-b border-dark-border p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>/{board}/</span>
                        <span>›</span>
                        <span>Thread #{threadId}</span>
                    </div>
                    {op.sub && (
                        <h1 className="text-xl font-bold truncate">{op.sub}</h1>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>{replies.length} replies</span>
                        <span>{thread.posts.filter((p) => p.tim).length} images</span>
                        {op.unique_ips && <span>{op.unique_ips} unique IPs</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isWatched ? 'default' : 'outline'}
                        size="sm"
                        onClick={handleWatch}
                    >
                        {isWatched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {isWatched ? 'Watching' : 'Watch'}
                    </Button>

                    <Button variant="outline" size="icon" onClick={handleShare} title="Copy link">
                        <Share2 className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="icon" onClick={handleOpenInBrowser} title="Open in browser">
                        <Globe className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Thread Posts */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* OP Post */}
                <Post post={op} board={board} isOP={true} allPosts={thread.posts} />

                {/* Divider */}
                <div className="border-t border-dark-border" />

                {/* Replies */}
                {replies.map((post) => (
                    <Post key={post.no} post={post} board={board} isOP={false} allPosts={thread.posts} />
                ))}
            </div>
        </div>
    );
}
