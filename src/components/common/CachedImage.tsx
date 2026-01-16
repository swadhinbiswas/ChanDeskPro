import { useState, useEffect } from 'react'
import { fetchImageWithProxy } from '../../utils/apiClient'

interface CachedImageProps {
    src: string
    alt?: string
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    onLoad?: () => void
    onError?: () => void
}

export default function CachedImage({
    src,
    alt,
    className,
    style,
    onClick,
    onLoad,
    onError
}: CachedImageProps) {
    const [cachedSrc, setCachedSrc] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let mounted = true

        async function loadImage() {
            try {
                setLoading(true)
                setError(false)

                // Fetch through Rust backend to bypass CORS
                const localPath = await fetchImageWithProxy(src)

                if (mounted) {
                    setCachedSrc(localPath)
                    setLoading(false)
                    onLoad?.()
                }
            } catch (err) {
                console.error('Failed to load image:', src, err)
                if (mounted) {
                    setError(true)
                    setLoading(false)
                    onError?.()
                }
            }
        }

        if (src) {
            loadImage()
        }

        return () => {
            mounted = false
        }
    }, [src])

    if (loading) {
        return (
            <div
                className={`bg-gray-800 animate-pulse ${className}`}
                style={style}
            />
        )
    }

    if (error || !cachedSrc) {
        return (
            <div
                className={`bg-gray-800 flex items-center justify-center ${className}`}
                style={style}
            >
                <span className="text-gray-500 text-sm">Failed to load</span>
            </div>
        )
    }

    return (
        <img
            src={cachedSrc}
            alt={alt}
            className={className}
            style={style}
            onClick={onClick}
            draggable={false}
        />
    )
}
