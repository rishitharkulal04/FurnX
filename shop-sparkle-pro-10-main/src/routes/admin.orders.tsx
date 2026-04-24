import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface O { id: string; total: number; status: string; created_at: string; shipping_name: string; user_id: string; }
const STATUSES = ["pending","processing","shipped","delivered","cancelled"];

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

function AdminOrders() {
  const [orders, setOrders] = useState<O[]>([]);
  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left">
            <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Date</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                <td className="p-3">{o.shipping_name}</td>
                <td className="p-3">${Number(o.total).toFixed(2)}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={(v) => update(o.id, v)}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
