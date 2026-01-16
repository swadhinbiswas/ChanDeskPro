import { invoke } from '@tauri-apps/api/core'

export interface NotificationOptions {
    title: string
    body: string
    icon?: string
}

let notificationsEnabled = false

/**
 * Initialize and request notification permissions
 */
export async function initNotifications(): Promise<boolean> {
    try {
        // Check if we're in a Tauri environment
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                notificationsEnabled = true
                return true
            }

            if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission()
                notificationsEnabled = permission === 'granted'
                return notificationsEnabled
            }
        }
        return false
    } catch (error) {
        console.warn('Notifications not supported:', error)
        return false
    }
}

/**
 * Show a desktop notification
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
    if (!notificationsEnabled) {
        const enabled = await initNotifications()
        if (!enabled) return
    }

    try {
        // Try native browser notifications first
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/icon.png',
                badge: '/icon.png',
                tag: 'chandesk-notification',
            })
        }
    } catch (error) {
        console.warn('Failed to show notification:', error)
    }
}

/**
 * Show notification for new replies in watched thread
 */
export function notifyNewReplies(
    board: string,
    threadId: number,
    threadTitle: string,
    newCount: number
): void {
    showNotification({
        title: `New replies in /${board}/`,
        body: `${newCount} new ${newCount === 1 ? 'reply' : 'replies'} in "${threadTitle || `Thread #${threadId}`}"`,
    })
}

/**
 * Check if notifications are currently enabled
 */
export function areNotificationsEnabled(): boolean {
    return notificationsEnabled &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
}
