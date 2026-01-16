import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings as SettingsIcon, Moon, Sun, Type, Eye, Bell, Trash2, Key, Check, Loader2, HardDrive, RefreshCw, Palette } from 'lucide-react';
import { useSettingsStore, PRESET_THEMES } from '../../stores/settingsStore';
import { validatePassToken } from '../../utils/apiClient';
import { getCacheStats, clearThreadCache, runCacheCleanup, formatBytes, type CacheStats } from '../../services/cacheService';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
    const settings = useSettingsStore();
    const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'privacy' | 'notifications' | 'account' | 'storage'>('appearance');
    const [passToken, setPassToken] = useState(settings.chanPassToken || '');
    const [isValidating, setIsValidating] = useState(false);
    const [passStatus, setPassStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
    const [isCacheLoading, setIsCacheLoading] = useState(false);

    // Load cache stats when storage tab is active
    useEffect(() => {
        if (isOpen && activeTab === 'storage') {
            loadCacheStats();
        }
    }, [isOpen, activeTab]);

    const loadCacheStats = async () => {
        setIsCacheLoading(true);
        try {
            const stats = await getCacheStats();
            setCacheStats(stats);
        } catch (e) {
            console.error('Failed to load cache stats:', e);
        }
        setIsCacheLoading(false);
    };

    const handleClearCache = async () => {
        if (!confirm('Are you sure you want to clear all cached threads?')) return;
        setIsCacheLoading(true);
        try {
            await clearThreadCache();
            await loadCacheStats();
        } catch (e) {
            console.error('Failed to clear cache:', e);
        }
        setIsCacheLoading(false);
    };

    const handleCleanupCache = async () => {
        setIsCacheLoading(true);
        try {
            await runCacheCleanup(settings.maxCacheAgeDays, settings.maxCacheSizeMB);
            await loadCacheStats();
        } catch (e) {
            console.error('Failed to cleanup cache:', e);
        }
        setIsCacheLoading(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-dark-surface border border-dark-border rounded-lg shadow-elevation-3 w-full max-w-3xl max-h-[80vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-dark-border">
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5" />
                            <h2 className="text-xl font-bold">Settings</h2>
                        </div>
                        <button onClick={onClose} className="btn-ghost p-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-48 border-r border-dark-border p-2">
                            <button
                                onClick={() => setActiveTab('appearance')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === 'appearance' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-hover'
                                    }`}
                            >
                                Appearance
                            </button>
                            <button
                                onClick={() => setActiveTab('behavior')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === 'behavior' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-hover'
                                    }`}
                            >
                                Behavior
                            </button>
                            <button
                                onClick={() => setActiveTab('privacy')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === 'privacy' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-hover'
                                    }`}
                            >
                                Privacy
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === 'notifications' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-hover'
                                    }`}
                            >
                                Notifications
                            </button>
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === 'account' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-hover'
                                    }`}
                            >
                                4chan Pass
                            </button>
                            <button
                                onClick={() => setActiveTab('storage')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === 'storage' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-hover'
                                    }`}
                            >
                                Storage
                            </button>
                        </div>

                        {/* Settings Panel */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Moon className="w-5 h-5" />
                                            Appearance
                                        </h3>

                                        {/* Theme */}
                                        <div className="space-y-2 mb-4">
                                            <label className="text-sm font-medium">Theme</label>
                                            <div className="flex gap-2">
                                                {(['dark', 'light', 'auto'] as const).map((theme) => (
                                                    <button
                                                        key={theme}
                                                        onClick={() => settings.updateSettings({ theme })}
                                                        className={`btn flex-1 ${settings.theme === theme ? 'btn-primary' : 'btn-secondary'
                                                            }`}
                                                    >
                                                        {theme === 'dark' && <Moon className="w-4 h-4 mr-2" />}
                                                        {theme === 'light' && <Sun className="w-4 h-4 mr-2" />}
                                                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Scheme */}
                                        <div className="space-y-3 mb-4">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Palette className="w-4 h-4" />
                                                Color Scheme
                                            </label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Object.entries(PRESET_THEMES).map(([name, colors]) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => settings.applyPresetTheme(name)}
                                                        className={`relative p-2 rounded-lg border-2 transition-all ${settings.presetTheme === name
                                                                ? 'border-primary-500 ring-2 ring-primary-500/30'
                                                                : 'border-dark-border hover:border-gray-500'
                                                            }`}
                                                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                                                    >
                                                        {/* Color preview */}
                                                        <div className="flex gap-1 mb-1">
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-dark-border"
                                                                style={{ backgroundColor: colors.background }}
                                                            />
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-dark-border"
                                                                style={{ backgroundColor: colors.accent }}
                                                            />
                                                            <div
                                                                className="w-4 h-4 rounded-full border border-dark-border"
                                                                style={{ backgroundColor: colors.surface }}
                                                            />
                                                        </div>
                                                        <span className="text-xs capitalize truncate block">
                                                            {name}
                                                        </span>
                                                        {settings.presetTheme === name && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Accent Color */}
                                        <div className="space-y-2 mb-4">
                                            <label className="text-sm font-medium">Custom Accent Color</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={settings.customColors?.accent || '#6366f1'}
                                                    onChange={(e) => settings.updateSettings({
                                                        customColors: {
                                                            ...settings.customColors,
                                                            accent: e.target.value
                                                        }
                                                    })}
                                                    className="w-10 h-10 rounded cursor-pointer border-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={settings.customColors?.accent || '#6366f1'}
                                                    onChange={(e) => settings.updateSettings({
                                                        customColors: {
                                                            ...settings.customColors,
                                                            accent: e.target.value
                                                        }
                                                    })}
                                                    className="input flex-1 font-mono text-sm"
                                                    placeholder="#6366f1"
                                                />
                                            </div>
                                        </div>

                                        {/* Font Size */}
                                        <div className="space-y-2 mb-4">
                                            <label className="text-sm font-medium flex items-center gap-2">
                                                <Type className="w-4 h-4" />
                                                Font Size: {settings.fontSize}px
                                            </label>
                                            <input
                                                type="range"
                                                min="12"
                                                max="18"
                                                value={settings.fontSize}
                                                onChange={(e) => settings.updateSettings({ fontSize: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* View Density */}
                                        <div className="space-y-2 mb-4">
                                            <label className="text-sm font-medium">View Density</label>
                                            <div className="flex gap-2">
                                                {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                                                    <button
                                                        key={density}
                                                        onClick={() => settings.updateSettings({ viewDensity: density })}
                                                        className={`btn flex-1 text-xs ${settings.viewDensity === density ? 'btn-primary' : 'btn-secondary'
                                                            }`}
                                                    >
                                                        {density.charAt(0).toUpperCase() + density.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Board Themes */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium">Board-specific Colors</label>
                                                <p className="text-xs text-gray-400">Use different colors for each board</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.boardThemesEnabled}
                                                onChange={(e) => settings.updateSettings({ boardThemesEnabled: e.target.checked })}
                                                className="w-5 h-5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'behavior' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold mb-4">Behavior</h3>

                                    {/* Auto-refresh */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Auto-refresh Interval: {settings.autoRefreshInterval === 0 ? 'Disabled' : `${settings.autoRefreshInterval}s`}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="120"
                                            step="10"
                                            value={settings.autoRefreshInterval}
                                            onChange={(e) => settings.updateSettings({ autoRefreshInterval: parseInt(e.target.value) })}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-400">Set to 0 to disable auto-refresh</p>
                                    </div>

                                    {/* Thread Auto-scroll */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">Thread Auto-scroll</label>
                                            <p className="text-xs text-gray-400">Automatically scroll to new posts</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.threadAutoScroll}
                                            onChange={(e) => settings.updateSettings({ threadAutoScroll: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>

                                    {/* Media Auto-play */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">Media Auto-play</label>
                                            <p className="text-xs text-gray-400">Automatically play videos and GIFs</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.mediaAutoPlay}
                                            onChange={(e) => settings.updateSettings({ mediaAutoPlay: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        Privacy
                                    </h3>

                                    {/* NSFW Blur */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">NSFW Blur</label>
                                            <p className="text-xs text-gray-400">Blur potentially NSFW images by default</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.nsfwBlur}
                                            onChange={(e) => settings.updateSettings({ nsfwBlur: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>

                                    {/* Disable Image Loading */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">Disable Image Loading</label>
                                            <p className="text-xs text-gray-400">Save bandwidth by not loading images</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.disableImageLoading}
                                            onChange={(e) => settings.updateSettings({ disableImageLoading: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>

                                    {/* Clear Cache on Exit */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">Clear Cache on Exit</label>
                                            <p className="text-xs text-gray-400">Automatically clear cached data when closing</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.clearCacheOnExit}
                                            onChange={(e) => settings.updateSettings({ clearCacheOnExit: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>

                                    {/* Proxy */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Proxy URL (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="http://proxy.example.com:8080"
                                            value={settings.proxyUrl}
                                            onChange={(e) => settings.updateSettings({ proxyUrl: e.target.value })}
                                            className="input w-full"
                                        />
                                        <p className="text-xs text-gray-400">Leave empty to connect directly</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Bell className="w-5 h-5" />
                                        Notifications
                                    </h3>

                                    {/* Desktop Notifications */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">Desktop Notifications</label>
                                            <p className="text-xs text-gray-400">Show notifications for watched threads</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.desktopNotifications}
                                            onChange={(e) => settings.updateSettings({ desktopNotifications: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>

                                    {/* Notification Sound */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium">Notification Sound</label>
                                            <p className="text-xs text-gray-400">Play sound when new replies are detected</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.notificationSound}
                                            onChange={(e) => settings.updateSettings({ notificationSound: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Key className="w-5 h-5" />
                                        4chan Pass
                                    </h3>

                                    <div className="bg-dark-elevated p-4 rounded-lg border border-dark-border">
                                        <p className="text-sm text-gray-400 mb-4">
                                            Enter your 4chan Pass token to post without solving captchas.
                                            You can get a Pass at <a href="https://www.4chan.org/pass" target="_blank" className="text-primary-400 hover:underline">4chan.org/pass</a>
                                        </p>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Pass Token</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    placeholder="Enter your pass_id cookie value"
                                                    value={passToken}
                                                    onChange={(e) => {
                                                        setPassToken(e.target.value);
                                                        setPassStatus('idle');
                                                    }}
                                                    className="input flex-1"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        if (!passToken.trim()) return;
                                                        setIsValidating(true);
                                                        try {
                                                            const valid = await validatePassToken(passToken);
                                                            setPassStatus(valid ? 'valid' : 'invalid');
                                                            if (valid) {
                                                                settings.setChanPassToken(passToken);
                                                            }
                                                        } catch {
                                                            setPassStatus('invalid');
                                                        }
                                                        setIsValidating(false);
                                                    }}
                                                    disabled={isValidating || !passToken.trim()}
                                                    className="btn btn-primary flex items-center gap-2"
                                                >
                                                    {isValidating ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    Validate
                                                </button>
                                            </div>

                                            {passStatus === 'valid' && (
                                                <p className="text-sm text-green-400 flex items-center gap-2">
                                                    <Check className="w-4 h-4" />
                                                    Pass token saved and validated!
                                                </p>
                                            )}
                                            {passStatus === 'invalid' && (
                                                <p className="text-sm text-red-400">
                                                    Invalid token. Make sure you copied the pass_id cookie correctly.
                                                </p>
                                            )}

                                            {settings.chanPassToken && (
                                                <button
                                                    onClick={() => {
                                                        settings.setChanPassToken(null);
                                                        setPassToken('');
                                                        setPassStatus('idle');
                                                    }}
                                                    className="btn btn-secondary text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Remove Saved Token
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        <p>Your token is stored locally and never sent to any server except 4chan.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'storage' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <HardDrive className="w-5 h-5" />
                                        Storage & Cache
                                    </h3>

                                    {/* Cache Stats */}
                                    <div className="bg-dark-elevated p-4 rounded-lg border border-dark-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium">Thread Cache</h4>
                                            <button
                                                onClick={loadCacheStats}
                                                disabled={isCacheLoading}
                                                className="btn btn-ghost p-1"
                                                title="Refresh stats"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${isCacheLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        {cacheStats ? (
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Cached Threads</p>
                                                    <p className="text-xl font-bold">{cacheStats.thread_count}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Cached Posts</p>
                                                    <p className="text-xl font-bold">{cacheStats.post_count}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Cache Size</p>
                                                    <p className="text-xl font-bold">{formatBytes(cacheStats.db_size_bytes)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Limit</p>
                                                    <p className="text-xl font-bold">{settings.maxCacheSizeMB} MB</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Loading cache stats...</p>
                                        )}
                                    </div>

                                    {/* Cache Settings */}
                                    <div className="space-y-4">
                                        {/* Enable Cache */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium">Enable Thread Caching</label>
                                                <p className="text-xs text-gray-400">Cache threads for faster loading</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.threadCacheEnabled}
                                                onChange={(e) => settings.updateSettings({ threadCacheEnabled: e.target.checked })}
                                                className="w-5 h-5"
                                            />
                                        </div>

                                        {/* Max Cache Age */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Cache Retention: {settings.maxCacheAgeDays} days
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="30"
                                                value={settings.maxCacheAgeDays}
                                                onChange={(e) => settings.updateSettings({ maxCacheAgeDays: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                            <p className="text-xs text-gray-400">Older cache entries are automatically deleted</p>
                                        </div>

                                        {/* Max Cache Size */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Max Cache Size: {settings.maxCacheSizeMB} MB
                                            </label>
                                            <input
                                                type="range"
                                                min="25"
                                                max="500"
                                                step="25"
                                                value={settings.maxCacheSizeMB}
                                                onChange={(e) => settings.updateSettings({ maxCacheSizeMB: parseInt(e.target.value) })}
                                                className="w-full"
                                            />
                                            <p className="text-xs text-gray-400">Least recently used threads are deleted when limit is reached</p>
                                        </div>
                                    </div>

                                    {/* Cache Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCleanupCache}
                                            disabled={isCacheLoading}
                                            className="btn btn-secondary flex items-center gap-2"
                                        >
                                            {isCacheLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            Run Cleanup
                                        </button>
                                        <button
                                            onClick={handleClearCache}
                                            disabled={isCacheLoading}
                                            className="btn btn-secondary text-red-400 hover:text-red-300 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Clear All Cache
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Cache is stored locally in your app data folder.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-dark-border">
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                                    settings.resetSettings();
                                }
                            }}
                            className="btn btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset to Defaults
                        </button>
                        <button onClick={onClose} className="btn btn-primary">
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
