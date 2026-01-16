// Frontend type definitions matching Rust backend

export interface BoardInfo {
    id: string
    name: string
    category: BoardCategory
    nsfw: boolean
    description?: string
}

export type BoardCategory =
    | 'Favorites'
    | 'Recent'
    | 'JapaneseCulture'
    | 'VideoGames'
    | 'Interests'
    | 'Creative'
    | 'Other'
    | 'Misc'
    | 'Adult'

export const CATEGORY_ICONS: Record<BoardCategory, string> = {
    Favorites: '⭐',
    Recent: '📜',
    JapaneseCulture: '👺',
    VideoGames: '🎮',
    Interests: '💡',
    Creative: '🎨',
    Other: '📝',
    Misc: '🔞',
    Adult: '⛔',
}

export const CATEGORY_COLORS: Record<BoardCategory, string> = {
    Favorites: '#fbbf24', // amber
    Recent: '#60a5fa', // blue 400
    JapaneseCulture: '#f472b6', // pink 400
    VideoGames: '#a78bfa', // purple 400
    Interests: '#34d399', // emerald 400
    Creative: '#f87171', // red 400
    Other: '#9ca3af', // gray 400
    Misc: '#ef4444', // red 500
    Adult: '#ef4444', // red 500
}
