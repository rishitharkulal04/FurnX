import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "", country: "", phone: "" });

  if (!user) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <p className="mt-3 text-muted-foreground">Please sign in to checkout.</p>
      <Link to="/auth"><Button className="mt-6">Sign in</Button></Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p>Your cart is empty.</p>
      <Link to="/shop"><Button className="mt-4">Shop</Button></Link>
    </div>
  );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.zip || !form.country || !form.phone) {
      toast.error("Please fill all fields"); return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id, total,
      shipping_name: form.name, shipping_address: form.address, shipping_city: form.city,
      shipping_zip: form.zip, shipping_country: form.country, shipping_phone: form.phone,
    }).select().single();
    if (error || !order) { setSubmitting(false); toast.error(error?.message ?? "Failed"); return; }
    const orderItems = items.map((i) => ({
      order_id: order.id, product_id: i.product.id, product_name: i.product.name,
      product_image: i.product.image_url, quantity: i.quantity, price: i.product.price,
    }));
    await supabase.from("order_items").insert(orderItems);
    await clear();
    toast.success("Order placed!");
    navigate({ to: "/orders" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-xl border border-border p-6">
          <h2 className="font-display text-xl font-bold">Shipping address</h2>
          <div><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
          <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
            <div><Label>ZIP</Label><Input value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
          </div>
        </div>
        <aside className="h-fit space-y-4 rounded-xl bg-secondary/40 p-6">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          {items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span className="line-clamp-1">{i.product.name} × {i.quantity}</span>
              <span>${(i.quantity * Number(i.product.price)).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-4 flex justify-between font-display text-lg font-semibold">
            <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-full" size="lg">
            {submitting ? "Placing…" : "Place Order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
