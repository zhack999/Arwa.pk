import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useStore, type User } from "../store";
import { C, LeafSVG, BrandLogo } from "../shared";
import {
  Eye, EyeOff, Check, X, Mail, Phone, Lock, User as UserIcon,
  ArrowRight, ChevronLeft, Chrome, Facebook,
} from "lucide-react";

// ─── Password strength ────────────────────────────────────────────────────────
function pwStrength(p: string) {
  let s = 0;
  if (p.length >= 8)           s++;
  if (/[A-Z]/.test(p))        s++;
  if (/[0-9]/.test(p))        s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#d4183d", "#f59e0b", "#22c55e", "#16a34a"];
  return { pct: s * 25, label: labels[s] || "", color: colors[s] || "" };
}

// ─── OTP boxes ────────────────────────────────────────────────────────────────
function OTPBoxes({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {
  const [vals, setVals] = useState(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    const next = [...vals];
    next[i] = c;
    setVals(next);
    if (c && i < length - 1) refs.current[i + 1]?.focus();
    const code = next.join("");
    if (code.length === length) onComplete?.(code);
  };

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {vals.map((v, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} value={v}
          onChange={e => handle(i, e.target.value)} onKeyDown={e => onKey(i, e)}
          maxLength={1} inputMode="numeric" className="w-11 h-12 text-center text-lg font-bold outline-none transition-all"
          style={{ border: `2px solid ${v ? C.gold : "rgba(201,168,76,0.3)"}`, backgroundColor: "rgba(255,255,255,0.06)", color: C.ivory, fontFamily: "'Playfair Display',serif" }} />
      ))}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
const gInput: React.CSSProperties = {
  width: "100%", padding: "11px 14px 11px 40px", fontSize: "0.9rem", outline: "none",
  backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,168,76,0.25)",
  color: C.ivory, fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.2s",
};

function Field({ icon: Icon, label, error, children }: { icon: any; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,168,76,0.8)", display: "block", marginBottom: 6 }}>{label}</label>
      <div className="relative">
        <Icon size={15} color="rgba(201,168,76,0.5)" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {children}
      </div>
      {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "#f87171", marginTop: 4 }}>{error}</motion.p>}
    </div>
  );
}

// ─── Social buttons ────────────────────────────────────────────────────────────
function SocialButtons() {
  return (
    <div>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(201,168,76,0.2)" }} />
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: "rgba(245,240,232,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>or continue with</span>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(201,168,76,0.2)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => toast.info("Google login coming soon!")} className="flex items-center justify-center gap-2 py-2.5 border hover:bg-white/5 transition-colors"
          style={{ borderColor: "rgba(201,168,76,0.25)", color: C.ivory, fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button onClick={() => toast.info("Facebook login coming soon!")} className="flex items-center justify-center gap-2 py-2.5 border hover:bg-white/5 transition-colors"
          style={{ borderColor: "rgba(201,168,76,0.25)", color: C.ivory, fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem" }}>
          <Facebook size={16} color="#1877F2" fill="#1877F2" /> Facebook
        </button>
      </div>
    </div>
  );
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────
export default function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isVerify = ["/auth/verify-email", "/auth/otp", "/auth/verify-phone"].some(p => location.pathname === p);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.green }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col items-center justify-center relative overflow-hidden p-12" style={{ backgroundColor: C.dark }}>
        <div className="sun absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 60% 30%, rgba(201,168,76,0.1) 0%, transparent 65%)` }} />
        <div className="leaf-1 absolute top-16 left-8 pointer-events-none"><LeafSVG size={60} color={C.gold} /></div>
        <div className="leaf-2 absolute bottom-24 right-8 pointer-events-none"><LeafSVG size={45} color={C.ivory} /></div>
        <div className="leaf-3 absolute top-1/2 left-4 pointer-events-none"><LeafSVG size={35} color={C.olive} /></div>

        <div className="relative z-10 text-center">
          <BrandLogo light />
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginTop: "2rem", lineHeight: 1.3 }}>
            Your Skin's<br /><span style={{ color: C.gold, fontStyle: "italic" }}>Luxury Journey</span><br />Starts Here.
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.55)", marginTop: "1rem", lineHeight: 1.7 }}>
            Join 500+ Pakistanis who trust Arwa Botaniqs for their daily botanical skincare ritual.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[{ n: "500+", l: "Happy Customers" }, { n: "4.9★", l: "Avg Rating" }, { n: "100%", l: "Botanical" }].map(s => (
              <div key={s.l} className="text-center p-3" style={{ backgroundColor: "rgba(201,168,76,0.08)", border: `1px solid rgba(201,168,76,0.15)` }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: C.gold }}>{s.n}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: "rgba(245,240,232,0.45)" }}>{s.l}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/")} className="mt-8 flex items-center gap-2 mx-auto hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(245,240,232,0.5)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            <ChevronLeft size={14} /> Back to home
          </button>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center"><BrandLogo light /><button onClick={() => navigate("/")} className="mt-4 text-xs hover:opacity-60" style={{ color: "rgba(245,240,232,0.4)", fontFamily: "'DM Sans',sans-serif" }}>← Back to home</button></div>
          <div className="p-8" style={{ backgroundColor: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,168,76,0.18)" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const { customerLogin } = useStore();
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) { setErr("Please fill all fields."); return; }
    setErr("");
    setLoading(true);
    try {
      await customerLogin(email, pass);
      navigate("/dashboard");
    } catch (error: any) {
      setErr(error.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Welcome Back</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>Sign in to your Arwa Botaniqs account.</p>

      <form onSubmit={handle} className="space-y-4">
        <Field icon={Mail} label="Email Address" error={err && !email ? "Required" : ""}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={gInput} />
        </Field>
        <Field icon={Lock} label="Password">
          <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
            style={{ ...gInput, paddingRight: 40 }} />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPass ? <EyeOff size={15} color="rgba(201,168,76,0.6)" /> : <Eye size={15} color="rgba(201,168,76,0.6)" />}
          </button>
        </Field>

        {err && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "#f87171" }}>{err}</p>}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="w-4 h-4 border flex items-center justify-center" style={{ borderColor: remember ? C.gold : "rgba(201,168,76,0.3)", backgroundColor: remember ? C.gold : "transparent" }} onClick={() => setRemember(!remember)}>
              {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(245,240,232,0.55)" }}>Remember me</span>
          </label>
          <button type="button" onClick={() => navigate("/auth/forgot")} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.gold }} className="hover:opacity-70">Forgot password?</button>
        </div>

        <button type="submit" disabled={loading} className="group w-full py-3.5 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity"
          style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : <><span>Sign In</span> <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></>}
        </button>
      </form>

      <SocialButtons />

      <p className="text-center mt-5" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.45)" }}>
        New customer?{" "}
        <button onClick={() => navigate("/auth/register")} style={{ color: C.gold }} className="hover:opacity-70">Create an account</button>
      </p>
    </div>
  );
}
// ─── Register ─────────────────────────────────────────────────────────────────
export function Register() {
  const navigate = useNavigate();
  const { customerRegister } = useStore();
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [pass,    setPass]    = useState("");
  const [conf,    setConf]    = useState("");
  const [showP,   setShowP]   = useState(false);
  const [terms,   setTerms]   = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = pwStrength(pass);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== conf) { toast.error("Passwords do not match"); return; }
    if (!terms) { toast.error("Please accept the terms"); return; }
    if (strength.pct < 50) { toast.error("Password too weak"); return; }
    setLoading(true);
    try {
      await customerRegister(name, email, phone, pass);
      navigate("/dashboard"); // real email verification isn't built yet, so we skip straight in
    } catch (error: any) {
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Create Account</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>Join the Arwa Botaniqs family today.</p>

      <form onSubmit={handle} className="space-y-4">
        <Field icon={UserIcon} label="Full Name">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ayesha Khan" style={gInput} required />
        </Field>
        <Field icon={Mail} label="Email Address">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={gInput} required />
        </Field>
        <Field icon={Phone} label="Phone Number">
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 3XX XXXXXXX" style={gInput} />
        </Field>
        <Field icon={Lock} label="Password">
          <input type={showP ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 8 characters" style={{ ...gInput, paddingRight: 40 }} required />
          <button type="button" onClick={() => setShowP(!showP)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showP ? <EyeOff size={15} color="rgba(201,168,76,0.6)" /> : <Eye size={15} color="rgba(201,168,76,0.6)" />}
          </button>
        </Field>

        {pass && (
          <div>
            <div className="flex gap-1 mb-1">
              {[25, 50, 75, 100].map(t => (
                <div key={t} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: strength.pct >= t ? strength.color : "rgba(201,168,76,0.15)" }} />
              ))}
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: strength.color }}>{strength.label}</p>
          </div>
        )}

        <Field icon={Lock} label="Confirm Password">
          <input type="password" value={conf} onChange={e => setConf(e.target.value)} placeholder="Re-enter password" style={{ ...gInput, paddingRight: 40 }} required />
          {conf && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {pass === conf ? <Check size={15} color="#22c55e" /> : <X size={15} color="#f87171" />}
            </span>
          )}
        </Field>

        <label className="flex items-start gap-2 cursor-pointer">
          <div className="w-4 h-4 border flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: terms ? C.gold : "rgba(201,168,76,0.3)", backgroundColor: terms ? C.gold : "transparent" }} onClick={() => setTerms(!terms)}>
            {terms && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(245,240,232,0.5)", lineHeight: 1.5 }}>
            I agree to the <span style={{ color: C.gold }}>Terms of Service</span> and <span style={{ color: C.gold }}>Privacy Policy</span>
          </span>
        </label>

        <button type="submit" disabled={loading} className="group w-full py-3.5 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2"
          style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Creating Account..." : <><span>Create Account</span> <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></>}
        </button>
      </form>

      <SocialButtons />
      <p className="text-center mt-5" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.45)" }}>
        Already have an account?{" "}
        <button onClick={() => navigate("/auth/login")} style={{ color: C.gold }} className="hover:opacity-70">Sign in</button>
      </p>
    </div>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Reset code sent to your email!");
  };

  return (
    <div>
      <button onClick={() => navigate("/auth/login")} className="flex items-center gap-1 mb-6 hover:opacity-60 transition-opacity" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(245,240,232,0.45)" }}>
        <ChevronLeft size={14} /> Back to login
      </button>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Forgot Password?</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>Enter your email and we will send you a reset code.</p>

      {sent ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(201,168,76,0.15)", border: `1px solid ${C.gold}` }}>
            <Mail size={24} color={C.gold} />
          </div>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: C.ivory, marginBottom: 8 }}>Check Your Email</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.55)", marginBottom: 20 }}>We sent a 6-digit OTP to <strong style={{ color: C.gold }}>{email}</strong></p>
          <button onClick={() => navigate("/auth/otp")} className="w-full py-3.5 text-sm uppercase tracking-widest"
            style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Enter OTP Code</button>
          <button onClick={() => setSent(false)} className="mt-3 text-xs hover:opacity-60" style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.35)" }}>Resend email</button>
        </div>
      ) : (
        <form onSubmit={handle} className="space-y-4">
          <Field icon={Mail} label="Email Address">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={gInput} required />
          </Field>
          <button type="submit" className="w-full py-3.5 text-sm font-medium uppercase tracking-widest"
            style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Send Reset Code</button>
        </form>
      )}
    </div>
  );
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export function ResetPassword() {
  const navigate = useNavigate();
  const [pass, setPass] = useState("");
  const [conf, setConf] = useState("");
  const [done, setDone] = useState(false);
  const strength = pwStrength(pass);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== conf) { toast.error("Passwords do not match"); return; }
    if (strength.pct < 50) { toast.error("Password too weak"); return; }
    setDone(true);
    toast.success("Password reset successfully!");
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Reset Password</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>Choose a strong new password for your account.</p>
      {done ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.gold }}>
            <Check size={24} color={C.green} />
          </div>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: C.ivory }}>Password Reset!</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginTop: 6 }}>Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handle} className="space-y-4">
          <Field icon={Lock} label="New Password">
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 8 characters" style={gInput} required />
          </Field>
          {pass && (
            <div><div className="flex gap-1 mb-1">{[25,50,75,100].map(t => <div key={t} className="flex-1 h-1" style={{ backgroundColor: strength.pct >= t ? strength.color : "rgba(201,168,76,0.15)" }} />)}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: strength.color }}>{strength.label}</p></div>
          )}
          <Field icon={Lock} label="Confirm New Password">
            <input type="password" value={conf} onChange={e => setConf(e.target.value)} placeholder="Re-enter password" style={{ ...gInput, paddingRight: 40 }} required />
            {conf && <span className="absolute right-3 top-1/2 -translate-y-1/2">{pass === conf ? <Check size={15} color="#22c55e" /> : <X size={15} color="#f87171" />}</span>}
          </Field>
          <button type="submit" className="w-full py-3.5 text-sm font-medium uppercase tracking-widest" style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Reset Password</button>
        </form>
      )}
    </div>
  );
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
export function VerifyEmail() {
  const navigate  = useNavigate();
  const { user }  = useStore();
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleComplete = (_: string) => {
    setTimeout(() => { setVerified(true); toast.success("Email verified! 🎉"); }, 600);
  };

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(201,168,76,0.15)", border: `1px solid ${C.gold}` }}>
        <Mail size={24} color={C.gold} />
      </div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Verify Your Email</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>
        We sent a 6-digit code to <strong style={{ color: C.gold }}>{user?.email || "your email"}</strong>
      </p>

      {verified ? (
        <div className="py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.gold }}>
            <Check size={22} color={C.green} />
          </div>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: C.ivory }}>Email Verified!</p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginTop: 6, marginBottom: 16 }}>Welcome to Arwa Botaniqs, {user?.name}!</p>
          <button onClick={() => navigate("/dashboard")} className="w-full py-3.5 text-sm uppercase tracking-widest" style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Go to Dashboard</button>
        </div>
      ) : (
        <div>
          <OTPBoxes onComplete={handleComplete} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(245,240,232,0.4)", marginTop: 16 }}>
            {countdown > 0 ? `Resend code in ${countdown}s` : (
              <button onClick={() => setCountdown(30)} style={{ color: C.gold }} className="hover:opacity-70">Resend code</button>
            )}
          </p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 text-xs hover:opacity-60" style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.35)" }}>Skip for now</button>
        </div>
      )}
    </div>
  );
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export function VerifyOTP() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center">
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Enter OTP</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>Enter the 6-digit code we sent to your email.</p>
      {done ? (
        <div className="py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.gold }}><Check size={22} color={C.green} /></div>
          <p style={{ fontFamily: "'Playfair Display',serif", color: C.ivory, fontSize: "1.1rem" }}>Verified!</p>
          <button onClick={() => navigate("/auth/reset")} className="w-full mt-5 py-3.5 text-sm uppercase tracking-widest" style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Set New Password</button>
        </div>
      ) : (
        <div>
          <OTPBoxes onComplete={() => setTimeout(() => setDone(true), 500)} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(245,240,232,0.4)", marginTop: 16 }}>
            {countdown > 0 ? `Resend in ${countdown}s` : <button onClick={() => setCountdown(30)} style={{ color: C.gold }}>Resend OTP</button>}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Verify Phone ─────────────────────────────────────────────────────────────
export function VerifyPhone() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(201,168,76,0.15)", border: `1px solid ${C.gold}` }}>
        <Phone size={24} color={C.gold} />
      </div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.ivory, marginBottom: 6 }}>Verify Phone</h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.5)", marginBottom: 24 }}>Enter the 6-digit code sent to your phone number.</p>
      {done ? (
        <div className="py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.gold }}><Check size={22} color={C.green} /></div>
          <p style={{ fontFamily: "'Playfair Display',serif", color: C.ivory, fontSize: "1.1rem" }}>Phone Verified!</p>
          <button onClick={() => navigate("/dashboard")} className="w-full mt-5 py-3.5 text-sm uppercase tracking-widest" style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>Continue</button>
        </div>
      ) : (
        <div>
          <OTPBoxes onComplete={() => setTimeout(() => setDone(true), 500)} />
          <button onClick={() => navigate("/dashboard")} className="mt-4 text-xs hover:opacity-60" style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.35)" }}>Skip for now</button>
        </div>
      )}
    </div>
  );
}
