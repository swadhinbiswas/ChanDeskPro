/**
 * Flash Player Component
 * 
 * Uses Ruffle.js (WebAssembly Flash emulator) to play SWF files.
 * SWF files are proxied through backend to avoid CORS issues.
 */

import { useEffect, useRef, useState } from 'react';
import { Download, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface FlashPlayerProps {
    src: string;
    filename?: string;
    className?: string;
}

interface VideoInfo {
    url: string;
    content_type: string;
    cached: boolean;
}

// Ruffle player instance type
declare global {
    interface Window {
        RufflePlayer?: {
            newest: () => {
                createPlayer: () => HTMLElement & {
                    load: (url: string) => Promise<void>;
                    play: () => void;
                };
            };
        };
    }
}

// Load Ruffle script dynamically from official source
let ruffleLoaded = false;
let ruffleLoadPromise: Promise<void> | null = null;

async function loadRuffle(): Promise<void> {
    if (ruffleLoaded && window.RufflePlayer) return;

    if (ruffleLoadPromise) {
        return ruffleLoadPromise;
    }

    ruffleLoadPromise = new Promise((resolve, reject) => {
        // Official Ruffle releases from unpkg
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@ruffle-rs/ruffle';

        script.onload = () => {
            // Wait for Ruffle to initialize
            const checkRuffle = (attempts = 0) => {
                if (window.RufflePlayer) {
                    ruffleLoaded = true;
                    resolve();
                } else if (attempts < 30) {
                    setTimeout(() => checkRuffle(attempts + 1), 100);
                } else {
                    reject(new Error('Ruffle failed to initialize'));
                }
            };
            setTimeout(() => checkRuffle(), 200);
        };

        script.onerror = () => {
            reject(new Error('Failed to load Ruffle script'));
        };

        document.head.appendChild(script);
    });

    return ruffleLoadPromise;
}

export default function FlashPlayer({ src, filename, className = '' }: FlashPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [proxiedUrl, setProxiedUrl] = useState<string | null>(null);

    const playFlash = async () => {
        if (!containerRef.current) return;

        setIsLoading(true);
        setError(null);

        try {
            // First, proxy the SWF file through backend to avoid CORS
            console.log('Proxying SWF:', src);
            const proxyResult = await invoke<VideoInfo>('proxy_video', { url: src });
            const localUrl = proxyResult.url;
            setProxiedUrl(localUrl);
            console.log('Proxied SWF available at:', localUrl);

            // Load Ruffle
            await loadRuffle();

            const ruffle = window.RufflePlayer?.newest();
            if (!ruffle) {
                throw new Error('Ruffle player not available');
            }

            const player = ruffle.createPlayer();
            player.style.width = '100%';
            player.style.height = '400px';
            player.style.display = 'block';

            // Clear container and add player
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(player);
            }

            // Load the SWF file from local proxy
            await player.load(localUrl);
            setIsPlaying(true);
        } catch (err) {
            console.error('Failed to load Flash:', err);
            setError(err instanceof Error ? err.message : 'Failed to load Flash player');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            // Use proxied URL if available, otherwise proxy first
            let downloadUrl = proxiedUrl;
            if (!downloadUrl) {
                const proxyResult = await invoke<VideoInfo>('proxy_video', { url: src });
                downloadUrl = proxyResult.url;
            }

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename ? `${filename}.swf` : 'flash.swf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            // Try direct download as fallback
            window.open(src, '_blank');
        }
    };

    const retry = () => {
        setError(null);
        setIsPlaying(false);
        setProxiedUrl(null);
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
    };

    return (
        <div className={`relative bg-zinc-900 rounded-lg overflow-hidden ${className}`}>
            <div
                ref={containerRef}
                className="w-full min-h-[300px] flex items-center justify-center"
            >
                {!isPlaying && !isLoading && !error && (
                    <div className="flex flex-col items-center gap-4 p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">SWF</span>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-medium">Flash Content</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {filename ? `${filename}.swf` : 'Shockwave Flash'}
                            </p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={playFlash}
                                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-md"
                            >
                                <Play className="w-4 h-4" />
                                Play with Ruffle
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Powered by <a href="https://ruffle.rs" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Ruffle</a> Flash Emulator
                        </p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-300 text-sm">Loading Flash...</p>
                        <p className="text-gray-500 text-xs">Downloading and initializing Ruffle</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                        <AlertCircle className="w-14 h-14 text-red-500" />
                        <div>
                            <p className="text-red-400 font-medium">Flash Player Error</p>
                            <p className="text-gray-500 text-sm mt-1 max-w-md">{error}</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={retry}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download SWF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filename badge */}
            {isPlaying && filename && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-gray-300">
                    {filename}.swf
                </div>
            )}
        </div>
    );
}
