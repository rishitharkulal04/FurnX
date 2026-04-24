import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Star, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; image_url: string | null; stock: number; rating: number;
  category_id: string | null;
}
interface Review { id: string; rating: number; comment: string; created_at: string; user_id: string; }

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<ProductCardData[]>([]);
  const [recent, setRecent] = useState<ProductCardData[]>([]);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      setProduct(data as any);
      if (data) {
        supabase.from("reviews").select("*").eq("product_id", (data as any).id).order("created_at", { ascending: false })
          .then(({ data: r }) => setReviews((r as any) ?? []));
        if ((data as any).category_id) {
          supabase.from("products").select("id,name,slug,price,image_url,rating")
            .eq("category_id", (data as any).category_id).neq("id", (data as any).id).limit(4)
            .then(({ data: rel }) => setRelated((rel as any) ?? []));
        }
        if (user) {
          supabase.from("recently_viewed").upsert({ user_id: user.id, product_id: (data as any).id, viewed_at: new Date().toISOString() }, { onConflict: "user_id,product_id" }).then();
        }
      }
    });
  }, [slug, user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("recently_viewed")
      .select("viewed_at, product:products(id,name,slug,price,image_url,rating)")
      .eq("user_id", user.id).order("viewed_at", { ascending: false }).limit(5)
      .then(({ data }) => {
        const items = (data ?? []).map((r: any) => r.product).filter((p: any) => p && p.slug !== slug).slice(0, 4);
        setRecent(items);
      });
  }, [user, slug]);

  if (!product) return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to leave a review"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { product_id: product.id, user_id: user.id, rating, comment },
      { onConflict: "product_id,user_id" }
    );
    setSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Review submitted");
      setComment("");
      const { data: r } = await supabase.from("reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false });
      setReviews((r as any) ?? []);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-secondary">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop"}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop";
            }}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-4xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{Number(product.rating).toFixed(1)}</span>
              <span>·</span>
              <span>{reviews.length} reviews</span>
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</div>
          <p className="text-muted-foreground">{product.description}</p>
          <p className="text-sm">{product.stock > 0 ? <span className="text-primary">In stock</span> : <span className="text-destructive">Out of stock</span>}</p>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2"><Plus className="h-4 w-4" /></button>
            </div>
            <Button size="lg" className="rounded-full px-8" disabled={product.stock === 0} onClick={() => add(product.id, qty)}>Add to Cart</Button>
            <Button size="icon" variant="outline" onClick={() => toggle(product.id)} aria-label="Wishlist">
              <Heart className={cn("h-5 w-5", has(product.id) && "fill-primary text-primary")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="mt-6 space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star className={cn("h-6 w-6", n <= rating ? "fill-primary text-primary" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Share your experience…" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
            <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit Review"}</Button>
          </form>
        )}
        <div className="mt-6 space-y-4">
          {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet — be the first!</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < r.rating ? "fill-primary text-primary" : "text-muted-foreground")} />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-sm">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Recently viewed</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
