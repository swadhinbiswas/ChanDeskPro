import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Grid, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Post } from '../../types/api'
import { getImageUrl, getThumbnailUrl } from '../../utils/apiClient'

interface ImageGalleryProps {
    posts: Post[]
    board: string
    isOpen: boolean
    onClose: () => void
    onImageClick?: (index: number) => void // Opens lightbox
}

interface GalleryImage {
    post: Post
    url: string
    thumbnail: string
    filename: string
}

export default function ImageGallery({ posts, board, isOpen, onClose, onImageClick }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    if (!isOpen) return null

    // Extract all images from posts
    const images: GalleryImage[] = posts
        .filter(p => p.tim && p.ext)
        .map(p => ({
            post: p,
            url: getImageUrl(board, p.tim!, p.ext!),
            thumbnail: getThumbnailUrl(board, p.tim!),
            filename: `${p.filename || p.tim}${p.ext}`
        }))

    const handleDownloadAll = async () => {
        // Download each image
        for (const img of images) {
            const link = document.createElement('a')
            link.href = img.url
            link.download = img.filename
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            await new Promise(resolve => setTimeout(resolve, 200)) // Rate limit
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex flex-col">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="relative flex-1 flex flex-col m-4 bg-dark-surface border border-dark-border rounded-xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-dark-border">
                        <div className="flex items-center gap-3">
                            <Grid className="w-5 h-5 text-purple-400" />
                            <h2 className="text-lg font-semibold">Image Gallery</h2>
                            <span className="text-sm text-gray-400">
                                {images.length} images
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadAll}
                                className="btn btn-secondary flex items-center gap-2 text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download All
                            </button>
                            <button
                                onClick={onClose}
                                className="btn-ghost p-2 hover:bg-dark-hover rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                            {images.map((img, index) => (
                                <motion.div
                                    key={img.post.no}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="group relative aspect-square bg-dark-elevated rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                                    onClick={() => onImageClick?.(index)}
                                >
                                    <img
                                        src={img.thumbnail}
                                        alt={img.filename}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-0 left-0 right-0 p-2">
                                            <p className="text-xs text-white truncate">
                                                {img.filename}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                No.{img.post.no}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Video indicator */}
                                    {img.post.ext === '.webm' && (
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-600 rounded text-xs font-medium">
                                            VIDEO
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {images.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Grid className="w-12 h-12 mb-4 opacity-50" />
                                <p>No images in this thread</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
