import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({ component: Wishlist });

function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<ProductCardData[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("wishlist_items").select("product:products(id,name,slug,price,image_url,rating)").eq("user_id", user.id)
      .then(({ data }) => setItems(((data ?? []).map((r: any) => r.product).filter(Boolean)) as any));
  }, [user]);

  if (!user) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Wishlist</h1>
      <p className="mt-3 text-muted-foreground">Please sign in to see your wishlist.</p>
      <Link to="/auth"><Button className="mt-6">Sign in</Button></Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
