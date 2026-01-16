/**
 * Provider initialization
 * 
 * Registers all available providers with the registry.
 */

import { providerRegistry } from './registry'
import { createFourChanProvider } from './fourchan'
import { createSevenChanProvider } from './sevenchan'
import { createFourPlebsProvider } from './fourplebs'
import { createArchivedMoeProvider } from './archivedmoe'
import { createTwentyTwoChanProvider } from './twentytwochan'

// Register all providers
export function initializeProviders(): void {
    providerRegistry.register('4chan', createFourChanProvider)
    providerRegistry.register('7chan', createSevenChanProvider)
    providerRegistry.register('4plebs', createFourPlebsProvider)
    providerRegistry.register('archivedmoe', createArchivedMoeProvider)
    providerRegistry.register('22chan', createTwentyTwoChanProvider)
}

// Auto-initialize on import
initializeProviders()

// Re-export everything
export { providerRegistry } from './registry'
export type {
    ImageboardProvider,
    Board,
    CatalogThread,
    Thread,
    Post,
    PostData,
    PostResult,
    ProviderInfo,
} from './types'
