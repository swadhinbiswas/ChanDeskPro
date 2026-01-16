import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
}

/**
 * Format timestamp to absolute time
 */
export function formatAbsoluteTime(timestamp: number): string {
    return format(new Date(timestamp * 1000), 'MM/dd/yy HH:mm:ss');
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format number with K/M suffixes
 */
export function formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
}

/**
 * Format image dimensions
 */
export function formatDimensions(width: number, height: number): string {
    return `${width}×${height}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Get board category
 */
export function getBoardCategory(board: string): string {
    const categories: Record<string, string[]> = {
        'Technology': ['g', 'sci', 'diy', 'wsr'],
        'Video Games': ['v', 'vg', 'vr', 'vm'],
        'Japanese Culture': ['a', 'jp', 'c', 'w', 'm', 'cgl', 'cm', 'f', 'n', 'y'],
        'Creative': ['po', 'p', 'ck', 'ic', 'wg', 'mu', 'fa', 'toy', '3', 'gd', 'diy', 'wsg'],
        'Adult': ['b', 'r9k', 'pol', 'bant', 'soc', 's4s'],
        'Other': [],
    };

    for (const [category, boards] of Object.entries(categories)) {
        if (boards.includes(board)) return category;
    }

    return 'Other';
}
