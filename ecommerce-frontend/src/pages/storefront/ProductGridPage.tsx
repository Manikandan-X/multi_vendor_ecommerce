import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAllProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { ProductCard } from "../../components/storefront/ProductCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../lib/errors";

type SortOption = "newest" | "price_asc" | "price_desc";

export default function ProductGridPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useAllProducts();
  const categories = useCategories();

  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") as SortOption) || "newest";

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.data?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories.data]);

  const filteredProducts = useMemo(() => {
    let list = (products.data ?? []).filter((p) => p.is_active);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryId) {
      list = list.filter((p) => p.category_id === categoryId);
    }

    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [products.data, query, categoryId, sort]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  if (products.isLoading) return <LoadingState label="Loading products…" />;
  if (products.isError) return <ErrorState message={getApiErrorMessage(products.error)} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {query ? `Results for "${query}"` : "All products"}
        </h1>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => updateParam("category", "")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !categoryId ? "bg-ink text-white" : "bg-surface text-muted hover:text-ink"
          } border border-border`}
        >
          All
        </button>
        {categories.data?.map((c) => (
          <button
            key={c.id}
            onClick={() => updateParam("category", c.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              categoryId === c.id ? "bg-ink text-white" : "bg-surface text-muted hover:text-ink"
            } border border-border`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products found"
            description={query || categoryId ? "Try a different search or category." : "Check back soon."}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryNameById.get(product.category_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
