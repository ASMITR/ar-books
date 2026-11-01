"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem } from "@/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalPaise: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ar-cart");
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        // Ensure legacy items without quantity default to 1
        setItems(parsed.map((i) => ({ ...i, quantity: i.quantity ?? 1 })));
      }
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("ar-cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === item.bookId);
      if (existing) {
        // Increment quantity if already in cart
        return prev.map((i) =>
          i.bookId === item.bookId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    if (quantity < 1) {
      // Remove item when quantity drops below 1
      setItems((prev) => prev.filter((i) => i.bookId !== bookId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPaise = items.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPaise, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalPaise: 0,
      count: 0,
    } as CartContextValue;
  }
  return ctx;
}
