import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: products }, { data: orders }, { count: users }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      const revenue = (orders ?? []).reduce((s, o: any) => s + Number(o.total), 0);
      setStats({ products: products ?? 0, orders: orders?.length ?? 0, revenue, users: users ?? 0 });
    })();
  }, []);

  const cards = [
    { label: "Total revenue", value: `$${stats.revenue.toFixed(2)}` },
    { label: "Orders", value: stats.orders },
    { label: "Products", value: stats.products },
    { label: "Customers", value: stats.users },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
