import DOMPurify from 'dompurify';

/**
 * Parse and sanitize 4chan HTML content
 */
export function parsePostContent(html: string | undefined): string {
    if (!html) return '';

    // Sanitize HTML to prevent XSS
    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['br', 'span', 'a', 'wbr', 's', 'strong', 'em'],
        ALLOWED_ATTR: ['class', 'href'],
    });

    return clean;
}

/**
 * Extract quote links from post content
 */
export function extractQuoteLinks(html: string | undefined): number[] {
    if (!html) return [];

    const quoteRegex = /&gt;&gt;(\d+)/g;
    const matches = [...html.matchAll(quoteRegex)];

    return matches.map((match) => parseInt(match[1], 10));
}

/**
 * Check if a line is greentext
 */
export function isGreentext(line: string): boolean {
    return line.trim().startsWith('&gt;') && !line.trim().startsWith('&gt;&gt;');
}

/**
 * Format post content for display (identify greentext, quote links)
 */
export function formatPostContent(html: string | undefined): {
    content: string;
    quoteLinks: number[];
    hasGreentext: boolean;
} {
    if (!html) {
        return { content: '', quoteLinks: [], hasGreentext: false };
    }

    const content = parsePostContent(html);
    const quoteLinks = extractQuoteLinks(html);
    const lines = html.split('<br>');
    const hasGreentext = lines.some(isGreentext);

    return { content, quoteLinks, hasGreentext };
}

/**
 * Extract first N characters of plain text from HTML
 */
export function extractPlainText(html: string | undefined, maxLength: number = 200): string {
    if (!html) return '';

    // Remove HTML tags
    const text = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");

    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength) + '...';
}

/**
 * Convert >>12345 style quote links to clickable elements
 */
export function renderQuoteLinks(content: string, onQuoteClick?: (postNo: number) => void): string {
    return content.replace(
        /&gt;&gt;(\d+)/g,
        (match, postNo) => {
            return `<span class="quotelink" data-post-no="${postNo}">&gt;&gt;${postNo}</span>`;
        }
    );
}
