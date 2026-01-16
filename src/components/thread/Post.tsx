import { useState, useMemo, useEffect } from 'react';
import { Pin, Lock, ExternalLink, Filter } from 'lucide-react';
import type { Post as PostType } from '../../types/api';
import { getImageUrl, getThumbnailUrl } from '../../utils/apiClient';
import { formatAbsoluteTime, formatRelativeTime, formatFileSize, formatDimensions } from '../../utils/formatters';
import { parsePostContent, extractQuoteLinks } from '../../utils/parser';
import { useFilterStore, checkFilters } from '../../stores/filterStore';
import { useLightboxStore } from '../../stores/lightboxStore';
import CachedImage from '../common/CachedImage';
import VideoPlayer from '../media/VideoPlayer';
import FlashPlayer from '../media/FlashPlayer';
import PostPreviewPopup from './PostPreviewPopup';

interface PostProps {
    post: PostType;
    board: string;
    isOP: boolean;
    allPosts: PostType[];
    showFiltered?: boolean;
    isNew?: boolean; // Highlight as new post since last visit
}

export default function Post({ post, board, isOP, allPosts, showFiltered = false, isNew = false }: PostProps) {
    const { filters, hidePost } = useFilterStore();

    // Check if post matches any filters
    const matchedFilter = useMemo(() => {
        return checkFilters({ com: post.com, name: post.name, trip: post.trip, sub: post.sub }, filters, board);
    }, [post.com, post.name, post.trip, post.sub, filters, board]);

    // Hide post if it matches a filter (unless showFiltered is true)
    if (matchedFilter && !showFiltered) {
        return (
            <div
                id={`post-${post.no}`}
                className="pl-4 py-2 opacity-50 text-gray-500 text-sm flex items-center gap-2"
            >
                <Filter className="w-4 h-4" />
                <span>Post hidden by filter: {matchedFilter.value}</span>
                <button
                    onClick={() => hidePost(board, post.no)}
                    className="text-purple-400 hover:underline text-xs"
                >
                    Show once
                </button>
            </div>
        );
    }
    const [imageExpanded, setImageExpanded] = useState(false);
    const [hoveredQuote, setHoveredQuote] = useState<number | null>(null);
    const [popupPost, setPopupPost] = useState<PostType | null>(null);

    const hasImage = post.tim && post.ext;
    const imageUrl = hasImage ? getImageUrl(board, post.tim!, post.ext!) : null;
    // SWF files don't have thumbnails on 4chan
    const thumbUrl = hasImage && post.ext !== '.swf' ? getThumbnailUrl(board, post.tim!) : null;

    const quoteLinks = useMemo(() => extractQuoteLinks(post.com), [post.com]);

    // Compute backlinks - which posts replied to this post
    const backlinks = useMemo(() => {
        return allPosts
            .filter(p => {
                if (p.no === post.no) return false;
                const quotes = extractQuoteLinks(p.com);
                return quotes.includes(post.no);
            })
            .map(p => p.no);
    }, [allPosts, post.no]);

    // Format content with greentext styling
    const formattedContent = useMemo(() => {
        if (!post.com) return '';

        const sanitized = parsePostContent(post.com);
        const lines = sanitized.split('<br>');

        return lines
            .map((line) => {
                // Greentext
                if (line.trim().startsWith('&gt;') && !line.trim().startsWith('&gt;&gt;')) {
                    return `<span class="greentext">${line}</span>`;
                }
                // Quote links
                if (line.includes('&gt;&gt;')) {
                    return line.replace(
                        /&gt;&gt;(\d+)/g,
                        '<span class="quotelink" data-post-no="$1">&gt;&gt;$1</span>'
                    );
                }
                return line;
            })
            .join('<br>');
    }, [post.com]);

    const handleScrollToPost = (postNo: number) => {
        // Scroll to post
        const element = document.getElementById(`post-${postNo}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-post');
            setTimeout(() => element.classList.remove('highlight-post'), 2000);
        }
    };

    const handleQuoteClick = (postNo: number) => {
        // Find the post and show in popup
        const quotedPost = allPosts.find(p => p.no === postNo);
        if (quotedPost) {
            setPopupPost(quotedPost);
        } else {
            // Post not in current thread, just scroll if possible
            handleScrollToPost(postNo);
        }
    };

    // Handle escape key to close popup
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && popupPost) {
                setPopupPost(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [popupPost]);

    return (
        <div
            id={`post-${post.no}`}
            className={`${isOP ? 'card p-4' : 'pl-4 py-3 hover:bg-dark-surface/50 rounded-lg transition-colors'}`}
        >
            {/* Post Header */}
            <div className="flex items-start gap-3 mb-2">
                {/* Thumbnail (for OP or if has image) */}
                {hasImage && (
                    <div className="flex-shrink-0">
                        {(post.ext === '.webm' || post.ext === '.mp4') ? (
                            // Video handling (webm and mp4)
                            imageExpanded ? (
                                // Expanded video player - streams directly from CDN
                                <div className="max-w-lg">
                                    <VideoPlayer
                                        src={imageUrl!}
                                        poster={thumbUrl ?? undefined}
                                        filename={post.filename}
                                        autoPlay={true}
                                        loop={true}
                                        className="w-full aspect-video"
                                    />
                                    <button
                                        onClick={() => setImageExpanded(false)}
                                        className="mt-1 text-xs text-gray-400 hover:text-white"
                                    >
                                        Close video
                                    </button>
                                </div>
                            ) : (
                                // Video thumbnail with play overlay
                                <button
                                    onClick={() => setImageExpanded(true)}
                                    className="relative block rounded overflow-hidden"
                                >
                                    <CachedImage
                                        src={thumbUrl!}
                                        alt={post.filename || 'Video thumbnail'}
                                        className="w-32 h-32 object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-[9px] text-white font-medium">
                                        {post.ext === '.mp4' ? 'MP4' : 'WEBM'}
                                    </div>
                                </button>
                            )
                        ) : post.ext === '.swf' ? (
                            // Flash/SWF handling with Ruffle
                            imageExpanded ? (
                                <div className="max-w-xl">
                                    <FlashPlayer
                                        src={imageUrl!}
                                        filename={post.filename}
                                        className="w-full"
                                    />
                                    <button
                                        onClick={() => setImageExpanded(false)}
                                        className="mt-1 text-xs text-gray-400 hover:text-white"
                                    >
                                        Close Flash
                                    </button>
                                </div>
                            ) : (
                                // SWF thumbnail placeholder
                                <button
                                    onClick={() => setImageExpanded(true)}
                                    className="relative block rounded overflow-hidden w-32 h-32 bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center"
                                >
                                    <div className="text-center">
                                        <span className="text-white font-bold text-xl">SWF</span>
                                        <p className="text-white/70 text-[10px] mt-1">Click to play</p>
                                    </div>
                                    <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-[9px] text-white font-medium">
                                        FLASH
                                    </div>
                                </button>
                            )
                        ) : (
                            // Image handling
                            <button
                                onClick={() => setImageExpanded(!imageExpanded)}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    useLightboxStore.getState().openLightbox([{
                                        url: imageUrl!,
                                        thumbnail: thumbUrl!,
                                        filename: post.filename || 'image',
                                        width: post.w,
                                        height: post.h,
                                    }]);
                                }}
                                className="block rounded overflow-hidden hover:opacity-90 transition-opacity"
                                title="Click to expand, double-click for fullscreen"
                            >
                                {imageExpanded ? (
                                    <CachedImage
                                        src={imageUrl!}
                                        alt={post.filename || 'Post image'}
                                        className="max-w-full max-h-96 object-contain"
                                    />
                                ) : (
                                    <CachedImage
                                        src={thumbUrl!}
                                        alt={post.filename || 'Post image'}
                                        className="w-32 h-32 object-cover"
                                    />
                                )}
                            </button>
                        )}

                        {/* Image info */}
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                            {post.filename && (
                                <div className="truncate max-w-32" title={`${post.filename}${post.ext}`}>
                                    {post.filename}{post.ext}
                                </div>
                            )}
                            {post.fsize && post.w && post.h && (
                                <div>
                                    {formatFileSize(post.fsize)} {formatDimensions(post.w, post.h)}
                                </div>
                            )}
                            <button
                                onClick={() => setImageExpanded(true)}
                                className="flex items-center gap-1 text-primary-400 hover:text-primary-300"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {imageExpanded ? 'Close' : 'View Full'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Post info */}
                <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        {/* Name */}
                        <span className={`font-semibold ${post.capcode ? 'text-red-400' : 'text-green-400'}`}>
                            {post.name || 'Anonymous'}
                        </span>

                        {/* Trip */}
                        {post.trip && (
                            <span className="text-purple-400">{post.trip}</span>
                        )}

                        {/* Capcode */}
                        {post.capcode && (
                            <span className="text-red-400">## {post.capcode}</span>
                        )}

                        {/* ID */}
                        {post.id && (
                            <span className="text-xs px-2 py-0.5 bg-dark-elevated rounded text-gray-400">
                                ID: {post.id}
                            </span>
                        )}

                        {/* Country */}
                        {post.country && (
                            <span className="text-xs" title={post.country_name}>
                                {post.country}
                            </span>
                        )}

                        {/* Time */}
                        <span className="text-gray-500 text-xs" title={formatAbsoluteTime(post.time)}>
                            {formatRelativeTime(post.time)}
                        </span>

                        {/* Post number - clickable to show in popup */}
                        <span
                            className="text-red-400 text-xs cursor-pointer hover:text-red-300 transition-colors"
                            onClick={() => setPopupPost(post)}
                            title="Click to preview this post"
                        >
                            No.{post.no}
                        </span>

                        {/* NEW badge for posts since last visit */}
                        {isNew && (
                            <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded uppercase">
                                NEW
                            </span>
                        )}

                        {/* Sticky/Closed indicators */}
                        {post.sticky === 1 && (
                            <Pin className="w-4 h-4 text-green-400" />
                        )}
                        {post.closed === 1 && (
                            <Lock className="w-4 h-4 text-red-400" />
                        )}
                    </div>

                    {/* Subject */}
                    {post.sub && (
                        <h3 className="font-semibold text-lg mt-1">{post.sub}</h3>
                    )}

                    {/* Comment */}
                    {post.com && (
                        <div
                            className="post-content mt-2 relative"
                            dangerouslySetInnerHTML={{ __html: formattedContent }}
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.classList.contains('quotelink')) {
                                    const postNo = parseInt(target.getAttribute('data-post-no') || '0', 10);
                                    handleQuoteClick(postNo);
                                }
                            }}
                            onMouseOver={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.classList.contains('quotelink')) {
                                    const postNo = parseInt(target.getAttribute('data-post-no') || '0', 10);
                                    if (postNo) setHoveredQuote(postNo);
                                }
                            }}
                            onMouseOut={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.classList.contains('quotelink')) {
                                    setHoveredQuote(null);
                                }
                            }}
                        />
                    )}

                    {/* Quote Hover Preview */}
                    {hoveredQuote && (() => {
                        const quotedPost = allPosts.find(p => p.no === hoveredQuote);
                        if (!quotedPost) return null;
                        return (
                            <div className="absolute left-0 z-50 mt-1 p-3 bg-dark-elevated border border-dark-border rounded-lg shadow-elevation-3 max-w-md">
                                <div className="text-xs text-gray-400 mb-1">
                                    <span className="text-green-400">{quotedPost.name || 'Anonymous'}</span>
                                    {quotedPost.trip && <span className="text-purple-400 ml-1">{quotedPost.trip}</span>}
                                    <span className="ml-2">No.{quotedPost.no}</span>
                                </div>
                                {quotedPost.com && (
                                    <div
                                        className="text-sm post-content line-clamp-4"
                                        dangerouslySetInnerHTML={{ __html: parsePostContent(quotedPost.com) }}
                                    />
                                )}
                            </div>
                        );
                    })()}

                    {/* OP stats (replies/images) */}
                    {isOP && (post.replies || post.images) && (
                        <div className="flex gap-4 text-sm text-gray-400 mt-2">
                            {post.replies !== undefined && (
                                <span>{post.replies} replies</span>
                            )}
                            {post.images !== undefined && (
                                <span>{post.images} images</span>
                            )}
                            {post.omitted_posts !== undefined && post.omitted_posts > 0 && (
                                <span className="text-yellow-400">
                                    {post.omitted_posts} posts omitted
                                </span>
                            )}
                            {post.omitted_images !== undefined && post.omitted_images > 0 && (
                                <span className="text-blue-400">
                                    {post.omitted_images} images omitted
                                </span>
                            )}
                        </div>
                    )}

                    {/* Backlinks - posts that replied to this post */}
                    {backlinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2 text-xs">
                            <span className="text-gray-500">Replies:</span>
                            {backlinks.map(replyNo => (
                                <button
                                    key={replyNo}
                                    onClick={() => {
                                        const replyPost = allPosts.find(p => p.no === replyNo);
                                        if (replyPost) setPopupPost(replyPost);
                                    }}
                                    className="text-red-400 hover:text-red-300 hover:underline transition-colors"
                                >
                                    {`>>${replyNo}`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Preview Popup */}
            {popupPost && (
                <PostPreviewPopup
                    post={popupPost}
                    board={board}
                    onClose={() => setPopupPost(null)}
                    onScrollToPost={handleScrollToPost}
                />
            )}
        </div>
    );
}
