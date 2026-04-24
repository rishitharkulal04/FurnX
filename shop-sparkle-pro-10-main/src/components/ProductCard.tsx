import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  rating?: number;
}

const WISHLIST_PRODUCTS_KEY = "furnx_wishlist_products";

function saveWishlistProduct(product: ProductCardData): void {
  try {
    const data = localStorage.getItem(WISHLIST_PRODUCTS_KEY);
    const products: Record<string, ProductCardData> = data ? JSON.parse(data) : {};
    products[product.id] = product;
    localStorage.setItem(WISHLIST_PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // Silently fail
  }
}

function deleteWishlistProduct(productId: string): void {
  try {
    const data = localStorage.getItem(WISHLIST_PRODUCTS_KEY);
    const products: Record<string, ProductCardData> = data ? JSON.parse(data) : {};
    delete products[productId];
    localStorage.setItem(WISHLIST_PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // Silently fail
  }
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const liked = has(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!liked) {
      saveWishlistProduct(product);
    } else {
      deleteWishlistProduct(product.id);
    }
    await toggle(product.id);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop";
  };

  const imageUrl = product.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop";

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-xl">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <button
            onClick={handleToggleWishlist}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm transition hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("h-4 w-4", liked && "fill-primary text-primary")} />
          </button>
        </div>
        <div className="space-y-1 p-4">
          <h3 className="line-clamp-1 font-medium">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-semibold text-primary">${Number(product.price).toFixed(2)}</span>
            {product.rating ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {Number(product.rating).toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button onClick={() => add(product.id, product)} variant="default" size="sm" className="w-full">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
