import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { isAdmin, loading, user } = useAuth();

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-muted-foreground">Please <Link to="/auth" className="text-primary underline">sign in</Link>.</p>
    </div>
  );
  if (!isAdmin) return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Admin only</h1>
      <p className="mt-2 text-muted-foreground">Your account doesn't have admin access.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="space-y-1 text-sm">
          <h2 className="mb-3 font-display text-xl font-bold">Admin</h2>
          <Link to="/admin" activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary font-medium" }} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-secondary">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link to="/admin/products" activeProps={{ className: "bg-secondary font-medium" }} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-secondary">
            <Package className="h-4 w-4" /> Products
          </Link>
          <Link to="/admin/orders" activeProps={{ className: "bg-secondary font-medium" }} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-secondary">
            <ShoppingBag className="h-4 w-4" /> Orders
          </Link>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
