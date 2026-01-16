import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Plus, Trash2, Filter as FilterIcon, Download, Upload,
    ToggleLeft, ToggleRight, AlertCircle,
    Search, Hash, User, FileText, Code
} from 'lucide-react'
import { useFilterStore, type Filter as FilterData, type FilterType } from '../../stores/filterStore'

interface FilterManagerProps {
    isOpen: boolean
    onClose: () => void
}

const FILTER_TYPE_OPTIONS: { type: FilterType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'keyword', label: 'Keyword', icon: <Search size={16} />, description: 'Hide posts containing this text' },
    { type: 'subject', label: 'Subject', icon: <FileText size={16} />, description: 'Hide threads with this subject' },
    { type: 'name', label: 'Name', icon: <User size={16} />, description: 'Hide posts from this username' },
    { type: 'tripcode', label: 'Tripcode', icon: <Hash size={16} />, description: 'Hide posts with this tripcode' },
    { type: 'regex', label: 'Regex', icon: <Code size={16} />, description: 'Hide posts matching this pattern' },
]

export default function FilterManager({ isOpen, onClose }: FilterManagerProps) {
    const { filters, addFilter, removeFilter, toggleFilter, updateFilter, clearFilters, exportFilters, importFilters } = useFilterStore()

    const [newFilter, setNewFilter] = useState({
        type: 'keyword' as FilterType,
        value: '',
        caseSensitive: false,
        hideThread: false,
        boards: [] as string[],
    })
    const [regexError, setRegexError] = useState<string | null>(null)
    const [showImportExport, setShowImportExport] = useState(false)

    const validateRegex = (pattern: string): boolean => {
        if (newFilter.type !== 'regex') return true
        try {
            new RegExp(pattern)
            setRegexError(null)
            return true
        } catch (e) {
            setRegexError((e as Error).message)
            return false
        }
    }

    const handleAddFilter = () => {
        if (!newFilter.value.trim()) return
        if (newFilter.type === 'regex' && !validateRegex(newFilter.value)) return

        addFilter({
            ...newFilter,
            enabled: true,
        })

        setNewFilter({
            type: 'keyword',
            value: '',
            caseSensitive: false,
            hideThread: false,
            boards: [],
        })
    }

    const handleExport = () => {
        const data = JSON.stringify(exportFilters(), null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'chandesk-filters.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string)
                if (Array.isArray(data)) {
                    importFilters(data)
                }
            } catch (err) {
                console.error('Failed to import filters:', err)
            }
        }
        reader.readAsText(file)
    }

    const enabledCount = useMemo(() => filters.filter(f => f.enabled).length, [filters])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                        <div className="flex items-center gap-3">
                            <FilterIcon size={20} className="text-purple-400" />
                            <h2 className="text-lg font-semibold text-white">Content Filters</h2>
                            {enabledCount > 0 && (
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                    {enabledCount} active
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowImportExport(!showImportExport)}
                                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                title="Import/Export"
                            >
                                {showImportExport ? <X size={18} /> : <Download size={18} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Import/Export Panel */}
                    <AnimatePresence>
                        {showImportExport && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-b border-zinc-700 overflow-hidden"
                            >
                                <div className="p-4 bg-zinc-800/50 flex gap-4">
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                                    >
                                        <Download size={16} />
                                        Export Filters
                                    </button>
                                    <label className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors cursor-pointer">
                                        <Upload size={16} />
                                        Import Filters
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImport}
                                            className="hidden"
                                        />
                                    </label>
                                    {filters.length > 0 && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete all filters?')) clearFilters()
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors ml-auto"
                                        >
                                            <Trash2 size={16} />
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Add New Filter */}
                    <div className="p-4 border-b border-zinc-700 bg-zinc-800/30">
                        <div className="flex gap-3 items-start">
                            <select
                                value={newFilter.type}
                                onChange={(e) => setNewFilter({ ...newFilter, type: e.target.value as FilterType })}
                                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                                {FILTER_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.type} value={opt.type}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newFilter.value}
                                    onChange={(e) => {
                                        setNewFilter({ ...newFilter, value: e.target.value })
                                        if (newFilter.type === 'regex') validateRegex(e.target.value)
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
                                    placeholder={
                                        newFilter.type === 'regex'
                                            ? 'Enter regex pattern...'
                                            : `Enter ${newFilter.type} to filter...`
                                    }
                                    className={`w-full bg-zinc-700 border rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none ${regexError ? 'border-red-500' : 'border-zinc-600 focus:border-purple-500'
                                        }`}
                                />
                                {regexError && (
                                    <p className="absolute -bottom-5 left-0 text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {regexError}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleAddFilter}
                                disabled={!newFilter.value.trim() || !!regexError}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>

                        <div className="flex gap-4 mt-3 text-sm">
                            <label className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newFilter.caseSensitive}
                                    onChange={(e) => setNewFilter({ ...newFilter, caseSensitive: e.target.checked })}
                                    className="rounded bg-zinc-700 border-zinc-600"
                                />
                                Case sensitive
                            </label>
                            <label className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newFilter.hideThread}
                                    onChange={(e) => setNewFilter({ ...newFilter, hideThread: e.target.checked })}
                                    className="rounded bg-zinc-700 border-zinc-600"
                                />
                                Hide entire thread
                            </label>
                        </div>
                    </div>

                    {/* Filter List */}
                    <div className="overflow-y-auto max-h-[45vh] p-4">
                        {filters.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                <FilterIcon size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No filters yet</p>
                                <p className="text-sm">Add a filter above to hide unwanted content</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filters.map((filter) => (
                                    <FilterItem
                                        key={filter.id}
                                        filter={filter}
                                        onToggle={() => toggleFilter(filter.id)}
                                        onDelete={() => removeFilter(filter.id)}
                                        onUpdate={(updates) => updateFilter(filter.id, updates)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

interface FilterItemProps {
    filter: FilterData
    onToggle: () => void
    onDelete: () => void
    onUpdate: (updates: Partial<FilterData>) => void
}

function FilterItem({ filter, onToggle, onDelete, onUpdate }: FilterItemProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(filter.value)

    const typeOption = FILTER_TYPE_OPTIONS.find(o => o.type === filter.type)

    const handleSave = () => {
        if (editValue.trim()) {
            onUpdate({ value: editValue })
        }
        setIsEditing(false)
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${filter.enabled
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-zinc-800/50 border-zinc-700/50 opacity-60'
                }`}
        >
            <button onClick={onToggle} className="text-zinc-400 hover:text-purple-400 transition-colors">
                {filter.enabled ? <ToggleRight size={24} className="text-purple-400" /> : <ToggleLeft size={24} />}
            </button>

            <div className="text-zinc-500" title={typeOption?.description}>
                {typeOption?.icon}
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
                    />
                ) : (
                    <span
                        onClick={() => setIsEditing(true)}
                        className="text-white truncate block cursor-pointer hover:text-purple-300"
                        title={filter.value}
                    >
                        {filter.value}
                    </span>
                )}
                <div className="flex gap-2 mt-1 text-xs text-zinc-500">
                    <span className="capitalize">{filter.type}</span>
                    {filter.caseSensitive && <span>• Case sensitive</span>}
                    {filter.hideThread && <span>• Hides thread</span>}
                </div>
            </div>

            <button
                onClick={() => {
                    if (confirm(`Delete filter "${filter.value}"?`)) onDelete()
                }}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
                <Trash2 size={16} />
            </button>
        </motion.div>
    )
}
