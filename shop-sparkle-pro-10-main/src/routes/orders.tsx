import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface OrderItem { id: string; product_name: string; product_image: string | null; quantity: number; price: number; }
interface Order { id: string; total: number; status: string; created_at: string; items: OrderItem[]; }

const statusColor: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-primary/20 text-primary",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

export const Route = createFileRoute("/orders")({ component: Orders });

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from("orders").select("id,total,status,created_at, items:order_items(id,product_name,product_image,quantity,price)")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data as any) ?? []); setLoading(false); });
  }, [user]);

  if (!user) return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">My orders</h1>
      <p className="mt-3 text-muted-foreground">Please sign in to see your orders.</p>
      <Link to="/auth"><Button className="mt-6">Sign in</Button></Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold">My Orders</h1>
      {loading ? <p className="mt-10 text-muted-foreground">Loading…</p>
        : orders.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/shop"><Button className="mt-4">Start shopping</Button></Link>
          </div>
        ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border border-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-sm">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor[o.status] ?? ""}`}>{o.status}</span>
                <div className="font-display text-lg font-semibold text-primary">${Number(o.total).toFixed(2)}</div>
              </div>
              <div className="mt-4 grid gap-2">
                {o.items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 text-sm">
                    {i.product_image && <img src={i.product_image} alt="" className="h-10 w-10 rounded object-cover" />}
                    <span className="flex-1 line-clamp-1">{i.product_name} × {i.quantity}</span>
                    <span>${(Number(i.price) * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
