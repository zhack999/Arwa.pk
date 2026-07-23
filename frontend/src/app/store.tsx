import { fetchAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead, deleteAdminNotification, type AdminNotification } from "./api/adminNotifications";
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { type Product } from "./data";
import { loginApi, logoutApi, checkAuthApi, type Admin } from "./api/auth";
import { registerApi, loginCustomerApi, logoutCustomerApi, checkCustomerAuthApi, verifyEmailOtpApi, verifyEmailTokenApi, resendVerificationApi, forgotPasswordApi, verifyResetOtpApi, resetPasswordApi, googleAuthApi, facebookAuthApi, logoutAllDevicesApi, fetchAuthConfig, type AuthProviderConfig } from "./api/customerAuth";
import { fetchWishlist, addWishlistItem, removeWishlistItem } from "./api/wishlist";
import { fetchStorefrontProducts } from "./api/products";
import {
  fetchCart as fetchCartApi,
  addCartItem as addCartItemApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCart as clearCartApi,
  type BackendCartItem,
} from "./api/cart";

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
  dateOfBirth: string | null;
  gender: string | null;
  profilePicture: string | null;
}

interface Store {
  // Products (real data from the backend, replacing the old data.ts mock list)
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  refetchProducts: () => void;
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
  // Auth (customer)
 user: User | null;
  isAuthenticated: boolean;
  customerAuthLoading: boolean;
  login: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  customerLogin: (email: string, password: string) => Promise<void>;
  // Registration no longer logs the user in — it returns the email so the caller can
  // route to the verify-email screen instead of the dashboard.
  customerRegister: (name: string, email: string, phone: string, password: string) => Promise<{ email: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  verifyEmailToken: (email: string, token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<string>;
  requestPasswordReset: (email: string) => Promise<string>;
  verifyResetOtp: (email: string, otp: string) => Promise<string>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<string>;
  googleLogin: (accessToken: string) => Promise<void>;
  facebookLogin: (accessToken: string) => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  authProviderConfig: AuthProviderConfig | null;
  logout: () => void;
  // Recently viewed
  recentlyViewed: Product[];
  addToRecentlyViewed: (p: Product) => void;
  // Admin
  admin: Admin | null;
  isAdmin: boolean;
  adminAuthLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  adminNotifications: AdminNotification[];
  adminUnreadCount: number;
  markAdminNotifRead: (id: string) => void;
  markAllAdminNotifsRead: () => void;
  deleteAdminNotif: (id: string) => void;
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
  const [products, setProducts]             = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError]   = useState<string | null>(null);
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [wishlist, setWishlist]             = useState<Set<string>>(new Set());
  const [user, setUser]                     = useState<User | null>(null);
  const [customerAuthLoading, setCustomerAuthLoading] = useState(true);
  const [authProviderConfig, setAuthProviderConfig] = useState<AuthProviderConfig | null>(null);

  useEffect(() => {
    fetchAuthConfig()
      .then(setAuthProviderConfig)
      .catch(() => setAuthProviderConfig({ google: false, facebook: false })); // fail closed — hide social buttons rather than show a broken flow
  }, []);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [quickViewId, setQuickViewId]       = useState<string | null>(null);

  // ── Admin auth state ──
  const [admin, setAdmin]                   = useState<Admin | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  const isAdmin = admin !== null;

  // ── Admin notifications state ──
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    setProductsError(null);
    fetchStorefrontProducts()
      .then(setProducts)
      .catch(err => setProductsError(err.message || "Failed to load products"))
      .finally(() => setProductsLoading(false));
  }, []);

  // Load the real product catalog once, for every page (Home/Shop/ProductDetail/
  // Root search & quick-view/Dashboard wishlist/SkinQuiz all read from this
  // instead of each fetching — or worse, importing the old data.ts mock array).
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // On first load, ask the backend "am I still logged in?" (this is what makes
  // refresh keep you logged in — the cookie is invisible to JS, so we must ask).
  useEffect(() => {
    checkAuthApi()
      .then(a => setAdmin(a))
      .catch(() => setAdmin(null))
      .finally(() => setAdminAuthLoading(false));
  }, []);

  // Load admin notifications whenever we become an authenticated admin;
  // clear them out on logout so a fresh login doesn't briefly flash stale data.
  useEffect(() => {
    if (!isAdmin) { setAdminNotifications([]); return; }
    fetchAdminNotifications().then(setAdminNotifications).catch(() => setAdminNotifications([]));
  }, [isAdmin]);

  // If any API call anywhere in the app gets a 401 (session expired/invalid),
  // client.ts fires this event. We only react if the admin was actually
  // logged in — otherwise this would also fire on a plain failed login
  // attempt or the initial "am I logged in?" check, which isn't a real expiry.
  useEffect(() => {
    const handleExpired = () => {
      setAdmin(prev => {
        if (prev) toast.error("Your session has expired. Please log in again.");
        return null;
      });
    };
    window.addEventListener("admin-session-expired", handleExpired);
    return () => window.removeEventListener("admin-session-expired", handleExpired);
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    try {
      const a = await loginApi(email, password);
      setAdmin(a);
      toast.success(`Welcome back, ${a.name}! 🌿`);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      return false;
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // even if the request fails, clear local state so the UI doesn't get stuck
    }
    setAdmin(null);
    toast.info("You have been logged out.");
  }, []);

  const markAdminNotifRead = useCallback((id: string) => {
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    markAdminNotificationRead(id).catch(() => {});
  }, []);

  const markAllAdminNotifsRead = useCallback(() => {
    setAdminNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    markAllAdminNotificationsRead().catch(() => {});
  }, []);

  const deleteAdminNotif = useCallback((id: string) => {
    setAdminNotifications(prev => prev.filter(n => n.id !== id));
    deleteAdminNotification(id).catch(() => {});
  }, []);

  const adminUnreadCount = adminNotifications.filter(n => !n.is_read).length;

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { product, qty }];
    });
    toast.success("Added to cart!", { description: `${product.name} ${product.subtitle} — Rs. ${product.price}`, duration: 2500 });
    setCartDrawerOpen(true);
    if (user) addCartItemApi(product.id, qty).catch(() => toast.error("Couldn't sync cart to your account."));
  }, [user]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
    toast.info("Item removed from cart");
    if (user) removeCartItemApi(productId).catch(() => {});
  }, [user]);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));
    if (user) updateCartItemApi(productId, qty).catch(() => {});
  }, [user]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (user) clearCartApi().catch(() => {});
  }, [user]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const next = new Set(prev);
      const wasSaved = next.has(product.id);

      if (wasSaved) { next.delete(product.id); toast.info("Removed from wishlist"); }
      else { next.add(product.id); toast.success("Added to wishlist!", { description: `${product.name} ${product.subtitle}` }); }

      // Sync to backend if the customer is logged in. If it fails, roll back the optimistic update.
      const syncCall = wasSaved ? removeWishlistItem(product.id) : addWishlistItem(product.id);
      syncCall.catch(() => {
        toast.error("Couldn't save wishlist change. Please try again.");
        setWishlist(current => {
          const rollback = new Set(current);
          if (wasSaved) rollback.add(product.id); else rollback.delete(product.id);
          return rollback;
        });
      });

      return next;
    });
  }, []);

 const login = useCallback((u: User) => {
    setUser(u);
    toast.success(`Welcome back, ${u.name}! 🌿`);
  }, []);

  // Patches the logged-in user's fields locally after a successful profile
  // update — avoids a full re-fetch/re-login just to reflect a name/email change.
  const updateUser = useCallback((patch: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  // Converts the backend's customer shape into the User shape the rest of the app expects
  const toUser = (c: any): User => ({
    id: c.id,
    name: `${c.first_name} ${c.last_name}`.trim(),
    email: c.email,
    phone: c.phone || "",
    points: 0, // loyalty points aren't built yet — see Phase 4 loyalty section
    joinDate: new Date(c.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    dateOfBirth: c.date_of_birth || null,
    gender: c.gender || null,
    profilePicture: c.profile_picture || null,
  });

  const customerLogin = useCallback(async (email: string, password: string) => {
    const c = await loginCustomerApi(email, password);
    login(toUser(c));
  }, [login]);

  const customerRegister = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const [first_name, ...rest] = name.trim().split(" ");
    const last_name = rest.join(" ") || "-";
    const { email: registeredEmail } = await registerApi({ first_name, last_name, email, phone, password });
    return { email: registeredEmail };
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, otp: string) => {
    const c = await verifyEmailOtpApi(email, otp);
    login(toUser(c));
  }, [login]);

  const verifyEmailToken = useCallback(async (email: string, token: string) => {
    const c = await verifyEmailTokenApi(email, token);
    login(toUser(c));
  }, [login]);

  const resendVerification = useCallback(async (email: string) => {
    return resendVerificationApi(email);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return forgotPasswordApi(email);
  }, []);

  const verifyResetOtp = useCallback(async (email: string, otp: string) => {
    return verifyResetOtpApi(email, otp);
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    return resetPasswordApi(resetToken, newPassword);
  }, []);

  const googleLogin = useCallback(async (accessToken: string) => {
    const c = await googleAuthApi(accessToken);
    login(toUser(c));
  }, [login]);

  const facebookLogin = useCallback(async (accessToken: string) => {
    const c = await facebookAuthApi(accessToken);
    login(toUser(c));
  }, [login]);

  const logoutAllDevices = useCallback(async () => {
    await logoutAllDevicesApi();
    setUser(null);
    toast.info("You have been logged out of all devices.");
  }, []);

  const logout = useCallback(() => {
    logoutCustomerApi().catch(() => {});
    setUser(null);
    toast.info("You have been logged out.");
  }, []);

  // On first load, check if the customer is still logged in (cookie-based session restore)
  useEffect(() => {
    checkCustomerAuthApi()
      .then(c => setUser(toUser(c)))
      .catch(() => setUser(null))
      .finally(() => setCustomerAuthLoading(false));
  }, []);

  // Same idea as the admin listener above: if the customer's cookie expires or
  // becomes invalid mid-session (any API call gets a 401), clear their state
  // and tell them, instead of leaving the UI stuck showing them as logged in
  // while every request silently fails. We only react if they were actually
  // logged in, so a failed login attempt doesn't wrongly trigger this.
  useEffect(() => {
    const handleExpired = () => {
      setUser(prev => {
        if (prev) toast.error("Your session has expired. Please log in again.");
        return null;
      });
    };
    window.addEventListener("admin-session-expired", handleExpired);
    return () => window.removeEventListener("admin-session-expired", handleExpired);
  }, []);

  // Whenever the logged-in customer changes (login/logout/session-restore), load their
  // saved wishlist from the backend so it persists across refreshes and devices.
  useEffect(() => {
    if (!user) { setWishlist(new Set()); return; }
    fetchWishlist()
      .then(ids => setWishlist(new Set(ids)))
      .catch(() => {}); // fine to fail silently -- wishlist just starts empty
  }, [user]);
  // When a customer logs in: push whatever's in the local/guest cart up to the
  // backend, then pull the backend cart (now the source of truth) and hydrate
  // it with real product objects. Runs once per login, not on every render.
  const cartSyncedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user) { cartSyncedRef.current = null; return; }
    if (products.length === 0) return; // wait for products so we can hydrate items
    if (cartSyncedRef.current === user.id) return; // already synced this session

    (async () => {
      try {
        for (const item of cart) {
          await addCartItemApi(item.product.id, item.qty);
        }
        const items = await fetchCartApi();
        const hydrated: CartItem[] = items
          .map((i: BackendCartItem) => {
            const product = products.find(p => p.id === i.product_id);
            return product ? { product, qty: i.quantity } : null;
          })
          .filter((x: CartItem | null): x is CartItem => x !== null);
        setCart(hydrated);
        cartSyncedRef.current = user.id;
      } catch {
        // fine to fail silently — cart just stays local-only for this session
      }
    })();
  }, [user, products]);

  const addToRecentlyViewed = useCallback((p: Product) => {
    setRecentlyViewed(prev => [p, ...prev.filter(x => x.id !== p.id)].slice(0, 10));
  }, []);

  const cartCount     = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal     = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const wishlistCount = wishlist.size;

  const isAuthenticated = user !== null;

  return (
    <StoreCtx.Provider value={{
      products, productsLoading, productsError, refetchProducts: loadProducts,
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, updateQty, clearCart,
      wishlist, wishlistCount, toggleWishlist,
      user, isAuthenticated, customerAuthLoading, login, updateUser, customerLogin, customerRegister, logout,
      verifyEmailOtp, verifyEmailToken, resendVerification, requestPasswordReset, verifyResetOtp, resetPassword,
      googleLogin, facebookLogin, logoutAllDevices, authProviderConfig,
      recentlyViewed, addToRecentlyViewed,
      admin, isAdmin, adminAuthLoading, adminLogin, adminLogout,
      adminNotifications, adminUnreadCount, markAdminNotifRead, markAllAdminNotifsRead, deleteAdminNotif,
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
