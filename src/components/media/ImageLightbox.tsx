import { useEffect, useState } from 'react'
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ExternalLink, Film } from 'lucide-react'
import CachedImage from '../common/CachedImage'
import VideoPlayer from './VideoPlayer'

// Check if URL is a video file
const isVideo = (url: string): boolean => {
    const ext = url.split('.').pop()?.toLowerCase()
    return ['webm', 'mp4', 'mov', 'gif'].includes(ext || '')
}

interface ImageLightboxProps {
    images: Array<{
        url: string
        thumbnail: string
        filename?: string
        width?: number
        height?: number
    }>
    initialIndex: number
    onClose: () => void
}

export default function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const currentImage = images[currentIndex]

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose()
                    break
                case 'ArrowLeft':
                    goToPrevious()
                    break
                case 'ArrowRight':
                    goToNext()
                    break
                case '+':
                case '=':
                    setZoom(z => Math.min(z + 0.5, 4))
                    break
                case '-':
                    setZoom(z => Math.max(z - 0.5, 0.5))
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentIndex])

    const goToNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1)
            resetView()
        }
    }

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            resetView()
        }
    }

    const resetView = () => {
        setZoom(1)
        setPan({ x: 0, y: 0 })
    }

    const handleDownload = async () => {
        try {
            const response = await fetch(currentImage.url)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = currentImage.filename || 'image.jpg'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true)
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            })
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={onClose}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4">
                    <span className="text-white font-medium">
                        {currentImage.filename || 'Image'}
                    </span>
                    {currentImage.width && currentImage.height && (
                        <span className="text-gray-400 text-sm">
                            {currentImage.width} × {currentImage.height}
                        </span>
                    )}
                    <span className="text-gray-400 text-sm">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5 text-white" />
                    </button>

                    <button
                        onClick={() => setZoom(z => Math.min(z + 0.5, 4))}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5 text-white" />
                    </button>

                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Download"
                    >
                        <Download className="w-5 h-5 text-white" />
                    </button>

                    <a
                        href={currentImage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Open in New Tab"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-5 h-5 text-white" />
                    </a>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Media Container */}
            <div
                className="flex-1 flex items-center justify-center relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={!isVideo(currentImage.url) ? handleMouseDown : undefined}
                onMouseMove={!isVideo(currentImage.url) ? handleMouseMove : undefined}
                onMouseUp={!isVideo(currentImage.url) ? handleMouseUp : undefined}
                onMouseLeave={!isVideo(currentImage.url) ? handleMouseUp : undefined}
                style={{ cursor: !isVideo(currentImage.url) && zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                {isVideo(currentImage.url) ? (
                    <VideoPlayer
                        key={currentIndex}
                        src={currentImage.url}
                        poster={currentImage.thumbnail}
                        filename={currentImage.filename}
                        autoPlay
                        className="max-w-[90%] max-h-[80vh]"
                    />
                ) : (
                    <CachedImage
                        key={currentIndex}
                        src={currentImage.url}
                        alt={currentImage.filename || 'Image'}
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            maxWidth: zoom === 1 ? '90%' : 'none',
                            maxHeight: zoom === 1 ? '90%' : 'none',
                            objectFit: 'contain',
                        }}
                        className="select-none transition-opacity duration-200"
                    />
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goToPrevious() }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                title="Previous (←)"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {currentIndex < images.length - 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); goToNext() }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                title="Next (→)"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Thumbnails Strip */}
            {images.length > 1 && (
                <div className="p-4 bg-black/50 flex gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setCurrentIndex(idx); resetView() }}
                            className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${idx === currentIndex
                                ? 'border-primary-500 scale-110'
                                : 'border-transparent opacity-50 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img.thumbnail}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Help */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-gray-400 text-xs bg-black/70 px-4 py-2 rounded-full">
                ← → Navigate • +/- Zoom • Esc Close • Click & Drag to Pan
            </div>
        </div>
    )
}
