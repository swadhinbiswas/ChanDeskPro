import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '../stores/settingsStore'

interface UseAutoRefreshProps {
    board: string | null
    threadId: number | null
}

export function useAutoRefresh({ board, threadId }: UseAutoRefreshProps) {
    const queryClient = useQueryClient()
    const { autoRefreshEnabled, autoRefreshInterval } = useSettingsStore()
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!autoRefreshEnabled || !board) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        // Refresh function
        const refresh = () => {
            if (threadId) {
                // Refresh thread
                queryClient.invalidateQueries({ queryKey: ['thread', board, threadId] })
                console.log(`[Auto-Refresh] Refreshed thread ${threadId} on /${board}/`)
            } else {
                // Refresh catalog
                queryClient.invalidateQueries({ queryKey: ['catalog', board] })
                console.log(`[Auto-Refresh] Refreshed catalog for /${board}/`)
            }
        }

        // Set up interval
        intervalRef.current = setInterval(refresh, autoRefreshInterval * 1000)

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [board, threadId, autoRefreshEnabled, autoRefreshInterval, queryClient])
}
