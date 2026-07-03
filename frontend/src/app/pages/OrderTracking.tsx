import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { C, FadeIn, GoldLine } from "../shared";
import { Package, Truck, MapPin, Check, ChevronLeft, Download, Copy } from "lucide-react";

const ORDERS: Record<string, {
  id: string; date: string; status: string; tracking: string; courier: string;
  address: string; city: string; province: string;
  items: { name: string; qty: number; price: number }[];
  total: number; eta: string;
  timeline: { stage: string; label: string; date: string; done: boolean; active?: boolean }[];
}> = {
  "ARW-241567": {
    id: "ARW-241567", date: "July 1, 2026", status: "shipped",
    tracking: "TCS-2024-PKT-9821", courier: "TCS Courier",
    address: "House 45, Street 7, Gulberg III", city: "Lahore", province: "Punjab",
    items: [{ name: "Arwa Botaniqs Beauty Soap", qty: 2, price: 549 }],
    total: 1398, eta: "July 4–5, 2026",
    timeline: [
      { stage: "placed",   label: "Order Placed",      date: "July 1, 2026 – 10:30 AM", done: true },
      { stage: "confirmed", label: "Order Confirmed",  date: "July 1, 2026 – 11:00 AM", done: true },
      { stage: "packed",   label: "Packed & Ready",    date: "July 1, 2026 – 3:00 PM",  done: true },
      { stage: "shipped",  label: "Shipped",           date: "July 2, 2026 – 9:00 AM",  done: true, active: true },
      { stage: "delivery", label: "Out for Delivery",  date: "Estimated July 4, 2026",  done: false },
      { stage: "delivered", label: "Delivered",        date: "Estimated July 4–5, 2026", done: false },
    ],
  },
  "ARW-189034": {
    id: "ARW-189034", date: "June 15, 2026", status: "delivered",
    tracking: "TCS-2024-PKT-8234", courier: "TCS Courier",
    address: "DHA Phase 5, Block B", city: "Karachi", province: "Sindh",
    items: [{ name: "Arwa Botaniqs Beauty Soap", qty: 1, price: 549 }],
    total: 849, eta: "Delivered",
    timeline: [
      { stage: "placed",   label: "Order Placed",     date: "June 15, 2026 – 2:00 PM",  done: true },
      { stage: "confirmed", label: "Order Confirmed", date: "June 15, 2026 – 2:30 PM",  done: true },
      { stage: "packed",   label: "Packed & Ready",   date: "June 15, 2026 – 5:00 PM",  done: true },
      { stage: "shipped",  label: "Shipped",          date: "June 16, 2026 – 8:00 AM",  done: true },
      { stage: "delivery", label: "Out for Delivery", date: "June 17, 2026 – 9:00 AM",  done: true },
      { stage: "delivered", label: "Delivered",       date: "June 17, 2026 – 2:30 PM",  done: true, active: true },
    ],
  },
};

const STAGE_ICONS = [Package, Package, Package, Truck, Truck, Check];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();
  const order       = orderId ? ORDERS[orderId] : null;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
        <Package size={60} color="rgba(201,168,76,0.3)" className="mb-4" />
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", color: C.green, marginBottom: 8 }}>Order Not Found</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 20 }}>We couldn't find order <strong>{orderId}</strong></p>
        <button onClick={() => navigate("/dashboard/orders")} className="px-6 py-3 text-sm uppercase tracking-widest"
          style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>View All Orders</button>
      </div>
    );
  }

  const currentStage = order.timeline.findIndex(t => t.active) + 1;
  const progress = Math.round((order.timeline.filter(t => t.done).length / order.timeline.length) * 100);

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100vh" }}>
      {/* Header */}
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
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.55)", marginTop: 4 }}>Placed on {order.date} · ETA: {order.eta}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(order.tracking); toast.success("Tracking number copied!"); }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider border"
                style={{ borderColor: "rgba(201,168,76,0.35)", color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>
                <Copy size={12} /> {order.tracking}
              </button>
              <button onClick={() => toast.info("Invoice download coming soon!")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider"
                style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
                <Download size={12} /> Invoice
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1.5 overflow-hidden" style={{ backgroundColor: "rgba(245,240,232,0.1)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full" style={{ backgroundColor: C.gold }} />
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(245,240,232,0.4)" }}>Order Placed</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: C.gold }}>{progress}% Complete</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(245,240,232,0.4)" }}>Delivered</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <FadeIn>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: C.green, marginBottom: 20 }}>Shipment Timeline</h2>
            </FadeIn>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-5 top-5 bottom-5 w-px" style={{ backgroundColor: "rgba(201,168,76,0.2)" }} />

              <div className="space-y-0">
                {order.timeline.map((stage, i) => {
                  const Icon = STAGE_ICONS[i];
                  return (
                    <FadeIn key={stage.stage} delay={i * 0.08}>
                      <div className={`flex items-start gap-4 pb-8 relative ${i === order.timeline.length - 1 ? "pb-0" : ""}`}>
                        {/* Node */}
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 + 0.3 }}
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                          style={{ backgroundColor: stage.done ? C.gold : stage.active ? C.green : "rgba(201,168,76,0.12)", border: `2px solid ${stage.done || stage.active ? C.gold : "rgba(201,168,76,0.25)"}` }}>
                          {stage.done ? <Check size={16} color={C.green} /> : <Icon size={16} color={stage.active ? C.gold : "rgba(201,168,76,0.4)"} />}
                        </motion.div>

                        {/* Content */}
                        <div className={`flex-1 pt-1.5 ${!stage.done && !stage.active ? "opacity-45" : ""}`}>
                          <div className="flex items-center gap-2">
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", fontWeight: stage.active ? 700 : 500, color: stage.done || stage.active ? C.green : C.muted }}>
                              {stage.label}
                            </p>
                            {stage.active && (
                              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Current</span>
                            )}
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

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Courier info */}
            <FadeIn>
              <div className="p-5" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", color: C.green, marginBottom: 12 }}>Courier Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "rgba(201,168,76,0.1)" }}>
                    <Truck size={18} color={C.gold} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", fontWeight: 600, color: C.green }}>{order.courier}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: C.muted }}>Tracking: {order.tracking}</p>
                  </div>
                </div>
                <button onClick={() => toast.info("External courier tracking opening soon!")} className="w-full py-2 text-xs uppercase tracking-widest border hover:border-[#c9a84c] transition-colors"
                  style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
                  Track on TCS Website
                </button>
              </div>
            </FadeIn>

            {/* Delivery address */}
            <FadeIn delay={0.1}>
              <div className="p-5" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", color: C.green, marginBottom: 10 }}>Delivery Address</h3>
                <div className="flex items-start gap-2">
                  <MapPin size={14} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.muted, lineHeight: 1.65 }}>
                    {order.address}<br />{order.city}, {order.province}
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Order summary */}
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
