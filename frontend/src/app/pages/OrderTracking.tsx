import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useStore } from "../store";
import { trackOrder, type TrackedOrder } from "../api/tracking";
import { C, FadeIn, GoldLine } from "../shared";
import { Package, Truck, MapPin, Check, ChevronLeft, Download, Copy } from "lucide-react";

const STAGE_DEFS = [
  { key: "pending",    label: "Order Placed" },
  { key: "processing", label: "Order Confirmed" },
  { key: "packed",     label: "Packed & Ready" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
];
const STAGE_ICONS = [Package, Package, Package, Truck, Check];

// ─── Email gate (backend requires email to prevent order-number enumeration) ──
function EmailGate({ onSubmit, defaultEmail, notice }: { onSubmit: (email: string) => void; defaultEmail?: string; notice?: string }) {
  const [email, setEmail] = useState(defaultEmail || "");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
      <Package size={48} color="rgba(201,168,76,0.4)" className="mb-4" />
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", color: C.green, marginBottom: 8 }}>Track Your Order</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: C.muted, marginBottom: 20 }}>
        {notice || "Enter the email you used when placing the order."}
      </p>
      <form onSubmit={e => { e.preventDefault(); if (email) onSubmit(email); }} className="flex w-full max-w-sm">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
          className="flex-1 px-4 py-3 text-sm outline-none"
          style={{ border: `1px solid rgba(26,61,43,0.25)`, color: C.green, fontFamily: "'DM Sans',sans-serif" }} />
        <button type="submit" className="px-5 py-3 text-sm uppercase tracking-widest"
          style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>Track</button>
      </form>
    </div>
  );
}

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  const [email, setEmail]   = useState<string | null>(user?.email || null);
  const [order, setOrder]   = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [wasAutoFilled, setWasAutoFilled] = useState(!!user?.email);

  useEffect(() => {
    if (!orderId || !email) return;
    setLoading(true);
    setNotFound(false);
    trackOrder(orderId, email)
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId, email]);

  const handleManualSubmit = (e: string) => { setWasAutoFilled(false); setEmail(e); };

  if (!email) return <EmailGate onSubmit={handleManualSubmit} />;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: C.ivory, fontFamily: "'DM Sans',sans-serif", color: C.muted }}>Loading order...</div>;
  }

  if (notFound && wasAutoFilled) {
    return (
      <EmailGate
        onSubmit={handleManualSubmit}
        defaultEmail={email}
        notice={`We couldn't find order ${orderId} for your account email. If you used a different email at checkout, enter it here.`}
      />
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
        <Package size={60} color="rgba(201,168,76,0.3)" className="mb-4" />
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: C.green, marginBottom: 8 }}>Order Not Found</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 20 }}>
          We couldn't find order <strong>{orderId}</strong> for that email.
        </p>
        <button onClick={() => setEmail(null)} className="px-6 py-3 text-sm uppercase tracking-widest"
          style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>Try Another Email</button>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentIdx = STAGE_DEFS.findIndex(s => s.key === order.status);
  const progress = isCancelled ? 100 : Math.round(((currentIdx + 1) / STAGE_DEFS.length) * 100);

  const timeline = STAGE_DEFS.map((stage, i) => {
    const match = order.timeline.find(t => t.status === stage.key);
    return {
      ...stage,
      date: match ? match.date : (i <= currentIdx ? "—" : "Pending"),
      done: !!match,
      active: i === currentIdx && !isCancelled,
    };
  });

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100vh" }}>
      <div className="pt-20 pb-12" style={{ backgroundColor: C.green }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 mb-5 hover:opacity-60 transition-opacity"
            style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(245,240,232,0.55)" }}>
            <ChevronLeft size={14} /> Back
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Order Tracking</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 700, color: C.ivory }}>{order.id}</h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.55)", marginTop: 4 }}>
                Placed on {order.date} · Status: {order.statusLabel}
              </p>
            </div>
            <div className="flex gap-2">
              {order.tracking && (
                <button onClick={() => { navigator.clipboard.writeText(order.tracking!); toast.success("Tracking number copied!"); }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider border"
                  style={{ borderColor: "rgba(201,168,76,0.35)", color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>
                  <Copy size={12} /> {order.tracking}
                </button>
              )}
              <button onClick={() => toast.info("Invoice download coming soon!")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider"
                style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
                <Download size={12} /> Invoice
              </button>
            </div>
          </div>

          {!isCancelled && (
            <>
              <div className="mt-6 h-1.5 overflow-hidden" style={{ backgroundColor: "rgba(245,240,232,0.1)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full" style={{ backgroundColor: C.gold }} />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(245,240,232,0.4)" }}>Order Placed</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: C.gold }}>{progress}% Complete</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(245,240,232,0.4)" }}>Delivered</span>
              </div>
            </>
          )}
          {isCancelled && (
            <p className="mt-6 text-sm" style={{ fontFamily: "'DM Sans',sans-serif", color: "#ff8080" }}>
              {order.paymentStatus === "refunded"
                ? (order.timeline.find(t => t.status === "cancelled")?.note || "This order was cancelled and your payment has been refunded.")
                : "This order was cancelled."}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FadeIn><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: C.green, marginBottom: 20 }}>Shipment Timeline</h2></FadeIn>
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-px" style={{ backgroundColor: "rgba(201,168,76,0.2)" }} />
              <div className="space-y-0">
                {timeline.map((stage, i) => {
                  const Icon = STAGE_ICONS[i];
                  return (
                    <FadeIn key={stage.key} delay={i * 0.08}>
                      <div className={`flex items-start gap-4 pb-8 relative ${i === timeline.length - 1 ? "pb-0" : ""}`}>
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 + 0.3 }}
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                          style={{ backgroundColor: stage.done ? C.gold : stage.active ? C.green : "rgba(201,168,76,0.12)", border: `2px solid ${stage.done || stage.active ? C.gold : "rgba(201,168,76,0.25)"}` }}>
                          {stage.done ? <Check size={16} color={C.green} /> : <Icon size={16} color={stage.active ? C.gold : "rgba(201,168,76,0.4)"} />}
                        </motion.div>
                        <div className={`flex-1 pt-1.5 ${!stage.done && !stage.active ? "opacity-45" : ""}`}>
                          <div className="flex items-center gap-2">
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", fontWeight: stage.active ? 700 : 500, color: stage.done || stage.active ? C.green : C.muted }}>{stage.label}</p>
                            {stage.active && <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Current</span>}
                          </div>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: C.muted, marginTop: 2 }}>{stage.date}</p>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {order.courier && (
              <FadeIn>
                <div className="p-5" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", color: C.green, marginBottom: 12 }}>Courier Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "rgba(201,168,76,0.1)" }}><Truck size={18} color={C.gold} /></div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", fontWeight: 600, color: C.green }}>{order.courier}</p>
                      {order.tracking && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: C.muted }}>Tracking: {order.tracking}</p>}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <div className="p-5" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", color: C.green, marginBottom: 10 }}>Delivery Address</h3>
                <div className="flex items-start gap-2">
                  <MapPin size={14} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.muted, lineHeight: 1.65 }}>{order.address}<br />{order.city}, {order.province}</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="p-5" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", color: C.green, marginBottom: 12 }}>Order Summary</h3>
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between mb-2">
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.green }}>{item.name} ×{item.qty}</span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.green }}>Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-3" style={{ borderTop: `1px solid rgba(201,168,76,0.18)` }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 700, color: C.green }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 700, color: C.green }}>Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}