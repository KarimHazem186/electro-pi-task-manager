import { api } from "@/lib/api/client";
import type { SearchResponse } from "@/types";

export interface GlobalSearchParams {
  q: string;
  types?: string;
  limit?: number;
}

export const searchService = {
  global: async (params: GlobalSearchParams): Promise<SearchResponse> => {
    const { q, types, limit } = params;
    const response = await api.get<SearchResponse>("/search", {
      params: { q, types, limit },
    });
    return response.data;
  },
};
