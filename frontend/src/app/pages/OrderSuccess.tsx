import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { useStore } from "../store";
import { trackOrderPublic, type TrackedOrder, type TrackedOrderItem } from "../api/orderStatus";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { C } from "../shared";
import { Check, Truck, Shield, RotateCcw, ChevronRight, Loader2, AlertCircle } from "lucide-react";

// Stripe's webhook is usually near-instant, but we still poll a few times in
// case it lags a couple of seconds behind the redirect back to our site.
const MAX_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

type ViewState = "loading" | "confirmed" | "pending" | "error";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { clearCart } = useStore();

  const orderNumber = params.get("order_number");
  const email = params.get("email");

  const [view, setView] = useState<ViewState>("loading");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [items, setItems] = useState<TrackedOrderItem[]>([]);
  const [attempt, setAttempt] = useState(0);
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!orderNumber || !email) {
      setView("error");
      return;
    }

    let cancelled = false;

    const poll = async (attemptNum: number) => {
      try {
        const data = await trackOrderPublic(orderNumber, email);
        if (cancelled) return;

        const isPaid = data.order.payment_status === "paid" || !!data.order.finalized_at;
        if (isPaid) {
          setOrder(data.order);
          setItems(data.items);
          setView("confirmed");
          if (!clearedRef.current) {
            clearedRef.current = true;
            clearCart();
          }
          return;
        }

        if (attemptNum >= MAX_ATTEMPTS) {
          setOrder(data.order);
          setView("pending");
          return;
        }

        setAttempt(attemptNum + 1);
        setTimeout(() => poll(attemptNum + 1), POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setView("error");
      }
    };

    poll(0);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber, email]);

  const retryCheck = () => {
    setView("loading");
    setAttempt(0);
  };

  // ── Loading / confirming ──
  if (view === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
        <Loader2 size={40} color={C.gold} className="animate-spin mb-6" />
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: C.green, marginBottom: 8 }}>Confirming your payment...</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted }}>
          Please don't close this page. This usually takes just a few seconds.
        </p>
      </div>
    );
  }

  // ── Error: missing/invalid params, or the lookup failed outright ──
  if (view === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
        <AlertCircle size={48} color="#d4183d" className="mb-6" />
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: C.green, marginBottom: 12 }}>
          We couldn't confirm this order
        </h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 32, maxWidth: 420 }}>
          If a payment was taken, don't worry — it will still show up in your order history shortly. If you need help,
          reach out on WhatsApp: <a href="https://wa.me/923140628188" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>+92 314 0628188</a>.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/")} className="px-6 py-3 text-sm uppercase tracking-widest border hover:bg-black/5 transition-colors"
            style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
            Back to Home
          </button>
          <button onClick={() => navigate("/dashboard/orders")} className="px-6 py-3 text-sm uppercase tracking-widest"
            style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  // ── Pending: payment not confirmed yet after polling — don't claim success ──
  if (view === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
        <Loader2 size={40} color={C.gold} className="mb-6" />
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", color: C.green, marginBottom: 12 }}>
          Still confirming payment for {orderNumber}
        </h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 24, maxWidth: 420 }}>
          Your payment may still be processing on Stripe's side. You can check again in a moment, or view your order status in your dashboard.
        </p>
        <div className="flex gap-3">
          <button onClick={retryCheck} className="px-6 py-3 text-sm uppercase tracking-widest"
            style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
            Check Again
          </button>
          <button onClick={() => navigate("/dashboard/orders")} className="px-6 py-3 text-sm uppercase tracking-widest border hover:bg-black/5 transition-colors"
            style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
            View Orders
          </button>
        </div>
      </div>
    );
  }

  // ── Confirmed ──
  const total = order ? Number(order.total) : 0;

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100vh" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: C.gold }}>
            <Check size={36} color={C.green} strokeWidth={3} />
          </motion.div>

          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", fontWeight: 700, color: C.green, marginBottom: 8 }}>
            Payment Successful!
          </h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>
            Thank you{order ? `, ${order.customer_name}` : ""}! Your payment has been confirmed and your order is on its way to being processed.
          </p>

          <div className="p-5 mb-6 mx-auto max-w-sm text-left" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.25)` }}>
            <div className="flex justify-between items-start">
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted }}>Order Number</p>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 700, color: C.gold, marginTop: 4 }}>{order?.order_number}</p>
              </div>
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider" style={{ backgroundColor: "rgba(45,138,78,0.12)", color: "#2d8a4e" }}>
                Paid
              </span>
            </div>
            <div style={{ height: 1, backgroundColor: "rgba(201,168,76,0.2)", margin: "14px 0" }} />

            {items.length > 0 && (
              <div className="space-y-2 mb-3">
                {items.map(i => (
                  <div key={i.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#eee8da" }}>
                      {i.product_image && <ImageWithFallback src={i.product_image} alt={i.product_name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.green }}>{i.product_name} × {i.quantity}</p>
                    </div>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.green }}>Rs. {Number(i.subtotal).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ height: 1, backgroundColor: "rgba(201,168,76,0.15)", margin: "10px 0" }} />
              </div>
            )}

            <div className="flex justify-between">
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 700, color: C.green }}>Total Paid</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 700, color: C.green }}>Rs. {total.toLocaleString()}</span>
            </div>
            {order && (
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.muted, marginTop: 10 }}>
                Delivering to: {order.shipping_city}, {order.shipping_province}
              </p>
            )}
          </div>

          {/* Delivery info cards */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
            {[
              { Icon: Truck, t: "2–4 Days", s: "Estimated delivery" },
              { Icon: Shield, t: "Secure", s: "Payment confirmed" },
              { Icon: RotateCcw, t: "2-Day", s: "Return policy" },
            ].map(({ Icon, t, s }) => (
              <div key={t} className="text-center p-3" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.18)` }}>
                <Icon size={16} color={C.gold} style={{ margin: "0 auto 4px" }} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600, color: C.green }}>{t}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: C.muted }}>{s}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate("/shop")} className="group px-6 py-3 text-sm uppercase tracking-widest border hover:bg-black/5 transition-colors"
              style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
              Continue Shopping
            </button>
            <button onClick={() => navigate("/dashboard/orders")} className="group px-6 py-3 text-sm uppercase tracking-widest flex items-center gap-2"
              style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>
              View Orders <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
