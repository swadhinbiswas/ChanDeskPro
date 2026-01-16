/**
 * Provider Registry
 * 
 * Central registry for all imageboard providers.
 * Allows dynamic registration and lookup of providers.
 */

import type { ImageboardProvider, ProviderInfo, ProviderFactory } from './types'

class ProviderRegistry {
    private providers: Map<string, ImageboardProvider> = new Map()
    private factories: Map<string, ProviderFactory> = new Map()

    /**
     * Register a provider factory
     */
    register(id: string, factory: ProviderFactory): void {
        this.factories.set(id, factory)
    }

    /**
     * Get a provider instance (creates if needed)
     */
    get(id: string): ImageboardProvider | undefined {
        // Return cached instance
        if (this.providers.has(id)) {
            return this.providers.get(id)
        }

        // Create new instance from factory
        const factory = this.factories.get(id)
        if (factory) {
            const provider = factory()
            this.providers.set(id, provider)
            return provider
        }

        return undefined
    }

    /**
     * Get all registered provider IDs
     */
    getIds(): string[] {
        return Array.from(this.factories.keys())
    }

    /**
     * Get info about all registered providers
     */
    getAll(): ProviderInfo[] {
        return this.getIds().map(id => {
            const provider = this.get(id)!
            return {
                id: provider.id,
                name: provider.name,
                shortName: provider.shortName,
                color: provider.color,
                icon: provider.icon,
                enabled: true,
            }
        })
    }

    /**
     * Check if a provider is registered
     */
    has(id: string): boolean {
        return this.factories.has(id)
    }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry()

// Export for global access
export default providerRegistry
