import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

interface WishCtx {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  refresh: () => Promise<void>;
}
const WishContext = createContext<WishCtx | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", user.id);
    setIds(new Set((data ?? []).map((r) => r.product_id)));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (productId: string) => {
    if (!user) { toast.error("Please sign in to use wishlist"); return; }
    if (ids.has(productId)) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
      toast.success("Removed from wishlist");
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
      toast.success("Added to wishlist");
    }
    refresh();
  };

  return (
    <WishContext.Provider value={{ ids, toggle, has: (id) => ids.has(id), refresh }}>
      {children}
    </WishContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
