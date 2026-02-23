// hooks/use-infinite-products.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

async function fetchProducts(page: number, filters: Record<string, any>) {
  const params = new URLSearchParams({ page: String(page), ...filters });
  const res = await fetch(`/api/products?${params}`);
  return res.json();
}

export function useInfiniteProducts(filters: Record<string, any> = {}) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  const query = useInfiniteQuery({
    queryKey: ["products", filters],
    queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam, filters),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Auto-fetch next page when sentinel is visible
  useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query.hasNextPage, query.isFetchingNextPage]);

  const products = query.data?.pages.flatMap((p) => p.products) ?? [];

  return { products, query, sentinelRef: ref };
}
