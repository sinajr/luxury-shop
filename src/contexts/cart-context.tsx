
"use client";

import type { Product } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Explicitly define CartItem to include a singular imageUrl for display
export interface CartItem extends Product {
  quantity: number;
  imageUrl: string; // Singular image URL for display convenience
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isCartLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART_KEY = 'luxe-collective-cart';
const DEFAULT_CART_ITEM_PLACEHOLDER = 'https://placehold.co/128x128.png';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
    if (storedCart) {
      try {
        // Assume stored items might be of old type (just Product & quantity)
        const parsedCart: (Product & { quantity: number })[] = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          // Migrate old cart items to new CartItem structure with imageUrl
          const migratedCart = parsedCart.map(p => {
            const displayImageUrl = (p.imageUrls && p.imageUrls.length > 0 && p.imageUrls[0])
              ? p.imageUrls[0]
              : DEFAULT_CART_ITEM_PLACEHOLDER;
            return { ...p, quantity: p.quantity, imageUrl: displayImageUrl } as CartItem;
          });
          setItems(migratedCart);
        }
      } catch (error) {
        console.error("Failed to parse or migrate cart from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      }
    }
    setIsCartLoaded(true);
  }, []);

  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items));
    }
  }, [items, isCartLoaded]);

  const addToCart = useCallback((product: Product, quantityToAdd: number = 1) => {
    const displayImageUrl = (product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0])
      ? product.imageUrls[0]
      : DEFAULT_CART_ITEM_PLACEHOLDER;

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex]!;
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantityToAdd,
          // It's good practice to ensure imageUrl is consistent if product data could change,
          // but typically product data itself doesn't change upon adding more quantity.
          // If the product details were re-fetched and *could* have a new primary image, then update:
          // imageUrl: displayImageUrl 
        };
        return updatedItems;
      }
      // Ensure the new item conforms to CartItem, including the derived imageUrl
      const newItem: CartItem = {
        ...product,
        quantity: quantityToAdd,
        imageUrl: displayImageUrl,
      };
      return [...prevItems, newItem];
    });

    setTimeout(() => {
        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
        });
    }, 0);
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    let itemName: string | undefined;
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
         itemName = itemToRemove.name;
      }
      return prevItems.filter(item => item.id !== productId);
    });

    if (itemName) {
        setTimeout(() => {
          toast({
            title: "Removed from Cart",
            description: `${itemName} has been removed from your cart.`,
            variant: "destructive"
          });
        }, 0);
    }
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setTimeout(() => {
        toast({
            title: "Cart Cleared",
            description: "All items have been removed from your cart.",
        });
    }, 0);
  }, [toast]);

  const getCartTotal = useCallback((): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const getCartItemCount = useCallback((): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        isCartLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
