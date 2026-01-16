import { useState, useRef, useEffect } from 'react'
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    SkipBack, SkipForward, Download
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'

interface VideoInfo {
    url: string           // HTTP URL from local server
    content_type: string
    cached: boolean
}

interface VideoPlayerProps {
    src: string
    poster?: string
    filename?: string
    autoPlay?: boolean
    loop?: boolean
    className?: string
}

export default function VideoPlayer({
    src,
    poster,
    filename,
    autoPlay = false,
    loop = true,
    className = ''
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const progressRef = useRef<HTMLDivElement>(null)

    // Proxied video URL from local server
    const [proxiedSrc, setProxiedSrc] = useState<string | null>(null)
    const [proxyError, setProxyError] = useState<string | null>(null)

    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [isMuted, setIsMuted] = useState(false) // Start with sound enabled
    const [volume, setVolume] = useState(0.5)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    const hideControlsTimeout = useRef<NodeJS.Timeout>()

    // Fetch video through proxy - returns localhost HTTP URL
    useEffect(() => {
        async function loadVideo() {
            try {
                setIsLoading(true)
                setProxyError(null)

                const result = await invoke<VideoInfo>('proxy_video', { url: src })
                // Result.url is already an HTTP URL from local server
                setProxiedSrc(result.url)
                setIsLoading(false)
            } catch (error) {
                console.error('Failed to proxy video:', error)
                setProxyError(String(error))
                setIsLoading(false)
            }
        }

        if (src) {
            loadVideo()
        }
    }, [src])

    // Reset hide timeout on mouse move
    const resetHideTimeout = () => {
        setShowControls(true)
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current)
        }
        hideControlsTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 2500)
    }

    // Handle play/pause
    const togglePlay = () => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play()
        }
        setIsPlaying(!isPlaying)
    }

    // Handle mute
    const toggleMute = () => {
        const video = videoRef.current
        if (!video) return

        video.muted = !isMuted
        setIsMuted(!isMuted)
    }

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current
        if (!video) return

        const newVolume = parseFloat(e.target.value)
        video.volume = newVolume
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    // Handle seek
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current
        const progressBar = progressRef.current
        if (!video || !progressBar) return

        const rect = progressBar.getBoundingClientRect()
        const pos = (e.clientX - rect.left) / rect.width
        video.currentTime = pos * duration
    }

    // Skip forward/backward
    const skip = (seconds: number) => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
    }

    // Handle fullscreen
    const toggleFullscreen = async () => {
        const container = containerRef.current
        if (!container) return

        if (!document.fullscreenElement) {
            await container.requestFullscreen()
            setIsFullscreen(true)
        } else {
            await document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    // Handle download
    const handleDownload = () => {
        const a = document.createElement('a')
        a.href = src
        a.download = filename || 'video'
        a.click()
    }

    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if video is focused or in fullscreen
            if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) return

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'm':
                    toggleMute()
                    break
                case 'f':
                    toggleFullscreen()
                    break
                case 'ArrowLeft':
                    e.preventDefault()
                    skip(-5)
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    skip(5)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    if (videoRef.current) {
                        const newVol = Math.min(1, volume + 0.1)
                        videoRef.current.volume = newVol
                        setVolume(newVol)
                        setIsMuted(false)
                    }
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    if (videoRef.current) {
                        const newVol = Math.max(0, volume - 0.1)
                        videoRef.current.volume = newVol
                        setVolume(newVol)
                    }
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isMuted, volume, isFullscreen])

    // Video event handlers
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime)
            setProgress((video.currentTime / video.duration) * 100)
        }

        const onLoadedMetadata = () => {
            setDuration(video.duration)
            setIsLoading(false)
        }

        const onEnded = () => {
            if (!loop) setIsPlaying(false)
        }

        const onPlay = () => setIsPlaying(true)
        const onPause = () => setIsPlaying(false)
        const onWaiting = () => setIsLoading(true)
        const onCanPlay = () => setIsLoading(false)

        video.addEventListener('timeupdate', onTimeUpdate)
        video.addEventListener('loadedmetadata', onLoadedMetadata)
        video.addEventListener('ended', onEnded)
        video.addEventListener('play', onPlay)
        video.addEventListener('pause', onPause)
        video.addEventListener('waiting', onWaiting)
        video.addEventListener('canplay', onCanPlay)

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate)
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            video.removeEventListener('ended', onEnded)
            video.removeEventListener('play', onPlay)
            video.removeEventListener('pause', onPause)
            video.removeEventListener('waiting', onWaiting)
            video.removeEventListener('canplay', onCanPlay)
        }
    }, [loop])

    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
            onMouseMove={resetHideTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            tabIndex={0}
        >
            {/* Error State */}
            {proxyError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-red-400 p-4 text-center">
                    <div>
                        <p className="text-sm">Failed to load video</p>
                        <p className="text-xs text-gray-500 mt-1">{proxyError}</p>
                    </div>
                </div>
            )}

            {/* Video Element - only render when we have proxied src */}
            {proxiedSrc && !proxyError && (
                <video
                    ref={videoRef}
                    src={proxiedSrc}
                    poster={poster}
                    autoPlay={autoPlay}
                    loop={loop}
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlay}
                />
            )}

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-gray-400 mt-2">Loading video...</p>
                    </div>
                </div>
            )}

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && !isLoading && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-16 h-16 bg-purple-600/80 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors">
                        <Play size={32} className="ml-1" />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    className="w-full h-1.5 bg-zinc-700 rounded-full mb-3 cursor-pointer group/progress"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-purple-500 rounded-full relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="text-white hover:text-purple-400 transition-colors"
                    >
                        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                    </button>

                    {/* Skip Backward */}
                    <button
                        onClick={() => skip(-5)}
                        className="text-white hover:text-purple-400 transition-colors"
                        title="Back 5s"
                    >
                        <SkipBack size={18} />
                    </button>

                    {/* Skip Forward */}
                    <button
                        onClick={() => skip(5)}
                        className="text-white hover:text-purple-400 transition-colors"
                        title="Forward 5s"
                    >
                        <SkipForward size={18} />
                    </button>

                    {/* Time */}
                    <span className="text-sm text-zinc-400 min-w-[80px]">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Volume */}
                    <div className="flex items-center gap-2 group/volume">
                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-purple-400 transition-colors"
                        >
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-purple-500"
                        />
                    </div>

                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        className="text-white hover:text-purple-400 transition-colors"
                        title="Download"
                    >
                        <Download size={18} />
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-purple-400 transition-colors"
                        title="Fullscreen (f)"
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
        </div>
    )
}
