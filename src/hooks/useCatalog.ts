import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '../utils/apiClient';
import { useSettingsStore } from '../stores/settingsStore';

export function useCatalog(board: string, enabled: boolean = true) {
    const autoRefreshInterval = useSettingsStore((state) => state.autoRefreshInterval);

    return useQuery({
        queryKey: ['catalog', board],
        queryFn: () => fetchCatalog(board),
        staleTime: 30000, // 30 seconds
        refetchInterval: autoRefreshInterval > 0 ? autoRefreshInterval * 1000 : false,
        enabled,
        retry: 2,
    });
}
