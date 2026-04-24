import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SearchParams {
  q?: string; category?: string; min?: number; max?: number; rating?: number;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    min: s.min !== undefined ? Number(s.min) : undefined,
    max: s.max !== undefined ? Number(s.max) : undefined,
    rating: s.rating !== undefined ? Number(s.rating) : undefined,
  }),
  component: Shop,
});

interface Category { id: string; name: string; slug: string; }

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [products, setProducts] = useState<(ProductCardData & { category_id: string | null })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("id,name,slug").then(({ data }) => setCategories((data as any) ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.from("products").select("id,name,slug,price,image_url,rating,category_id").then(({ data }) => {
      setProducts((data as any) ?? []);
      setLoading(false);
    });
  }, []);

  const catBySlug = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.id])), [categories]);
  const categoryId = search.category ? catBySlug[search.category] : undefined;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search.q && !p.name.toLowerCase().includes(search.q.toLowerCase())) return false;
      if (categoryId && p.category_id !== categoryId) return false;
      if (search.min !== undefined && Number(p.price) < search.min) return false;
      if (search.max !== undefined && Number(p.price) > search.max) return false;
      if (search.rating !== undefined && Number(p.rating ?? 0) < search.rating) return false;
      return true;
    });
  }, [products, search, categoryId]);

  const update = (patch: Partial<SearchParams>) =>
    navigate({ to: "/shop", search: { ...search, ...patch } as any });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Shop</h1>
          <p className="text-muted-foreground">{filtered.length} products</p>
        </div>
        <Input
          placeholder="Search…"
          value={search.q ?? ""}
          onChange={(e) => update({ q: e.target.value || undefined })}
          className="md:max-w-xs"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Category</h3>
            <div className="space-y-1">
              <button onClick={() => update({ category: undefined })} className={`block w-full rounded px-2 py-1 text-left text-sm hover:bg-secondary ${!search.category ? "bg-secondary font-medium" : ""}`}>All</button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => update({ category: c.slug })} className={`block w-full rounded px-2 py-1 text-left text-sm hover:bg-secondary ${search.category === c.slug ? "bg-secondary font-medium" : ""}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Price</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Min</Label><Input type="number" value={search.min ?? ""} onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })} /></div>
              <div><Label className="text-xs">Max</Label><Input type="number" value={search.max ?? ""} onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })} /></div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">Min rating</h3>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((r) => (
                <button key={r} onClick={() => update({ rating: r || undefined })} className={`rounded border px-2 py-1 text-xs ${search.rating === r || (!search.rating && r === 0) ? "bg-primary text-primary-foreground" : ""}`}>
                  {r === 0 ? "All" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/shop", search: {} as any })}>Clear filters</Button>
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No products match your filters.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
