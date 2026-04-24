import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "", country: "", phone: "" });

  if (items.length === 0) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p>Your cart is empty.</p>
      <Link to="/shop"><Button className="mt-4">Shop</Button></Link>
    </div>
  );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.zip || !form.country || !form.phone) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        full_name: form.name,
        address: form.address,
        city: form.city,
        zip: form.zip,
        country: form.country,
        phone: form.phone,
        total,
      }).select().single();

      if (error || !order) {
        toast.error(error?.message ?? "Failed to place order");
        setSubmitting(false);
        return;
      }

      // Insert order items
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product.name,
        product_image: i.product.image_url,
        quantity: i.quantity,
        price: i.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        toast.error("Order created but failed to save items");
        setSubmitting(false);
        return;
      }

      // Clear cart from localStorage
      await clear();
      toast.success("Order placed successfully!");
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error("An error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
