import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({ component: Wishlist });

// Storage key for wishlist products data
const WISHLIST_PRODUCTS_KEY = "furnx_wishlist_products";

function Wishlist() {
  const { ids } = useWishlist();
  const [items, setItems] = useState<ProductCardData[]>([]);

  useEffect(() => {
    try {
      const productsData = localStorage.getItem(WISHLIST_PRODUCTS_KEY);
      const allProducts: Record<string, ProductCardData> = productsData ? JSON.parse(productsData) : {};

      // Filter products that are in current wishlist
      const wishlistItems = Array.from(ids)
        .map((id) => allProducts[id])
        .filter((item): item is ProductCardData => item !== undefined);

      setItems(wishlistItems);
    } catch {
      setItems([]);
    }
  }, [ids]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Wishlist</h1>
        <p className="mt-3 text-muted-foreground">Nothing saved yet.</p>
        <Link to="/shop"><Button className="mt-6">Continue shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold">Wishlist</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
