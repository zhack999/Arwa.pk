import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { C } from "../shared";
import { XCircle, RotateCcw, ShoppingCart } from "lucide-react";

export default function OrderCancel() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderNumber = params.get("order_number");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20" style={{ backgroundColor: C.ivory }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(212,24,61,0.1)" }}>
          <XCircle size={40} color="#d4183d" />
        </div>

        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2rem", fontWeight: 700, color: C.green, marginBottom: 8 }}>
          Payment Cancelled
        </h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 8, lineHeight: 1.7, maxWidth: 440 }}>
          Your payment was cancelled and no charge was made. Your order hasn't been placed yet, and your cart is still exactly as you left it.
        </p>
        {orderNumber && (
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.muted, marginBottom: 28 }}>
            Reference: <span style={{ color: C.green }}>{orderNumber}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button onClick={() => navigate("/cart")} className="group flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-widest border hover:bg-black/5 transition-colors"
            style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
            <ShoppingCart size={15} /> Back to Cart
          </button>
          <button onClick={() => navigate("/checkout")} className="group flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-widest"
            style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
            <RotateCcw size={15} /> Retry Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
}
