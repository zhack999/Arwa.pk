import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import productImg from "@/imports/WhatsApp_Image_2026-07-02_at_11.47.16_PM.jpeg";
import logoImg from "@/imports/WhatsApp_Image_2026-07-02_at_11.46.54_PM.jpeg";
import { C, FadeIn, SectionHeading, SectionTag, GoldLine, LeafSVG } from "../shared";
import { useState } from "react";
import {
  Leaf, Heart, Sparkles, Package, Award, ShieldCheck, ChevronDown, ArrowRight,
} from "lucide-react";

const MISSION_PILLARS = [
  { icon: Leaf, title: "100% Botanical", desc: "Every formula is built from real plant extracts — nothing synthetic pretending to be natural." },
  { icon: Heart, title: "Gentle by Design", desc: "Safe for every skin type, from sensitive to oily, because kindness to skin was the whole point." },
  { icon: Sparkles, title: "Visible Results", desc: "Skincare that doesn't just feel luxurious — it actually changes your skin, use after use." },
];

const PHILOSOPHY = [
  { name: "Neem", desc: "Purifies and clears blemish-prone skin" },
  { name: "Aloe Vera", desc: "Soothes, hydrates, and calms irritation" },
  { name: "Tea Tree", desc: "Naturally antibacterial, keeps skin balanced" },
  { name: "Rose Extract", desc: "Restores glow and evens out skin tone" },
];

const WHY_ARWA = [
  "Zero parabens, sulphates, or synthetic fragrance",
  "Handcrafted in small batches for quality control",
  "Cruelty-free — never tested on animals",
  "Dermatologically safe for daily use",
  "Proudly made in Faisalabad, Pakistan",
  "Loved by thousands of happy customers nationwide",
];

const TIMELINE = [
  { year: "2023", title: "The Idea", desc: "Founder Arwa began formulating soap in her own kitchen after struggling to find a gentle, honest, botanical option for her own skin." },
  { year: "2024", title: "First Batch", desc: "The very first Arwa Botaniqs Beauty Soap batch was handcrafted and gifted to friends and family for feedback." },
  { year: "2025", title: "Going Public", desc: "Arwa Botaniqs officially launched online, bringing botanical luxury skincare to homes across Pakistan." },
  { year: "2026", title: "Growing the Family", desc: "Thousands of customers later, Arwa Botaniqs continues to grow — one honest, botanical product at a time." },
];

const CERTIFICATIONS = [
  { icon: ShieldCheck, label: "Dermatologically Tested" },
  { icon: Leaf, label: "100% Natural Ingredients" },
  { icon: Award, label: "Cruelty-Free Certified" },
  { icon: Package, label: "Eco-Conscious Packaging" },
];

const ABOUT_FAQS = [
  { q: "Where is Arwa Botaniqs made?", a: "Every product is handcrafted in small batches in Faisalabad, Pakistan, with close attention to quality at every step." },
  { q: "Is Arwa Botaniqs cruelty-free?", a: "Yes — we never test on animals, at any stage of formulation or production." },
  { q: "What makes your packaging different?", a: "We use minimal, recyclable packaging designed to protect the product without unnecessary plastic waste." },
  { q: "How can I contact the founder or team?", a: "You can reach us anytime through our Support page or social channels linked in the footer — we personally read every message." },
];

function AboutFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid rgba(201,168,76,0.22)`, backgroundColor: C.cream }}>
      <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpen(!open)}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.93rem", fontWeight: 500, color: C.green, paddingRight: 16 }}>{q}</span>
        <span className="flex-shrink-0 transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <ChevronDown size={17} color={C.gold} />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#4a5a4a", lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ backgroundColor: C.green }}>
        <div className="absolute top-10 left-6 pointer-events-none"><LeafSVG size={60} color={C.gold} style={{ opacity: 0.15 }} /></div>
        <div className="absolute bottom-10 right-10 pointer-events-none"><LeafSVG size={80} color={C.ivory} style={{ opacity: 0.08 }} /></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <SectionTag text="Our World" />
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 700, color: C.ivory, lineHeight: 1.15 }}>
              The Story Behind <span style={{ fontStyle: "italic", color: C.gold }}>Arwa Botaniqs</span>
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.75)", fontSize: "1rem", marginTop: "1.25rem", lineHeight: 1.8, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
              A small, honest botanical soap brand built on one belief: nature already perfected skincare — we just had to listen.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 1. Our Story ── */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: C.cream }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <SectionTag text="Our Story" />
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.9rem,4vw,2.9rem)", fontWeight: 700, color: C.green, lineHeight: 1.18 }}>
                  Rooted in Nature,<br /><span style={{ fontStyle: "italic", color: C.olive }}>Made for You.</span>
                </h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#4a5a4a", lineHeight: 1.88, fontSize: "0.96rem", marginTop: "1.5rem" }}>
                  Arwa Botaniqs was born from a simple belief — that the most powerful skincare ingredients are the ones nature has been perfecting for thousands of years. We are a Faisalabad-based botanical beauty brand committed to creating products as gentle on your skin as they are on the planet.
                </p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#4a5a4a", lineHeight: 1.88, fontSize: "0.96rem", marginTop: "1rem" }}>
                  Every Arwa Botaniqs Beauty Soap bar is handcrafted with 100% botanical extracts — no harmful parabens, no sulphates, no compromises.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="relative" style={{ aspectRatio: "1/1" }}>
                <ImageWithFallback src={productImg} alt="Arwa Botaniqs Beauty Soap" className="w-full h-full object-cover" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 2. Mission ── */}
      <section className="relative py-24" style={{ backgroundColor: C.ivory }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading tag="Our Mission" title="Skincare Without Compromise" sub="Three principles guide everything we make." /></FadeIn>
          <div className="grid md:grid-cols-3 gap-8 mt-4">
            {MISSION_PILLARS.map((m, i) => (
              <FadeIn key={m.title} delay={i * 0.1}>
                <div className="p-8 text-center h-full" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(201,168,76,0.12)" }}>
                    <m.icon size={24} color={C.gold} />
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 700, color: C.green }}>{m.title}</h3>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#4a5a4a", marginTop: "0.6rem", lineHeight: 1.7 }}>{m.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Botanical Philosophy ── */}
      <section className="relative py-24" style={{ backgroundColor: C.cream }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading tag="Botanical Philosophy" title="From Nature's Laboratory" sub="Every ingredient is chosen for a reason, never for a trend." /></FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {PHILOSOPHY.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <div className="p-6 text-center h-full" style={{ backgroundColor: C.ivory, border: `1px solid rgba(201,168,76,0.2)` }}>
                  <div className="text-3xl mb-2">🌿</div>
                  <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 700, color: C.green }}>{p.name}</h4>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "#4a5a4a", marginTop: "0.4rem", lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Founder Story ── */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: C.green }}>
        <div className="absolute top-1/2 left-10 -translate-y-1/2 pointer-events-none"><LeafSVG size={70} color={C.ivory} style={{ opacity: 0.06 }} /></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <SectionTag text="Founder Story" />
            <GoldLine />
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "clamp(1.2rem,2.6vw,1.6rem)", color: C.ivory, lineHeight: 1.6, marginTop: "1rem" }}>
              "I started making this soap in my own kitchen because I couldn't find anything gentle enough for my own skin. Arwa Botaniqs is what happens when you refuse to compromise on what you put on your body."
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: C.gold, marginTop: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              — Arwa, Founder
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 5. Why Choose Arwa ── */}
      <section className="relative py-24" style={{ backgroundColor: C.ivory }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading tag="Why Choose Arwa" title="What Sets Us Apart" sub="Small brand, big standards." /></FadeIn>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {WHY_ARWA.map((w, i) => (
              <FadeIn key={w} delay={i * 0.05}>
                <div className="flex items-start gap-3 p-4" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.18)` }}>
                  <Sparkles size={16} color={C.gold} className="flex-shrink-0 mt-0.5" />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#3a4a3a" }}>{w}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Luxury Packaging ── */}
      <section className="relative py-24" style={{ backgroundColor: C.cream }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative" style={{ aspectRatio: "1/1" }}>
                <ImageWithFallback src={logoImg} alt="Arwa Botaniqs luxury packaging" className="w-full h-full object-cover" />
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div>
                <SectionTag text="Luxury Packaging" />
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.6vw,2.6rem)", fontWeight: 700, color: C.green, lineHeight: 1.2 }}>
                  Beautiful on the Outside, Honest on the Inside
                </h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#4a5a4a", lineHeight: 1.85, fontSize: "0.95rem", marginTop: "1.25rem" }}>
                  Every bar is wrapped in minimal, recyclable packaging designed to feel premium in your hands without costing the planet. No unnecessary plastic — just clean, considered design that reflects what's inside.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 7. Timeline ── */}
      <section className="relative py-24" style={{ backgroundColor: C.ivory }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading tag="Our Journey" title="How We Got Here" sub="A young brand, growing one honest batch at a time." /></FadeIn>
          <div className="mt-8 space-y-0">
            {TIMELINE.map((t, i) => (
              <FadeIn key={t.year} delay={i * 0.1}>
                <div className="flex gap-6 pb-10 relative">
                  {i < TIMELINE.length - 1 && (
                    <div className="absolute left-[27px] top-10 bottom-0 w-px" style={{ backgroundColor: "rgba(201,168,76,0.3)" }} />
                  )}
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: C.green, color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>
                    {t.year}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 700, color: C.green }}>{t.title}</h4>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#4a5a4a", marginTop: "0.4rem", lineHeight: 1.7 }}>{t.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Certifications ── */}
      <section className="relative py-24" style={{ backgroundColor: C.green }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading tag="Certifications" title="Standards We Stand Behind" sub="" light /></FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {CERTIFICATIONS.map((c, i) => (
              <FadeIn key={c.label} delay={i * 0.08}>
                <div className="p-6 text-center h-full flex flex-col items-center gap-3" style={{ backgroundColor: "rgba(245,240,232,0.06)", border: `1px solid rgba(201,168,76,0.2)` }}>
                  <c.icon size={26} color={C.gold} />
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.ivory, letterSpacing: "0.04em" }}>{c.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="relative py-24" style={{ backgroundColor: C.ivory }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn><SectionHeading tag="FAQ" title="About Arwa Botaniqs" sub="Common questions about who we are and how we work." /></FadeIn>
          <div className="space-y-3 mt-4">
            {ABOUT_FAQS.map((f, i) => (
              <FadeIn key={f.q} delay={i * 0.05}><AboutFAQItem q={f.q} a={f.a} /></FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 text-center" style={{ backgroundColor: C.cream }}>
        <FadeIn>
          <button onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-2 px-8 py-3.5 group"
            style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Shop the Beauty Soap
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeIn>
      </section>
    </div>
  );
}