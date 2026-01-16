import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Send, Paperclip, Minimize2, Maximize2,
    Image as ImageIcon, AlertCircle, Loader2
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { useSettingsStore } from '../../stores/settingsStore'

interface QuickReplyProps {
    board: string
    threadId: number
    replyTo?: number // Post number to quote
    onClose: () => void
    onSuccess?: () => void
}

interface PostRequest {
    board: string
    resto: number
    name?: string
    email?: string
    subject?: string
    comment: string
    file_path?: string
    file_name?: string
    captcha_challenge?: string
    captcha_response?: string
}

interface CaptchaChallenge {
    challenge: string
    image_url: string
    ttl: number
    cd: number
}

export default function QuickReply({ board, threadId, replyTo, onClose, onSuccess }: QuickReplyProps) {
    const [isMinimized, setIsMinimized] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        comment: replyTo ? `>>${replyTo}\n` : '',
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)

    // Captcha state
    const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null)
    const [captchaResponse, setCaptchaResponse] = useState('')
    const [captchaLoading, setCaptchaLoading] = useState(false)
    const [captchaExpiry, setCaptchaExpiry] = useState(0)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Check cooldown on mount
    useEffect(() => {
        checkCooldown()
        const interval = setInterval(checkCooldown, 1000)
        return () => clearInterval(interval)
    }, [])

    // Focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus()
        // Place cursor at end
        if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.value.length
        }
    }, [])

    // Update comment when replyTo changes
    useEffect(() => {
        if (replyTo) {
            setFormData(prev => ({
                ...prev,
                comment: prev.comment + `>>${replyTo}\n`
            }))
        }
    }, [replyTo])

    const checkCooldown = async () => {
        try {
            const seconds = await invoke<number>('get_post_cooldown')
            setCooldown(seconds)
        } catch {
            setCooldown(0)
        }
    }

    // Fetch captcha if no Pass token
    const fetchCaptcha = async () => {
        const passToken = useSettingsStore.getState().chanPassToken
        if (passToken) return // Don't need captcha with Pass

        setCaptchaLoading(true)
        try {
            const captchaData = await invoke<CaptchaChallenge>('fetch_captcha', { board })
            setCaptcha(captchaData)
            setCaptchaExpiry(captchaData.ttl)
            setCaptchaResponse('')
        } catch (err) {
            console.warn('Captcha fetch failed:', err)
            // Don't set error - user might have a Pass
        } finally {
            setCaptchaLoading(false)
        }
    }

    // Captcha expiry countdown
    useEffect(() => {
        if (captchaExpiry <= 0) return
        const timer = setInterval(() => {
            setCaptchaExpiry(prev => {
                if (prev <= 1) {
                    fetchCaptcha() // Auto-refresh expired captcha
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [captchaExpiry, board])

    // Load captcha on mount
    useEffect(() => {
        fetchCaptcha()
    }, [board])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/webm']
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Allowed: JPG, PNG, GIF, WebP, WebM')
            return
        }

        // Validate file size (4MB for images, 4MB for webm on most boards)
        if (file.size > 4 * 1024 * 1024) {
            setError('File too large. Maximum size is 4MB')
            return
        }

        setSelectedFile(file)
        setError(null)

        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setFilePreview(e.target?.result as string)
            reader.readAsDataURL(file)
        } else {
            setFilePreview(null)
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        setFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.comment.trim() && !selectedFile) {
            setError('Please enter a comment or attach a file')
            return
        }

        if (cooldown > 0) {
            setError(`Please wait ${cooldown} seconds before posting`)
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Get 4chan Pass token from settings if available
            const passToken = useSettingsStore.getState().chanPassToken

            const request: PostRequest = {
                board,
                resto: threadId,
                comment: formData.comment,
            }

            if (formData.name) request.name = formData.name
            if (formData.email) request.email = formData.email

            // Add captcha if we have one
            if (captcha && captchaResponse) {
                request.captcha_challenge = captcha.challenge
                request.captcha_response = captchaResponse
            }

            // Handle file - need to save to temp location for Rust to read
            if (selectedFile) {
                // For now, we'll use a data URL approach
                // In production, you'd want to use Tauri's file dialog
                const reader = new FileReader()
                const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as ArrayBuffer)
                    reader.onerror = reject
                    reader.readAsArrayBuffer(selectedFile)
                })

                // Save to temp file via Tauri
                // This is simplified - actual implementation would use fs plugin
                request.file_name = selectedFile.name
            }

            const result = await invoke<{ success: boolean; error?: string }>('submit_post', {
                request,
                passToken,
            })

            if (result.success) {
                setFormData({ name: '', email: '', comment: '' })
                removeFile()
                setCaptcha(null)
                setCaptchaResponse('')
                onSuccess?.()
                onClose()
            } else {
                setError(result.error || 'Failed to submit post')
                // Refresh captcha on failure
                fetchCaptcha()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit post')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-4 right-4 z-40 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
                drag
                dragMomentum={false}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-zinc-800 border-b border-zinc-700 cursor-move">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Reply to /{board}/</span>
                        <span className="text-zinc-400 text-sm">#{threadId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.form
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            onSubmit={handleSubmit}
                            className="overflow-hidden"
                        >
                            <div className="p-3 space-y-3">
                                {/* Name & Email row */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Name (optional)"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Email/sage"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* Comment */}
                                <textarea
                                    ref={textareaRef}
                                    placeholder="Enter your reply..."
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                                    rows={4}
                                />

                                {/* File attachment */}
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,video/webm"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-sm"
                                    >
                                        <Paperclip size={16} />
                                        Attach File
                                    </button>

                                    {selectedFile && (
                                        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800 rounded-lg">
                                            {filePreview && (
                                                <img src={filePreview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                                            )}
                                            <span className="text-sm text-zinc-300 truncate max-w-[120px]">
                                                {selectedFile.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-zinc-400 hover:text-red-400"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Captcha */}
                                {captcha && (
                                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">
                                                Solve captcha ({captchaExpiry}s)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => fetchCaptcha()}
                                                className="text-xs text-purple-400 hover:text-purple-300"
                                            >
                                                New Captcha
                                            </button>
                                        </div>
                                        <img
                                            src={captcha.image_url}
                                            alt="Captcha"
                                            className="w-full h-auto rounded bg-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Type the text above"
                                            value={captchaResponse}
                                            onChange={(e) => setCaptchaResponse(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                            autoComplete="off"
                                        />
                                    </div>
                                )}

                                {captchaLoading && (
                                    <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm py-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Loading captcha...
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="flex items-center justify-between">
                                    {cooldown > 0 && (
                                        <span className="text-zinc-400 text-sm">
                                            Wait {cooldown}s...
                                        </span>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || cooldown > 0}
                                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                        Post Reply
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    )
}
