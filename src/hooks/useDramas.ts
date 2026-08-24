import useSWR from 'swr';
import { DramaProvider, UnifiedDrama } from '@/types/drama';
import { normalizeDramaList } from '@/lib/normalizers';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
};

export function useDramas(
  provider: DramaProvider,
  category: string = 'foryou',
  params: Record<string, string | number> = {}
) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') queryParams.set(k, String(v));
  });
  const queryString = queryParams.toString();

  let endpoint = `/api/${provider}/${category}`;
  if (queryString) {
    endpoint += `?${queryString}`;
  }

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute client-side deduplication
  });

  const dramas: UnifiedDrama[] = data ? normalizeDramaList(provider, data) : [];

  return {
    dramas,
    raw: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useSearchDramas(
  provider: DramaProvider,
  query: string
) {
  const shouldFetch = !!query && query.trim().length > 0;
  const endpoint = shouldFetch 
    ? `/api/${provider}/search?query=${encodeURIComponent(query.trim())}` 
    : null;

  const { data, error, isLoading } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const dramas: UnifiedDrama[] = data ? normalizeDramaList(provider, data) : [];

  return {
    dramas,
    isLoading: shouldFetch && isLoading,
    isError: !!error,
    error,
  };
}
