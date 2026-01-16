/**
 * Global Search Component
 * 
 * A command-palette style search modal (Ctrl+K) for searching across:
 * - Cached threads/posts
 * - Current catalog
 * - Search history
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, MessageSquare, Hash, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '../../utils/apiClient';
import type { CatalogThread } from '../../types/api';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectThread: (board: string, threadId: number) => void;
    onSelectBoard: (board: string) => void;
    currentBoard: string | null;
}

interface SearchResult {
    type: 'thread' | 'board' | 'history';
    board: string;
    threadId?: number;
    title: string;
    preview?: string;
    imageCount?: number;
    replyCount?: number;
}

// Popular/default boards to show
const POPULAR_BOARDS = ['g', 'v', 'a', 'pol', 'b', 'int', 'fit', 'sci', 'mu', 'tv'];

// Search history (stored in localStorage)
function getSearchHistory(): SearchResult[] {
    try {
        return JSON.parse(localStorage.getItem('search_history') || '[]');
    } catch {
        return [];
    }
}

function addToSearchHistory(result: SearchResult) {
    const history = getSearchHistory();
    // Remove if exists, add to front
    const filtered = history.filter(h =>
        !(h.board === result.board && h.threadId === result.threadId)
    );
    const updated = [result, ...filtered].slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(updated));
}

export default function GlobalSearch({
    isOpen,
    onClose,
    onSelectThread,
    onSelectBoard,
    currentBoard
}: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Fetch current board's catalog for searching
    const { data: catalog, isLoading: isCatalogLoading } = useQuery({
        queryKey: ['catalog', currentBoard],
        queryFn: () => currentBoard ? fetchCatalog(currentBoard) : Promise.resolve([]),
        enabled: isOpen && !!currentBoard,
    });

    // Flatten catalog threads
    const catalogThreads = useMemo(() => {
        if (!catalog) return [];
        return catalog.flatMap((page: any) => page.threads || []) as CatalogThread[];
    }, [catalog]);

    // Filter and search results
    const searchResults = useMemo((): SearchResult[] => {
        const results: SearchResult[] = [];
        const lowerQuery = query.toLowerCase().trim();

        if (!lowerQuery) {
            // Show history + popular boards when no query
            const history = getSearchHistory().slice(0, 5);
            results.push(...history);

            // Add popular boards
            POPULAR_BOARDS.forEach(board => {
                if (!results.some(r => r.type === 'board' && r.board === board)) {
                    results.push({
                        type: 'board',
                        board,
                        title: `/${board}/`,
                    });
                }
            });
            return results.slice(0, 12);
        }

        // Check if searching for a board (starts with /)
        if (lowerQuery.startsWith('/')) {
            const boardSearch = lowerQuery.replace(/\//g, '');
            POPULAR_BOARDS.filter(b => b.includes(boardSearch)).forEach(board => {
                results.push({
                    type: 'board',
                    board,
                    title: `/${board}/`,
                });
            });
        }

        // Search in catalog threads
        if (currentBoard && catalogThreads.length > 0) {
            catalogThreads
                .filter(thread => {
                    const subject = (thread.sub || '').toLowerCase();
                    const teaser = (thread.teaser || '').toLowerCase();
                    const comment = (thread.com || '').toLowerCase();
                    return subject.includes(lowerQuery) ||
                        teaser.includes(lowerQuery) ||
                        comment.includes(lowerQuery) ||
                        thread.no.toString().includes(lowerQuery);
                })
                .slice(0, 10)
                .forEach(thread => {
                    results.push({
                        type: 'thread',
                        board: currentBoard,
                        threadId: thread.no,
                        title: thread.sub || `Thread #${thread.no}`,
                        preview: thread.teaser?.substring(0, 100),
                        imageCount: thread.images,
                        replyCount: thread.replies,
                    });
                });
        }

        return results;
    }, [query, catalogThreads, currentBoard]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(i => Math.min(i + 1, searchResults.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(i => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleSelect(searchResults[selectedIndex]);
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, searchResults, selectedIndex, onClose]);

    // Scroll selected into view
    useEffect(() => {
        const container = resultsRef.current;
        if (!container) return;
        const selected = container.children[selectedIndex] as HTMLElement;
        if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    const handleSelect = (result: SearchResult | undefined) => {
        if (!result) return;

        addToSearchHistory(result);

        if (result.type === 'board') {
            onSelectBoard(result.board);
        } else if (result.type === 'thread' && result.threadId) {
            onSelectThread(result.board, result.threadId);
        } else if (result.type === 'history' && result.threadId) {
            onSelectThread(result.board, result.threadId);
        } else if (result.type === 'history') {
            onSelectBoard(result.board);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-xl bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden"
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            placeholder={currentBoard ? `Search /${currentBoard}/ or type /board...` : 'Search boards or type /board...'}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                            autoComplete="off"
                            spellCheck="false"
                        />
                        {isCatalogLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-dark-hover rounded transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Results */}
                    <div
                        ref={resultsRef}
                        className="max-h-80 overflow-y-auto"
                    >
                        {searchResults.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                {query ? 'No results found' : 'Start typing to search...'}
                            </div>
                        ) : (
                            searchResults.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.board}-${result.threadId || ''}`}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${index === selectedIndex
                                            ? 'bg-primary-500/20 border-l-2 border-primary-500'
                                            : 'hover:bg-dark-hover border-l-2 border-transparent'
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        {result.type === 'history' && <Clock className="w-5 h-5 text-gray-400" />}
                                        {result.type === 'board' && <Hash className="w-5 h-5 text-primary-400" />}
                                        {result.type === 'thread' && <MessageSquare className="w-5 h-5 text-green-400" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {result.title}
                                        </div>
                                        {result.preview && (
                                            <div className="text-sm text-gray-400 truncate">
                                                {result.preview}
                                            </div>
                                        )}
                                        {(result.replyCount !== undefined || result.imageCount !== undefined) && (
                                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                {result.replyCount !== undefined && <span>💬 {result.replyCount}</span>}
                                                {result.imageCount !== undefined && <span>🖼️ {result.imageCount}</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="px-4 py-2 border-t border-dark-border bg-dark-elevated">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                                <kbd className="px-1.5 py-0.5 bg-dark-hover rounded text-gray-400">↑↓</kbd> to navigate
                                <kbd className="ml-2 px-1.5 py-0.5 bg-dark-hover rounded text-gray-400">Enter</kbd> to select
                            </span>
                            <span>
                                <kbd className="px-1.5 py-0.5 bg-dark-hover rounded text-gray-400">Esc</kbd> to close
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
