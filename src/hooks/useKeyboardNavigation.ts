/**
 * Keyboard Navigation Hook
 * 
 * Provides vim-style keyboard navigation for threads:
 * - j/k: Navigate between posts
 * - o: Expand current post's image
 * - r: Open quick reply
 * - ?: Show shortcuts help
 * - g + t: Go to top
 * - g + b: Go to bottom
 */

import { useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationProps {
    enabled?: boolean;
    postCount: number;
    onExpandImage?: (index: number) => void;
    onOpenReply?: () => void;
    onShowHelp?: () => void;
    onOpenInBrowser?: () => void;
}

export function useKeyboardNavigation({
    enabled = true,
    postCount,
    onExpandImage,
    onOpenReply,
    onShowHelp,
    onOpenInBrowser,
}: UseKeyboardNavigationProps) {
    const currentPostIndex = useRef(0);
    const lastKeyTime = useRef(0);
    const lastKey = useRef('');

    const scrollToPost = useCallback((index: number) => {
        const posts = document.querySelectorAll('[id^="post-"]');
        if (posts[index]) {
            posts[index].scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Add highlight effect
            posts[index].classList.add('ring-2', 'ring-purple-500', 'ring-opacity-50');
            setTimeout(() => {
                posts[index].classList.remove('ring-2', 'ring-purple-500', 'ring-opacity-50');
            }, 1500);
        }
    }, []);

    const navigateToPost = useCallback((direction: 'next' | 'prev') => {
        const newIndex = direction === 'next'
            ? Math.min(currentPostIndex.current + 1, postCount - 1)
            : Math.max(currentPostIndex.current - 1, 0);

        currentPostIndex.current = newIndex;
        scrollToPost(newIndex);
    }, [postCount, scrollToPost]);

    const goToTop = useCallback(() => {
        currentPostIndex.current = 0;
        scrollToPost(0);
    }, [scrollToPost]);

    const goToBottom = useCallback(() => {
        currentPostIndex.current = postCount - 1;
        scrollToPost(postCount - 1);
    }, [postCount, scrollToPost]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't handle if user is typing in an input
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            const now = Date.now();
            const timeSinceLastKey = now - lastKeyTime.current;

            switch (e.key.toLowerCase()) {
                case 'j':
                    e.preventDefault();
                    navigateToPost('next');
                    break;

                case 'k':
                    e.preventDefault();
                    navigateToPost('prev');
                    break;

                case 'o':
                    e.preventDefault();
                    onExpandImage?.(currentPostIndex.current);
                    break;

                case 'r':
                    e.preventDefault();
                    onOpenReply?.();
                    break;

                case '?':
                    e.preventDefault();
                    onShowHelp?.();
                    break;

                case 'g':
                    // Check for 'g' + 't' or 'g' + 'b' combo
                    if (lastKey.current === 'g' && timeSinceLastKey < 500) {
                        // Already pressed 'g', waiting for second key
                    }
                    break;

                case 't':
                    if (lastKey.current === 'g' && timeSinceLastKey < 500) {
                        e.preventDefault();
                        goToTop();
                    }
                    break;

                case 'b':
                    if (lastKey.current === 'g' && timeSinceLastKey < 500) {
                        // g + b combo = go to bottom
                        e.preventDefault();
                        goToBottom();
                    } else {
                        // Standalone 'b' = open in browser
                        e.preventDefault();
                        onOpenInBrowser?.();
                    }
                    break;

                case 'home':
                    e.preventDefault();
                    goToTop();
                    break;

                case 'end':
                    e.preventDefault();
                    goToBottom();
                    break;
            }

            lastKey.current = e.key.toLowerCase();
            lastKeyTime.current = now;
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enabled, navigateToPost, goToTop, goToBottom, onExpandImage, onOpenReply, onShowHelp, onOpenInBrowser]);

    return {
        currentPostIndex: currentPostIndex.current,
        goToTop,
        goToBottom,
        navigateToPost,
    };
}
