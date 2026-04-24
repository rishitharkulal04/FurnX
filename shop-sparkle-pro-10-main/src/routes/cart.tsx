import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { items, total, update, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <Link to="/shop"><Button className="mt-6">Continue shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold">Cart</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 rounded-xl border border-border p-4">
              <Link to="/product/$slug" params={{ slug: it.product.slug }} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {it.product.image_url && <img src={it.product.image_url} alt={it.product.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link to="/product/$slug" params={{ slug: it.product.slug }} className="font-medium hover:text-primary">{it.product.name}</Link>
                  <p className="text-sm text-primary font-display">${Number(it.product.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-border">
                    <button onClick={() => update(it.id, it.quantity - 1)} className="px-2 py-1"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{it.quantity}</span>
                    <button onClick={() => update(it.id, it.quantity + 1)} className="px-2 py-1"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="font-display font-semibold">${(it.quantity * Number(it.product.price)).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <aside className="h-fit space-y-4 rounded-xl bg-secondary/40 p-6">
          <h2 className="font-display text-xl font-bold">Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-primary">Free</span></div>
          <div className="border-t border-border pt-4 flex justify-between font-display text-lg font-semibold">
            <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout"><Button className="w-full rounded-full" size="lg">Checkout</Button></Link>
        </aside>
      </div>
    </div>
  );
}
