/**
 * Theme Provider Hook
 * 
 * Applies the selected theme and custom colors from settings to the document.
 * Handles dark/light/auto modes and custom color schemes.
 */

import { useEffect } from 'react';
import { useSettingsStore, PRESET_THEMES } from '../stores/settingsStore';

export function useTheme() {
    const theme = useSettingsStore((state) => state.theme);
    const customColors = useSettingsStore((state) => state.customColors);
    const presetTheme = useSettingsStore((state) => state.presetTheme);

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        // Remove existing theme classes
        root.classList.remove('dark', 'light');
        body.classList.remove('theme-dark', 'theme-light');

        let effectiveTheme: 'dark' | 'light';

        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            effectiveTheme = prefersDark ? 'dark' : 'light';
        } else {
            effectiveTheme = theme;
        }

        // Apply theme class to root for Tailwind
        root.classList.add(effectiveTheme);
        // Apply theme class to body for custom CSS
        body.classList.add(`theme-${effectiveTheme}`);

        // Apply custom colors via CSS variables
        const colors = customColors || PRESET_THEMES[presetTheme] || PRESET_THEMES.default;

        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-bg', colors.background);
        root.style.setProperty('--color-surface', colors.surface);
        root.style.setProperty('--color-elevated', colors.elevated);
        root.style.setProperty('--color-border', colors.border);
        root.style.setProperty('--color-text', colors.text);
        root.style.setProperty('--color-text-secondary', colors.textSecondary);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', colors.background);
        }

        // Listen for system theme changes when in auto mode
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                root.classList.remove('dark', 'light');
                body.classList.remove('theme-dark', 'theme-light');
                const newTheme = e.matches ? 'dark' : 'light';
                root.classList.add(newTheme);
                body.classList.add(`theme-${newTheme}`);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme, customColors, presetTheme]);

    return { theme, customColors, presetTheme };
}
