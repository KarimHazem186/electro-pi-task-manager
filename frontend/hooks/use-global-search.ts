import { useQuery } from "@tanstack/react-query";

import { searchService, type GlobalSearchParams } from "@/services/search.service";
import { queryKeys } from "@/hooks/query-keys";
import type { SearchResponse } from "@/types";

const MIN_QUERY_LENGTH = 2;

export function useGlobalSearch(
  params: GlobalSearchParams,
  options: { enabled?: boolean } = {},
) {
  const trimmed = params.q.trim();
  const enabled = (options.enabled ?? true) && trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery<SearchResponse>({
    queryKey: queryKeys.search.global(params),
    queryFn: () => searchService.global(params),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
