import { motion } from 'framer-motion';
import { MessageCircle, Image as ImageIcon, Pin, Lock } from 'lucide-react';
import { CatalogThread } from '../../types/api';
import { getThumbnailUrl } from '../../utils/apiClient';
import { extractPlainText } from '../../utils/parser';
import { formatNumber } from '../../utils/formatters';
import { getBoardTheme } from '../../lib/design-tokens';

interface ThreadCardProps {
    thread: CatalogThread;
    board: string;
    onClick: () => void;
}

export default function ThreadCard({ thread, board, onClick }: ThreadCardProps) {
    const themeColor = getBoardTheme(board);
    const excerpt = extractPlainText(thread.com, 150);
    const hasThumbnail = thread.tim && thread.ext;

    return (
        <motion.div
            whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onClick}
            className="thread-card cursor-pointer bg-dark-surface rounded-lg overflow-hidden border border-dark-border hover:border-primary-500/50 transition-colors"
            style={{
                borderTopColor: themeColor,
                borderTopWidth: '3px',
            }}
        >
            {/* Thumbnail */}
            {hasThumbnail ? (
                <div className="aspect-video bg-dark-elevated relative overflow-hidden">
                    <img
                        src={getThumbnailUrl(board, thread.tim!)}
                        alt={thread.filename || 'Thread image'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        {thread.sticky === 1 && (
                            <div className="bg-green-600 p-1 rounded">
                                <Pin className="w-3 h-3 text-white" />
                            </div>
                        )}
                        {thread.closed === 1 && (
                            <div className="bg-red-600 p-1 rounded">
                                <Lock className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="aspect-video bg-dark-elevated flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-gray-600" />
                </div>
            )}

            {/* Content */}
            <div className="p-3">
                {/* Subject */}
                {thread.sub && (
                    <h3 className="font-semibold text-sm mb-1 truncate" title={thread.sub}>
                        {thread.sub}
                    </h3>
                )}

                {/* Excerpt */}
                {excerpt && (
                    <p className="text-xs text-gray-400 truncate-2 mb-2 leading-relaxed">
                        {excerpt}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{formatNumber(thread.replies)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{formatNumber(thread.images)}</span>
                    </div>
                    {thread.unique_ips && (
                        <div className="flex items-center gap-1">
                            <span className="text-[10px]">👤</span>
                            <span>{thread.unique_ips}</span>
                        </div>
                    )}
                </div>

                {/* Limit indicators */}
                {(thread.bumplimit === 1 || thread.imagelimit === 1) && (
                    <div className="flex gap-1 mt-2">
                        {thread.bumplimit === 1 && (
                            <span className="text-[10px] px-2 py-0.5 bg-orange-600/20 text-orange-400 rounded">
                                Bump Limit
                            </span>
                        )}
                        {thread.imagelimit === 1 && (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded">
                                Image Limit
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
