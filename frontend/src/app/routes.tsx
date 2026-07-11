import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import Root from "./Root";

// ── Lazy-loaded pages (code splitting) ───────────────────────────────────────
const Home          = lazy(() => import("./pages/Home"));
const Shop          = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart          = lazy(() => import("./pages/Cart"));
const Checkout      = lazy(() => import("./pages/Checkout"));
const OrderSuccess  = lazy(() => import("./pages/OrderSuccess"));
const OrderCancel   = lazy(() => import("./pages/OrderCancel"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const AIAssistant   = lazy(() => import("./pages/AIAssistant"));
const SkinQuiz      = lazy(() => import("./pages/SkinQuiz"));

// Auth
const AuthLayout     = lazy(() => import("./pages/Auth").then(m => ({ default: m.default })));
const Login          = lazy(() => import("./pages/Auth").then(m => ({ default: m.Login })));
const Register       = lazy(() => import("./pages/Auth").then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import("./pages/Auth").then(m => ({ default: m.ForgotPassword })));
const ResetPassword  = lazy(() => import("./pages/Auth").then(m => ({ default: m.ResetPassword })));
const VerifyEmail    = lazy(() => import("./pages/Auth").then(m => ({ default: m.VerifyEmail })));
const VerifyOTP      = lazy(() => import("./pages/Auth").then(m => ({ default: m.VerifyOTP })));
const VerifyPhone    = lazy(() => import("./pages/Auth").then(m => ({ default: m.VerifyPhone })));

// Dashboard
const DashboardLayout        = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.default })));
const DashboardHome          = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardHome })));
const DashboardProfile       = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardProfile })));
const DashboardOrders        = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardOrders })));
const DashboardWishlist      = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardWishlist })));
const DashboardAddresses     = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardAddresses })));
const DashboardPayments      = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardPayments })));
const DashboardNotifications = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardNotifications })));
const DashboardRewards       = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardRewards })));
const DashboardCoupons       = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardCoupons })));
const DashboardReferrals     = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardReferrals })));
const DashboardSettings      = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardSettings })));
const DashboardSupport       = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.DashboardSupport })));

// Admin
const AdminLogin         = lazy(() => import("./pages/AdminLogin"));
const AdminLayout        = lazy(() => import("./pages/Admin").then(m => ({ default: m.default })));
const AdminDashboard     = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminDashboard })));
const AdminProducts      = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminProducts })));
const AdminCategories    = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminCategories })));
const AdminOrders        = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminOrders })));
const AdminCustomers     = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminCustomers })));
const AdminMarketing     = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminMarketing })));
const AdminContent       = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminContent })));
const AdminReports       = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminReports })));
const AdminSettings      = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminSettings })));
const AdminSupport       = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminSupport })));
const AdminNotifications = lazy(() => import("./pages/Admin").then(m => ({ default: m.AdminNotifications })));

// ── 404 ───────────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden" style={{ backgroundColor: "#1a3d2b" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.1) 0%, transparent 65%)" }} />
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(5rem,15vw,10rem)", fontWeight: 700, color: "rgba(201,168,76,0.15)", lineHeight: 1 }}>404</div>
      <div className="relative -mt-8">
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: 700, color: "#f5f0e8" }}>Page Not Found</h1>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.55)", marginTop: "0.75rem", marginBottom: "2.5rem" }}>The page you are looking for does not exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/" style={{ padding: "12px 32px", backgroundColor: "#c9a84c", color: "#1a3d2b", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", display: "inline-block" }}>Back to Home</a>
          <a href="/shop" style={{ padding: "12px 32px", border: "1px solid rgba(201,168,76,0.4)", color: "#f5f0e8", fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", display: "inline-block" }}>Browse Shop</a>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // ── Admin (completely separate, no Root wrapper) ──
  { path: "/admin/login", Component: AdminLogin },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true,             Component: AdminDashboard },
      { path: "products",        Component: AdminProducts },
      { path: "categories",      Component: AdminCategories },
      { path: "orders",          Component: AdminOrders },
      { path: "customers",       Component: AdminCustomers },
      { path: "marketing",       Component: AdminMarketing },
      { path: "content",         Component: AdminContent },
      { path: "reports",         Component: AdminReports },
      { path: "settings",        Component: AdminSettings },
      { path: "support",         Component: AdminSupport },
      { path: "notifications",   Component: AdminNotifications },
    ],
  },

  // ── Customer-facing site ──
  {
    path: "/",
    Component: Root,
    children: [
      { index: true,            Component: Home },
      { path: "shop",           Component: Shop },
      { path: "products/:slug", Component: ProductDetail },
      { path: "cart",           Component: Cart },
      { path: "checkout",       Component: Checkout },
      { path: "order-success",  Component: OrderSuccess },
      { path: "order-cancel",   Component: OrderCancel },
      { path: "track/:orderId", Component: OrderTracking },
      { path: "ai",             Component: AIAssistant },
      { path: "quiz",           Component: SkinQuiz },

      // Auth
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          { index: true,          Component: Login },
          { path: "login",        Component: Login },
          { path: "register",     Component: Register },
          { path: "forgot",       Component: ForgotPassword },
          { path: "reset",        Component: ResetPassword },
          { path: "verify-email", Component: VerifyEmail },
          { path: "otp",          Component: VerifyOTP },
          { path: "verify-phone", Component: VerifyPhone },
        ],
      },

      // Customer Dashboard
      {
        path: "dashboard",
        Component: DashboardLayout,
        children: [
          { index: true,             Component: DashboardHome },
          { path: "profile",         Component: DashboardProfile },
          { path: "orders",          Component: DashboardOrders },
          { path: "wishlist",        Component: DashboardWishlist },
          { path: "addresses",       Component: DashboardAddresses },
          { path: "payments",        Component: DashboardPayments },
          { path: "notifications",   Component: DashboardNotifications },
          { path: "rewards",         Component: DashboardRewards },
          { path: "coupons",         Component: DashboardCoupons },
          { path: "referrals",       Component: DashboardReferrals },
          { path: "settings",        Component: DashboardSettings },
          { path: "support",         Component: DashboardSupport },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);
