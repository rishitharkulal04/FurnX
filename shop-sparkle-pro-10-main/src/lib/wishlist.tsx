import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface WishCtx {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  refresh: () => Promise<void>;
}
const WishContext = createContext<WishCtx | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "furnx_wishlist";

function loadWishlistFromStorage(): Set<string> {
  try {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return new Set(data ? JSON.parse(data) : []);
  } catch {
    return new Set();
  }
}

function saveWishlistToStorage(ids: Set<string>): void {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const wishlist = loadWishlistFromStorage();
    setIds(wishlist);
  }, []);

  const refresh = useCallback(() => {
    const wishlist = loadWishlistFromStorage();
    setIds(wishlist);
  }, []);

  const toggle = async (productId: string) => {
    setIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(productId)) {
        updated.delete(productId);
        toast.success("Removed from wishlist");
      } else {
        updated.add(productId);
        toast.success("Added to wishlist");
      }
      saveWishlistToStorage(updated);
      return updated;
    });
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
