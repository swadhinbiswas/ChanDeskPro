/**
 * Global Link Click Handler
 * 
 * Intercepts clicks on ALL external links and opens them in the in-app browser
 * so users never leave the ChanDesk application.
 */

import { useEffect } from 'react';
import { useBrowserTabsStore } from '../stores/browserTabsStore';

// URLs that should open directly (media files, not in iframe)
const DIRECT_OPEN_PATTERNS = [
    /\.(jpg|jpeg|png|gif|webp|webm|mp4|mp3|pdf)$/i,
];

function shouldOpenDirectly(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        return DIRECT_OPEN_PATTERNS.some(pattern => pattern.test(path));
    } catch {
        return false;
    }
}

function isExternalUrl(url: string): boolean {
    try {
        const urlObj = new URL(url, window.location.origin);
        // If same origin (localhost/app), not external
        if (urlObj.origin === window.location.origin) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

function extractTitle(anchor: HTMLAnchorElement, url: string): string {
    // Try to get meaningful title from the link
    const text = anchor.textContent?.trim();
    if (text && text.length > 0 && text.length < 100) {
        return text;
    }
    // Fall back to domain
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return 'External Link';
    }
}

export function useLinkClickHandler() {
    const { openTab } = useBrowserTabsStore();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Find the closest anchor element
            const anchor = target.closest('a') as HTMLAnchorElement | null;
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Skip if it's a relative path (internal navigation)
            if (href.startsWith('/') && !href.startsWith('//')) {
                return;
            }

            // Skip anchor links
            if (href.startsWith('#')) {
                return;
            }

            // Skip javascript: links
            if (href.startsWith('javascript:')) {
                return;
            }

            // Skip mailto: and tel: links
            if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            // If Ctrl/Cmd + click, open in external browser (system default)
            if (e.ctrlKey || e.metaKey) {
                // Let the default behavior happen (opens in system browser via Tauri)
                return;
            }

            // Check if it's an external URL
            if (isExternalUrl(href)) {
                e.preventDefault();
                e.stopPropagation();

                // If it's a direct media file, open in system browser
                if (shouldOpenDirectly(href)) {
                    window.open(href, '_blank');
                    return;
                }

                // Get title for the tab
                const title = extractTitle(anchor, href);

                // Open in in-app browser
                openTab(href, title);
            }
        };

        // Use capture phase to intercept before other handlers
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [openTab]);
}

/**
 * Hook for programmatically opening URLs in the in-app browser
 */
export function useOpenInBrowser() {
    const { openTab } = useBrowserTabsStore();

    const openInBrowser = (url: string, title?: string) => {
        try {
            new URL(url); // Validate URL
            openTab(url, title);
        } catch {
            console.error('Invalid URL:', url);
        }
    };

    return openInBrowser;
}
