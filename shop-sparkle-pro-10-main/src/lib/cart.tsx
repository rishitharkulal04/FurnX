import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string | null;
    stock: number;
  };
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  add: (productId: string, qty?: number) => Promise<void>;
  update: (id: string, qty: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, product:products(id,name,slug,price,image_url,stock)")
      .eq("user_id", user.id);
    setItems((data as any) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (productId: string, qty = 1) => {
    if (!user) { toast.error("Please sign in to add items to your cart"); return; }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: qty });
    }
    toast.success("Added to cart");
    refresh();
  };

  const update = async (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    refresh();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    refresh();
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * Number(i.product.price), 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, add, update, remove, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
