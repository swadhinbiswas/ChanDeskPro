interface LoadingSkeletonProps {
    variant?: 'card' | 'list' | 'text' | 'thread';
    count?: number;
    className?: string;
}

export default function LoadingSkeleton({
    variant = 'card',
    count = 1,
    className = ''
}: LoadingSkeletonProps) {
    const skeletons = Array.from({ length: count });

    if (variant === 'card') {
        return (
            <>
                {skeletons.map((_, i) => (
                    <div key={i} className={`skeleton rounded-lg ${className}`}>
                        <div className="aspect-video bg-dark-elevated mb-2" />
                        <div className="p-3 space-y-2">
                            <div className="h-4 bg-dark-elevated rounded w-3/4" />
                            <div className="h-3 bg-dark-elevated rounded w-full" />
                            <div className="h-3 bg-dark-elevated rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (variant === 'list') {
        return (
            <>
                {skeletons.map((_, i) => (
                    <div key={i} className={`skeleton h-12 rounded-md mb-2 ${className}`} />
                ))}
            </>
        );
    }

    if (variant === 'text') {
        return (
            <>
                {skeletons.map((_, i) => (
                    <div key={i} className={`skeleton h-4 rounded w-full mb-2 ${className}`} />
                ))}
            </>
        );
    }

    if (variant === 'thread') {
        return (
            <div className={`space-y-4 ${className}`}>
                {/* OP Skeleton */}
                <div className="skeleton rounded-lg p-4">
                    <div className="flex gap-4">
                        <div className="w-32 h-32 bg-dark-elevated rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-dark-elevated rounded w-1/4" />
                            <div className="h-4 bg-dark-elevated rounded w-full" />
                            <div className="h-4 bg-dark-elevated rounded w-3/4" />
                        </div>
                    </div>
                </div>

                {/* Reply Skeletons */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton rounded-lg p-4">
                        <div className="space-y-2">
                            <div className="h-3 bg-dark-elevated rounded w-1/4" />
                            <div className="h-3 bg-dark-elevated rounded w-full" />
                            <div className="h-3 bg-dark-elevated rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
