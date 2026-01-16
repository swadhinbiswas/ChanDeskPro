import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Preset theme definitions
export interface ThemeColors {
    accent: string
    background: string
    surface: string
    elevated: string
    border: string
    text: string
    textSecondary: string
}

export const PRESET_THEMES: Record<string, ThemeColors> = {
    default: {
        accent: '#6366f1',
        background: '#1a1a1a',
        surface: '#242424',
        elevated: '#2d2d2d',
        border: '#3a3a3a',
        text: '#ffffff',
        textSecondary: '#9ca3af',
    },
    nord: {
        accent: '#88c0d0',
        background: '#2e3440',
        surface: '#3b4252',
        elevated: '#434c5e',
        border: '#4c566a',
        text: '#eceff4',
        textSecondary: '#d8dee9',
    },
    dracula: {
        accent: '#bd93f9',
        background: '#282a36',
        surface: '#44475a',
        elevated: '#383a59',
        border: '#6272a4',
        text: '#f8f8f2',
        textSecondary: '#bfbfbf',
    },
    monokai: {
        accent: '#f92672',
        background: '#272822',
        surface: '#3e3d32',
        elevated: '#49483e',
        border: '#75715e',
        text: '#f8f8f2',
        textSecondary: '#a6a28c',
    },
    gruvbox: {
        accent: '#fe8019',
        background: '#282828',
        surface: '#3c3836',
        elevated: '#504945',
        border: '#665c54',
        text: '#ebdbb2',
        textSecondary: '#a89984',
    },
    solarized: {
        accent: '#268bd2',
        background: '#002b36',
        surface: '#073642',
        elevated: '#094753',
        border: '#586e75',
        text: '#93a1a1',
        textSecondary: '#839496',
    },
    catppuccin: {
        accent: '#cba6f7',
        background: '#1e1e2e',
        surface: '#313244',
        elevated: '#45475a',
        border: '#585b70',
        text: '#cdd6f4',
        textSecondary: '#a6adc8',
    },
}

interface Settings {
    // General
    autoRefreshEnabled: boolean
    autoRefreshInterval: number // in seconds
    showNSFW: boolean
    theme: 'dark' | 'light' | 'auto'
    chanPassToken: string | null

    // Appearance
    fontSize: number
    viewDensity: 'compact' | 'comfortable' | 'spacious'
    boardThemesEnabled: boolean

    // Custom Theme
    presetTheme: string
    customColors: ThemeColors
    useCustomColors: boolean

    // Behavior
    threadAutoScroll: boolean
    mediaAutoPlay: boolean

    // Privacy
    nsfwBlur: boolean
    disableImageLoading: boolean
    clearCacheOnExit: boolean
    proxyUrl: string

    // Notifications
    desktopNotifications: boolean
    notificationSound: boolean

    // Cache
    threadCacheEnabled: boolean
    maxCacheAgeDays: number
    maxCacheSizeMB: number
}

interface SettingsStore extends Settings {
    updateSettings: (settings: Partial<Settings>) => void
    toggleAutoRefresh: () => void
    setChanPassToken: (token: string | null) => void
    resetSettings: () => void
    applyPresetTheme: (presetName: string) => void
}

const defaultSettings: Settings = {
    autoRefreshEnabled: true,
    autoRefreshInterval: 60,
    showNSFW: false,
    theme: 'dark',
    chanPassToken: null,
    fontSize: 14,
    viewDensity: 'comfortable',
    boardThemesEnabled: true,
    // Custom theme defaults
    presetTheme: 'default',
    customColors: PRESET_THEMES.default,
    useCustomColors: false,
    // Behavior
    threadAutoScroll: true,
    mediaAutoPlay: true,
    nsfwBlur: true,
    disableImageLoading: false,
    clearCacheOnExit: false,
    proxyUrl: '',
    desktopNotifications: true,
    notificationSound: true,
    // Cache defaults
    threadCacheEnabled: true,
    maxCacheAgeDays: 7,
    maxCacheSizeMB: 100,
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            ...defaultSettings,

            updateSettings: (newSettings) =>
                set((state) => ({ ...state, ...newSettings })),

            toggleAutoRefresh: () =>
                set((state) => ({ autoRefreshEnabled: !state.autoRefreshEnabled })),

            setChanPassToken: (token) =>
                set({ chanPassToken: token }),

            resetSettings: () =>
                set(defaultSettings),

            applyPresetTheme: (presetName) =>
                set({
                    presetTheme: presetName,
                    customColors: PRESET_THEMES[presetName] || PRESET_THEMES.default,
                }),
        }),
        {
            name: 'settings-storage',
        }
    )
)
