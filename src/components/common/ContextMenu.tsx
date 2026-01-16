import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Copy,
    Filter,
    MessageSquare,
    ExternalLink,
    Download,
    Flag,
    Eye,
    EyeOff
} from 'lucide-react'

export interface ContextMenuItem {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    danger?: boolean
    divider?: boolean
}

interface ContextMenuProps {
    x: number
    y: number
    items: ContextMenuItem[]
    onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    // Adjust position if menu would overflow viewport
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // Adjust X if overflowing right
            if (rect.right > viewportWidth) {
                menuRef.current.style.left = `${x - rect.width}px`
            }

            // Adjust Y if overflowing bottom
            if (rect.bottom > viewportHeight) {
                menuRef.current.style.top = `${y - rect.height}px`
            }
        }
    }, [x, y])

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="fixed z-[100] min-w-48 bg-dark-elevated border border-dark-border rounded-lg shadow-elevation-3 py-1 overflow-hidden"
                style={{ left: x, top: y }}
            >
                {items.map((item, index) => (
                    <div key={index}>
                        {item.divider && index > 0 && (
                            <div className="my-1 border-t border-dark-border" />
                        )}
                        <button
                            onClick={() => {
                                item.onClick()
                                onClose()
                            }}
                            className={`w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors ${item.danger
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : 'text-gray-300 hover:bg-dark-hover hover:text-white'
                                }`}
                        >
                            {item.icon && (
                                <span className="w-4 h-4 flex items-center justify-center">
                                    {item.icon}
                                </span>
                            )}
                            {item.label}
                        </button>
                    </div>
                ))}
            </motion.div>
        </AnimatePresence>
    )
}

// Hook to use context menu
export function useContextMenu() {
    const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
        items: ContextMenuItem[]
    } | null>(null)

    const showContextMenu = (
        e: React.MouseEvent,
        items: ContextMenuItem[]
    ) => {
        e.preventDefault()
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            items,
        })
    }

    const hideContextMenu = () => {
        setContextMenu(null)
    }

    return {
        contextMenu,
        showContextMenu,
        hideContextMenu,
    }
}

// Pre-defined menu item creators for common actions
export const createPostMenuItems = (
    postNo: number,
    options: {
        onQuote?: () => void
        onCopyLink?: () => void
        onCopyText?: () => void
        onFilter?: () => void
        onHide?: () => void
        onReport?: () => void
    }
): ContextMenuItem[] => {
    const items: ContextMenuItem[] = []

    if (options.onQuote) {
        items.push({
            label: 'Quote Post',
            icon: <MessageSquare className="w-4 h-4" />,
            onClick: options.onQuote,
        })
    }

    if (options.onCopyLink) {
        items.push({
            label: 'Copy Post Link',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: options.onCopyLink,
        })
    }

    if (options.onCopyText) {
        items.push({
            label: 'Copy Text',
            icon: <Copy className="w-4 h-4" />,
            onClick: options.onCopyText,
        })
    }

    if (options.onFilter) {
        items.push({
            label: 'Filter This User',
            icon: <Filter className="w-4 h-4" />,
            onClick: options.onFilter,
            divider: true,
        })
    }

    if (options.onHide) {
        items.push({
            label: 'Hide Post',
            icon: <EyeOff className="w-4 h-4" />,
            onClick: options.onHide,
        })
    }

    if (options.onReport) {
        items.push({
            label: 'Report Post',
            icon: <Flag className="w-4 h-4" />,
            onClick: options.onReport,
            danger: true,
            divider: true,
        })
    }

    return items
}
