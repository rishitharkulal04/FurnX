import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  add: (productId: string, product?: CartProduct, qty?: number) => Promise<void>;
  update: (id: string, qty: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartCtx | undefined>(undefined);
const CART_STORAGE_KEY = "furnx_cart";

function loadCartFromStorage(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cartItems = loadCartFromStorage();
    setItems(cartItems);
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    const cartItems = loadCartFromStorage();
    setItems(cartItems);
  }, []);

  const add = async (productId: string, product?: CartProduct, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);
      let updated: CartItem[];

      if (existing) {
        updated = prev.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + qty } : i
        );
      } else {
        if (!product) {
          toast.error("Product information missing");
          return prev;
        }
        const newItem: CartItem = {
          id: `${productId}-${Date.now()}`,
          product_id: productId,
          quantity: qty,
          product,
        };
        updated = [...prev, newItem];
      }

      saveCartToStorage(updated);
      toast.success("Added to cart");
      return updated;
    });
  };

  const update = async (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
      saveCartToStorage(updated);
      return updated;
    });
  };

  const remove = async (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      saveCartToStorage(updated);
      toast.success("Removed from cart");
      return updated;
    });
  };

  const clear = async () => {
    setItems([]);
    saveCartToStorage([]);
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
