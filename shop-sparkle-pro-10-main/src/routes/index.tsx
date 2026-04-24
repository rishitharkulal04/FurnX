import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

interface Category { id: string; name: string; slug: string; image_url: string | null; }

function Index() {
  const [featured, setFeatured] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("products").select("id,name,slug,price,image_url,rating").eq("featured", true).limit(8)
      .then(({ data }) => setFeatured((data as any) ?? []));
    supabase.from("categories").select("*").then(({ data }) => setCategories((data as any) ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-peach">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
            <span className="inline-block rounded-full bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-wider">New Arrival</span>
            <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
              Discover Our<br /><span className="text-primary">New Collection</span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Hand-picked, beautifully crafted pieces designed to bring warmth and character to every space in your home.
            </p>
            <Link to="/shop">
              <Button size="lg" className="rounded-full px-8">Buy Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <img src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900" alt="Featured living room" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Browse The Range</h2>
          <p className="mt-2 text-muted-foreground">Find the perfect piece for every room.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.slug } as any} className="group">
              <div className="aspect-[4/5] overflow-hidden rounded-xl">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                )}
              </div>
              <h3 className="mt-3 text-center text-lg font-medium">{c.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Our Products</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/shop"><Button variant="outline" size="lg" className="rounded-full px-10">Show More</Button></Link>
        </div>
      </section>
    </div>
  );
}
