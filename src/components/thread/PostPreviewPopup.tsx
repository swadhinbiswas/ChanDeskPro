/**
 * Post Preview Popup
 * 
 * Shows a referenced post in a popup overlay when clicking on quote links (>>12345).
 * Includes the full post content, image, and navigation options.
 */

import { useState } from 'react';
import { X, ArrowUp, ZoomIn, ZoomOut } from 'lucide-react';
import type { Post as PostType } from '../../types/api';
import { parsePostContent } from '../../utils/parser';
import { getThumbnailUrl, getImageUrl } from '../../utils/apiClient';
import CachedImage from '../common/CachedImage';

interface PostPreviewPopupProps {
    post: PostType;
    board: string;
    onClose: () => void;
    onScrollToPost: (postNo: number) => void;
}

export default function PostPreviewPopup({ post, board, onClose, onScrollToPost }: PostPreviewPopupProps) {
    const [imageExpanded, setImageExpanded] = useState(false);

    const hasImage = post.tim && post.ext;
    const thumbUrl = hasImage ? getThumbnailUrl(board, post.tim!) : null;
    const imageUrl = hasImage ? getImageUrl(board, post.tim!, post.ext!) : null;

    // Format content
    const formattedContent = post.com ? parsePostContent(post.com)
        .replace(/&gt;([^<\n]+)/g, '<span class="greentext">&gt;$1</span>')
        .replace(/&gt;&gt;(\d+)/g, '<span class="quotelink">&gt;&gt;$1</span>')
        : '';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-dark-surface border border-dark-border rounded-xl shadow-elevation-3 
                          max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-elevated">
                    <div className="flex items-center gap-3">
                        <span className="text-green-400 font-semibold">
                            {post.name || 'Anonymous'}
                        </span>
                        {post.trip && (
                            <span className="text-purple-400">{post.trip}</span>
                        )}
                        <span className="text-gray-500 text-sm">No.{post.no}</span>
                        {post.time && (
                            <span className="text-gray-600 text-xs">
                                {new Date(post.time * 1000).toLocaleString()}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="flex gap-4">
                        {/* Image */}
                        {hasImage && (
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => setImageExpanded(!imageExpanded)}
                                    className="block rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                                >
                                    <CachedImage
                                        src={imageExpanded ? imageUrl! : thumbUrl!}
                                        alt={post.filename || 'Image'}
                                        className={imageExpanded
                                            ? "max-w-full max-h-96 object-contain"
                                            : "w-40 h-40 object-cover"
                                        }
                                    />
                                </button>
                                {post.filename && (
                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-40">
                                        {post.filename}{post.ext}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                            {post.sub && (
                                <h3 className="font-bold text-lg mb-2 text-white">{post.sub}</h3>
                            )}

                            {post.com && (
                                <div
                                    className="post-content text-gray-200"
                                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-dark-border bg-dark-elevated/50">
                    <button
                        onClick={() => {
                            onScrollToPost(post.no);
                            onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 
                                  rounded-lg text-sm font-medium transition-colors"
                    >
                        <ArrowUp className="w-4 h-4" />
                        Jump to Post
                    </button>

                    {hasImage && (
                        <button
                            onClick={() => setImageExpanded(!imageExpanded)}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-elevated hover:bg-dark-hover 
                                      border border-dark-border rounded-lg text-sm transition-colors"
                        >
                            {imageExpanded ? (
                                <>
                                    <ZoomOut className="w-4 h-4" />
                                    Shrink
                                </>
                            ) : (
                                <>
                                    <ZoomIn className="w-4 h-4" />
                                    Expand Image
                                </>
                            )}
                        </button>
                    )}

                    <span className="ml-auto text-xs text-gray-500">
                        Press Escape or click outside to close
                    </span>
                </div>
            </div>
        </div>
    );
}
