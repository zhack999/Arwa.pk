import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { type Product } from "./data";

export interface CartItem {
  product: Product;
  qty: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  joinDate: string;
}

interface Store {
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  // Wishlist
  wishlist: Set<string>;
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (u: User) => void;
  logout: () => void;
  // Recently viewed
  recentlyViewed: Product[];
  addToRecentlyViewed: (p: Product) => void;
  // Admin
  isAdmin: boolean;
  adminLogin: () => void;
  adminLogout: () => void;
  // UI overlays
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  quickViewId: string | null;
  setQuickViewId: (id: string | null) => void;
}

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [wishlist, setWishlist]             = useState<Set<string>>(new Set());
  const [user, setUser]                     = useState<User | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [quickViewId, setQuickViewId]       = useState<string | null>(null);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
    toast.success("Added to cart!", { description: `${product.name} ${product.subtitle} — Rs. ${product.price}`, duration: 2500 });
    setCartDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
    toast.info("Item removed from cart");
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) { next.delete(product.id); toast.info("Removed from wishlist"); }
      else { next.add(product.id); toast.success("Added to wishlist!", { description: `${product.name} ${product.subtitle}` }); }
      return next;
    });
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
    toast.success(`Welcome back, ${u.name}! 🌿`);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    toast.info("You have been logged out.");
  }, []);

  const addToRecentlyViewed = useCallback((p: Product) => {
    setRecentlyViewed(prev => [p, ...prev.filter(x => x.id !== p.id)].slice(0, 10));
  }, []);

  const cartCount     = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal     = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const wishlistCount = wishlist.size;
  const [isAdmin, setIsAdmin] = useState(false);
  const adminLogin  = useCallback(() => setIsAdmin(true), []);
  const adminLogout = useCallback(() => setIsAdmin(false), []);

  const isAuthenticated = user !== null;

  return (
    <StoreCtx.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, clearCart,
      wishlist, wishlistCount, toggleWishlist,
      user, isAuthenticated, login, logout,
      recentlyViewed, addToRecentlyViewed,
      isAdmin, adminLogin, adminLogout,
      cartDrawerOpen, setCartDrawerOpen,
      searchOpen, setSearchOpen,
      quickViewId, setQuickViewId,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be within StoreProvider");
  return ctx;
}
