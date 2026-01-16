/**
 * Provider Tabs Component
 * 
 * Premium tab bar for switching between imageboard providers (4chan, 7chan, etc.)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings as SettingsIcon, X } from 'lucide-react'
import { providerRegistry } from '../../providers'
import { useProviderStore } from '../../stores/providerStore'
import Settings from '../common/Settings'

export default function ProviderTabs() {
    const { activeProviderId, setActiveProvider } = useProviderStore()
    const providers = providerRegistry.getAll()
    const [showAddMenu, setShowAddMenu] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    // Ctrl+, keyboard shortcut for Settings
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault()
                setShowSettings(s => !s)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <>
            <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <div className="flex items-center h-10 px-2 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border-b border-zinc-800">
                {/* Provider Tabs */}
                <div className="flex items-center gap-0.5">
                    {providers.map((provider, index) => {
                        const isActive = provider.id === activeProviderId

                        return (
                            <motion.button
                                key={provider.id}
                                onClick={() => setActiveProvider(provider.id)}
                                className={`
                                relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg
                                transition-all duration-200 text-sm font-medium
                                border-t border-l border-r
                                ${isActive
                                        ? 'text-white bg-zinc-800 border-zinc-700 -mb-[1px] z-10'
                                        : 'text-zinc-500 hover:text-zinc-300 bg-transparent border-transparent hover:bg-zinc-800/50'
                                    }
                            `}
                                whileHover={{ y: isActive ? 0 : -1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Active indicator line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute top-0 left-0 right-0 h-0.5 rounded-t"
                                        style={{ backgroundColor: provider.color }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {/* Provider Icon */}
                                <span className="text-sm">{provider.icon}</span>

                                {/* Provider Name */}
                                <span>{provider.shortName}</span>
                            </motion.button>
                        )
                    })}

                    {/* Add Provider Button */}
                    <div className="relative ml-1">
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="flex items-center justify-center w-6 h-6 rounded
                                   text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800
                                   transition-colors"
                            title="Add imageboard"
                        >
                            <Plus size={14} />
                        </button>

                        {/* Add Menu Dropdown */}
                        <AnimatePresence>
                            {showAddMenu && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowAddMenu(false)}
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-1 w-52 bg-zinc-900 
                                               border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between p-2 border-b border-zinc-800">
                                            <span className="text-xs text-zinc-500 uppercase font-medium">Switch Chan</span>
                                            <button
                                                onClick={() => setShowAddMenu(false)}
                                                className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-zinc-800"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        <div className="p-1">
                                            {providers.map((provider) => (
                                                <button
                                                    key={provider.id}
                                                    onClick={() => {
                                                        setActiveProvider(provider.id)
                                                        setShowAddMenu(false)
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded
                                                           transition-colors text-left text-sm
                                                           ${provider.id === activeProviderId
                                                            ? 'bg-zinc-800 text-white'
                                                            : 'hover:bg-zinc-800/70 text-zinc-400 hover:text-white'
                                                        }`}
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: provider.color }}
                                                    />
                                                    <span>{provider.icon}</span>
                                                    <span className="flex-1">{provider.name}</span>
                                                    {provider.id === activeProviderId && (
                                                        <span className="text-xs text-purple-400">●</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="border-t border-zinc-800 p-1">
                                            <button
                                                className="w-full flex items-center gap-2 px-3 py-2 
                                                       text-zinc-500 hover:text-white hover:bg-zinc-800/70 
                                                       rounded transition-colors text-sm"
                                                onClick={() => setShowAddMenu(false)}
                                            >
                                                <Plus size={14} />
                                                <span>Add Custom...</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* App Branding */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                            C
                        </div>
                        <span className="text-sm font-semibold text-white">ChanDesk Pro</span>
                    </div>

                    {/* Settings */}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center justify-center w-7 h-7 rounded
                               text-zinc-500 hover:text-white hover:bg-zinc-800
                               transition-colors"
                        title="Settings (Ctrl+,)"
                    >
                        <SettingsIcon size={16} />
                    </button>
                </div>
            </div>
        </>
    )
}
