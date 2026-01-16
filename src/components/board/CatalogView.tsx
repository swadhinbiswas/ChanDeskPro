import { useState, useMemo } from 'react';
import { RefreshCw, Grid3x3, Filter, EyeOff } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { useTabStore } from '../../stores/tabStore';
import { useFilterStore, checkFilters } from '../../stores/filterStore';
import ThreadCard from './ThreadCard';
import LoadingSkeleton from '../common/LoadingSkeleton';
import FilterManager from '../common/FilterManager';
import { CatalogThread, CatalogPage } from '../../types/api';
import { Button } from '@/components/ui/button';

interface CatalogViewProps {
    board: string;
}

type SortOption = 'bump' | 'replies' | 'images' | 'newest';

export default function CatalogView({ board }: CatalogViewProps) {
    const [sortBy, setSortBy] = useState<SortOption>('bump');
    const [showFilterManager, setShowFilterManager] = useState(false);
    const [showHidden, setShowHidden] = useState(false);

    const { data: catalog, isLoading, error, refetch, isFetching } = useCatalog(board);
    const openTab = useTabStore((state) => state.openTab);
    const { filters, isThreadHidden, hideThread, unhideThread } = useFilterStore();

    const enabledFiltersCount = useMemo(() => filters.filter(f => f.enabled).length, [filters]);

    // Flatten, filter, and sort catalog
    const { visibleThreads, hiddenCount } = useMemo(() => {
        if (!catalog) return { visibleThreads: [] as CatalogThread[], hiddenCount: 0 };

        const catalogData = catalog as CatalogPage[];
        const allThreads = catalogData.flatMap((page: CatalogPage) => page.threads);
        let hidden = 0;

        const visible = allThreads.filter((thread: CatalogThread) => {
            // Check manual hide
            if (isThreadHidden(board, Number(thread.no))) {
                hidden++;
                return showHidden;
            }

            // Check filters
            const matchedFilter = checkFilters(
                { com: thread.com, sub: thread.sub },
                filters,
                board
            );
            if (matchedFilter && matchedFilter.hideThread) {
                hidden++;
                return showHidden;
            }

            return true;
        });

        // Sort
        visible.sort((a, b) => {
            switch (sortBy) {
                case 'bump':
                    return b.last_modified - a.last_modified;
                case 'replies':
                    return b.replies - a.replies;
                case 'images':
                    return b.images - a.images;
                case 'newest':
                    return Number(b.no) - Number(a.no);
                default:
                    return 0;
            }
        });

        return { visibleThreads: visible, hiddenCount: hidden };
    }, [catalog, sortBy, filters, board, isThreadHidden, showHidden]);

    const handleThreadClick = (thread: CatalogThread) => {
        openTab({
            type: 'thread',
            title: thread.sub || thread.semantic_url || `Thread #${thread.no}`,
            board,
            threadId: Number(thread.no),
        });
    };

    const handleHideThread = (e: React.MouseEvent, threadNo: number) => {
        e.stopPropagation();
        if (isThreadHidden(board, threadNo)) {
            unhideThread(board, threadNo);
        } else {
            hideThread(board, threadNo);
        }
    };

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="text-red-400 mb-4">
                    <p className="text-lg font-semibold">Failed to load catalog</p>
                    <p className="text-sm text-gray-400">{(error as Error).message}</p>
                </div>
                <button onClick={() => refetch()} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-dark-surface border-b border-dark-border p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">/{board}/ - Catalog</h1>
                    <p className="text-sm text-gray-400">
                        {visibleThreads.length} threads
                        {hiddenCount > 0 && (
                            <span className="text-zinc-500"> ({hiddenCount} hidden)</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilterManager(true)}
                        className={enabledFiltersCount > 0 ? 'text-purple-400 border-purple-400/50' : ''}
                    >
                        <Filter className="w-4 h-4" />
                        {enabledFiltersCount > 0 && (
                            <span className="text-xs bg-purple-500/20 px-1.5 rounded">{enabledFiltersCount}</span>
                        )}
                    </Button>

                    {/* Show hidden toggle */}
                    {hiddenCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHidden(!showHidden)}
                            className={showHidden ? 'text-yellow-400 border-yellow-400/50' : ''}
                        >
                            <EyeOff className="w-4 h-4" />
                            {hiddenCount}
                        </Button>
                    )}

                    {/* Sort dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="input text-sm h-8"
                    >
                        <option value="bump">Last Bump</option>
                        <option value="replies">Most Replies</option>
                        <option value="images">Most Images</option>
                        <option value="newest">Newest</option>
                    </select>

                    {/* Refresh button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <LoadingSkeleton variant="card" count={20} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {visibleThreads.map((thread) => (
                            <div key={thread.no} className="relative group">
                                <ThreadCard
                                    thread={thread}
                                    board={board}
                                    onClick={() => handleThreadClick(thread)}
                                />
                                {/* Hide button overlay */}
                                <button
                                    onClick={(e) => handleHideThread(e, Number(thread.no))}
                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50"
                                    title={isThreadHidden(board, Number(thread.no)) ? 'Unhide thread' : 'Hide thread'}
                                >
                                    <EyeOff size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && visibleThreads.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Grid3x3 className="w-16 h-16 mb-4 opacity-50" />
                        <p>No threads found</p>
                        {hiddenCount > 0 && (
                            <p className="text-sm mt-2">
                                {hiddenCount} threads are hidden by filters.
                                <button
                                    onClick={() => setShowHidden(true)}
                                    className="text-purple-400 hover:underline ml-1"
                                >
                                    Show them?
                                </button>
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Filter Manager Modal */}
            <FilterManager isOpen={showFilterManager} onClose={() => setShowFilterManager(false)} />
        </div>
    );
}

