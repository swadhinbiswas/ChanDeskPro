// Board color themes
export const boardThemes: Record<string, string> = {
    // Technology
    'g': '#6366f1',
    'sci': '#6366f1',
    'diy': '#6366f1',

    // Video Games
    'v': '#10b981',
    'vg': '#10b981',
    'vr': '#10b981',

    // Japanese Culture
    'a': '#ec4899',
    'jp': '#ec4899',
    'c': '#ec4899',

    // Creative
    'po': '#8b5cf6',
    'gd': '#8b5cf6',
    'wg': '#8b5cf6',

    // Music
    'mu': '#f59e0b',

    // Misc
    'b': '#6b7280',
    'r9k': '#6b7280',
};

// Get theme color for a board
export function getBoardTheme(board: string): string {
    return boardThemes[board] || '#6b7280';
}

// Design tokens
export const colors = {
    dark: {
        bg: '#1a1a1a',
        surface: '#242424',
        elevated: '#2d2d2d',
        border: '#3a3a3a',
        hover: '#353535',
    },
    primary: {
        '500': '#6366f1',
        '600': '#4f46e5',
    },
    greentext: '#789922',
    quotelink: '#d00',
};

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
};

export const fontSize = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
};

export const animation = {
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    easing: {
        ease: 'ease-in-out',
        easeOut: 'ease-out',
        easeIn: 'ease-in',
    },
};
