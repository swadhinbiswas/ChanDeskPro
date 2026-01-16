import type { Post, Thread } from '../types/api'

export interface ExportOptions {
    format: 'json' | 'html' | 'txt'
    includeImages?: boolean
    filename?: string
}

/**
 * Export a thread to various formats
 */
export function exportThread(
    thread: Thread,
    board: string,
    options: ExportOptions
): void {
    const posts = thread.posts || []
    const op = posts[0]
    const threadTitle = op?.sub || `Thread ${op?.no}`
    const filename = options.filename || `${board}_${op?.no}_${threadTitle.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}`

    let content: string
    let mimeType: string
    let extension: string

    switch (options.format) {
        case 'json':
            content = JSON.stringify({
                board,
                thread: op?.no,
                title: threadTitle,
                exportedAt: new Date().toISOString(),
                posts: posts.map(p => ({
                    no: p.no,
                    time: p.time,
                    name: p.name,
                    trip: p.trip,
                    sub: p.sub,
                    com: p.com,
                    filename: p.filename,
                    ext: p.ext,
                    tim: p.tim,
                    w: p.w,
                    h: p.h,
                    replies: p.replies,
                })),
            }, null, 2)
            mimeType = 'application/json'
            extension = 'json'
            break

        case 'html':
            content = generateHtmlExport(posts, board, threadTitle)
            mimeType = 'text/html'
            extension = 'html'
            break

        case 'txt':
            content = generateTextExport(posts, board, threadTitle)
            mimeType = 'text/plain'
            extension = 'txt'
            break

        default:
            throw new Error(`Unknown export format: ${options.format}`)
    }

    downloadFile(content, `${filename}.${extension}`, mimeType)
}

function generateHtmlExport(posts: Post[], board: string, title: string): string {
    const postsHtml = posts.map(post => `
        <div class="post" id="p${post.no}">
            <div class="post-header">
                <span class="name">${post.name || 'Anonymous'}</span>
                ${post.trip ? `<span class="trip">${post.trip}</span>` : ''}
                <span class="time">${new Date(post.time * 1000).toLocaleString()}</span>
                <span class="no">No.${post.no}</span>
            </div>
            ${post.sub ? `<div class="subject">${post.sub}</div>` : ''}
            ${post.tim ? `
                <div class="file">
                    <a href="https://i.4cdn.org/${board}/${post.tim}${post.ext}" target="_blank">
                        <img src="https://i.4cdn.org/${board}/${post.tim}s.jpg" alt="${post.filename}" />
                    </a>
                    <span class="filename">${post.filename}${post.ext}</span>
                </div>
            ` : ''}
            ${post.com ? `<div class="comment">${post.com}</div>` : ''}
        </div>
    `).join('\n')

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - /${board}/</title>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #ccc; padding: 20px; max-width: 900px; margin: 0 auto; }
        .post { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #7c3aed; }
        .post-header { font-size: 0.9em; margin-bottom: 10px; }
        .name { color: #4ade80; font-weight: bold; }
        .trip { color: #a855f7; margin-left: 5px; }
        .time { color: #666; margin-left: 10px; }
        .no { color: #666; margin-left: 10px; }
        .subject { font-weight: bold; font-size: 1.1em; margin-bottom: 10px; }
        .file { margin: 10px 0; }
        .file img { max-width: 200px; border-radius: 4px; }
        .filename { display: block; font-size: 0.8em; color: #666; margin-top: 5px; }
        .comment { line-height: 1.6; }
        .greentext { color: #789922; }
        a { color: #818cf8; }
        h1 { color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>/${board}/ - ${title}</h1>
    <p>Exported: ${new Date().toLocaleString()} • ${posts.length} posts</p>
    ${postsHtml}
</body>
</html>`
}

function generateTextExport(posts: Post[], board: string, title: string): string {
    const lines: string[] = [
        `/${board}/ - ${title}`,
        `Exported: ${new Date().toLocaleString()}`,
        `${posts.length} posts`,
        '',
        '---',
        '',
    ]

    for (const post of posts) {
        lines.push(`${post.name || 'Anonymous'}${post.trip || ''} - ${new Date(post.time * 1000).toLocaleString()} - No.${post.no}`)
        if (post.sub) lines.push(`Subject: ${post.sub}`)
        if (post.tim) lines.push(`Image: https://i.4cdn.org/${board}/${post.tim}${post.ext}`)
        if (post.com) {
            // Strip HTML tags for plain text
            const text = post.com
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
            lines.push(text)
        }
        lines.push('')
        lines.push('---')
        lines.push('')
    }

    return lines.join('\n')
}

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
