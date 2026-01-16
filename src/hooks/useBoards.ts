import { useQuery } from '@tanstack/react-query';
import { fetchAllBoardsWithMetadata } from '../utils/apiClient';

export function useBoards() {
    return useQuery({
        queryKey: ['boards'],
        queryFn: fetchAllBoardsWithMetadata,
        staleTime: 1000 * 60 * 60, // 1 hour - boards don't change often
        retry: 2,
    });
}
