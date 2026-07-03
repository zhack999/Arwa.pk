import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import productImg from "@/imports/WhatsApp_Image_2026-07-02_at_11.47.16_PM.jpeg";
import logoImg from "@/imports/WhatsApp_Image_2026-07-02_at_11.46.54_PM.jpeg";
import { useStore } from "../store";
import { PRODUCTS, REVIEWS } from "../data";
import { C, FadeIn, SectionHeading, SectionTag, GoldLine, LeafSVG, StarRating } from "../shared";
import {
  Leaf, Star, ShoppingCart, ArrowRight, ChevronDown, Truck,
  RotateCcw, Shield, Heart, Sun, Droplets, Sparkles, Check,
  Award, Users, Clock,
} from "lucide-react";

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: C.green }}>
      <div className="sun absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 65% 28%, rgba(201,168,76,0.13) 0%, transparent 62%)` }} />
      <div className="sun absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 28% 72%, rgba(74,103,65,0.45) 0%, transparent 55%)`, animationDelay: "2s" }} />

      <div className="leaf-1 absolute top-24 left-6 pointer-events-none"><LeafSVG size={52} color={C.gold} /></div>
      <div className="leaf-2 absolute top-36 right-10 pointer-events-none"><LeafSVG size={38} color={C.ivory} /></div>
      <div className="leaf-3 absolute bottom-44 left-14 pointer-events-none"><LeafSVG size={46} color={C.olive} style={{ opacity: 0.3 }} /></div>
      <div className="leaf-4 absolute top-1/2 right-6 pointer-events-none"><LeafSVG size={62} color={C.gold} style={{ opacity: 0.18 }} /></div>
      <div className="leaf-5 absolute bottom-24 right-20 pointer-events-none"><LeafSVG size={32} color={C.ivory} /></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex items-center justify-center gap-3 mb-8">
          <GoldLine />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.42em", color: C.gold, textTransform: "uppercase" }}>Premium Botanical Beauty · Pakistan</span>
          <GoldLine />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
          style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2.6rem,7vw,5.5rem)", fontWeight: 700, color: C.ivory, lineHeight: 1.08 }}>
          Naturally Beautiful,<br />
          <span style={{ color: C.gold, fontStyle: "italic" }}>Inside &amp; Out</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.72 }}
          style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.08rem", color: "rgba(245,240,232,0.72)", lineHeight: 1.78, maxWidth: 520, margin: "1.5rem auto 0" }}>
          Crafted from 100% botanical extracts — a luxury beauty soap that cleanses, brightens, and nourishes every skin type. From the heart of nature.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.96 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button onClick={() => navigate("/shop")}
            className="group relative overflow-hidden px-9 py-4 text-sm font-medium"
            style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.16em", textTransform: "uppercase", minWidth: 210 }}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Shop Now <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-300" style={{ backgroundColor: "#b8962e" }} />
          </button>
          <button onClick={() => navigate("/shop")}
            className="px-9 py-4 text-sm font-medium border transition-all hover:bg-white/10"
            style={{ borderColor: "rgba(245,240,232,0.35)", color: C.ivory, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.16em", textTransform: "uppercase", minWidth: 210 }}>
            Explore Collection
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="bounce flex flex-col items-center gap-1 mt-16">
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", letterSpacing: "0.35em", color: `rgba(201,168,76,0.65)`, textTransform: "uppercase" }}>Scroll</span>
          <ChevronDown size={15} color={`rgba(201,168,76,0.65)`} />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Product ─────────────────────────────────────────────────────────
function FeaturedProduct() {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const navigate = useNavigate();
  const product = PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const inWishlist = wishlist.has(product.id);

  return (
    <section className="py-24 overflow-hidden" style={{ backgroundColor: C.ivory }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn><SectionHeading tag="Featured Product" title="The Beauty Soap" sub="Our hero product — a luxurious botanical soap crafted to cleanse, brighten, and nourish your skin naturally." /></FadeIn>

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center mt-4">
          <FadeIn delay={0.1}>
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 w-16 h-16 rounded-full flex flex-col items-center justify-center" style={{ backgroundColor: C.gold }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 700, color: C.green, lineHeight: 1 }}>45%</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: C.green }}>OFF</span>
              </div>
              <div className="overflow-hidden cursor-pointer" style={{ aspectRatio: "4/5" }} onClick={() => navigate(`/products/${product.slug}`)}>
                <ImageWithFallback src={productImg} alt="Arwa Botaniqs Beauty Soap surrounded by botanical flowers and leaves" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute -right-3 sm:right-0 bottom-10 p-4" style={{ backgroundColor: C.green, minWidth: 150 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", letterSpacing: "0.28em", color: C.gold, textTransform: "uppercase", marginBottom: 2 }}>100% Botanical</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.ivory }}>No Harmful Chemicals</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.28em", textTransform: "uppercase", backgroundColor: "rgba(201,168,76,0.14)", color: C.gold, padding: "4px 12px" }}>Premium Beauty Soap</span>
              <h2 className="mt-5 mb-1" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 700, color: C.green, lineHeight: 1.15, cursor: "pointer" }} onClick={() => navigate(`/products/${product.slug}`)}>
                {product.name}<br /><span style={{ fontStyle: "italic", color: C.olive }}>{product.subtitle}</span>
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.muted, letterSpacing: "0.08em" }}>Weight: {product.weight} · For All Skin Types</p>
              <div className="flex items-center gap-1 mt-3 mb-6">
                <StarRating rating={product.rating} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.muted, marginLeft: 6 }}>({product.reviewCount} Reviews)</span>
              </div>
              <div className="flex items-baseline gap-4 mb-5">
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.6rem", fontWeight: 700, color: C.green }}>Rs. {product.price.toLocaleString()}</span>
                <span className="line-through" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.2rem", color: "#aabba9" }}>Rs. {product.oldPrice.toLocaleString()}</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 600, backgroundColor: C.gold, color: C.green, padding: "2px 8px" }}>Save Rs. 451</span>
              </div>
              <p className="mb-7" style={{ fontFamily: "'DM Sans',sans-serif", color: "#4a5a4a", lineHeight: 1.84, fontSize: "0.95rem" }}>
                {product.description.slice(0, 200)}...
              </p>
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {product.benefits.slice(0, 6).map(b => (
                  <div key={b} className="flex items-center gap-2">
                    <Check size={13} color={C.gold} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "#4a5a4a" }}>{b}</span>
                  </div>
                ))}
              </div>

              {/* Quantity + Buttons */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border" style={{ borderColor: "rgba(26,61,43,0.3)" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"><span style={{ fontSize: "1.2rem", color: C.green }}>−</span></button>
                  <span className="w-10 text-center" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", color: C.green, fontWeight: 600 }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"><span style={{ fontSize: "1.2rem", color: C.green }}>+</span></button>
                </div>
                <button onClick={() => toggleWishlist(product)} className="w-10 h-10 flex items-center justify-center border hover:border-[#c9a84c] transition-colors"
                  style={{ borderColor: "rgba(26,61,43,0.3)" }} aria-label="Wishlist">
                  <Heart size={18} fill={inWishlist ? C.gold : "none"} color={inWishlist ? C.gold : C.green} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate("/checkout")}
                  className="group flex-1 py-4 text-sm font-medium relative overflow-hidden"
                  style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  <span className="relative z-10">Buy Now</span>
                  <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-300" style={{ backgroundColor: C.gold }} />
                  <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: C.green }}>Buy Now</span>
                </button>
                <button onClick={() => addToCart(product, qty)}
                  className="flex-1 py-4 text-sm font-medium border flex items-center justify-center gap-2 hover:bg-[rgba(26,61,43,0.05)] transition-colors"
                  style={{ borderColor: C.green, color: C.green, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  <ShoppingCart size={15} /> Add to Cart
                </button>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-6" style={{ borderTop: `1px solid rgba(26,61,43,0.1)` }}>
                <div className="flex items-center gap-2"><Truck size={14} color={C.muted} /><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: C.muted }}>Delivery 2–4 Days · Rs. 300</span></div>
                <div className="flex items-center gap-2"><RotateCcw size={14} color={C.muted} /><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: C.muted }}>2-Day Returns</span></div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Arwa ──────────────────────────────────────────────────────────
const BENEFITS = [
  { Icon: Leaf,     title: "Natural Ingredients",  desc: "Sourced from nature's purest botanical extracts — zero synthetic additives, ever." },
  { Icon: Shield,   title: "Acne Control",          desc: "Neem and Tea Tree actively neutralise acne-causing bacteria for clearer skin." },
  { Icon: Sparkles, title: "Skin Brightening",      desc: "Vitamin E and Aloe Vera restore natural radiance and even your skin tone." },
  { Icon: Droplets, title: "Oil Control",           desc: "Balances sebum production for a matte, fresh finish all day long." },
  { Icon: Sun,      title: "Deep Cleansing",        desc: "Activated Charcoal draws out deep-seated impurities from your pores." },
  { Icon: Heart,    title: "Hydration",             desc: "Honey and Olive Extract lock in lasting moisture for soft, supple skin." },
  { Icon: Star,     title: "Baby Friendly",         desc: "Gentle enough for the most delicate skin — trusted by families across Pakistan." },
  { Icon: Users,    title: "Sensitive Skin",        desc: "Paraben-free and sulphate-free — safe for reactive skin types." },
];

function WhyChooseArwa() {
  return (
    <section className="py-24" style={{ backgroundColor: C.green }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn><SectionHeading tag="Why Arwa" title="Crafted for Every Skin Story" sub="Eight reasons why thousands of Pakistanis have made Arwa Botaniqs their daily skincare ritual." light /></FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map(({ Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.05}>
              <div className="group p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-default"
                style={{ backgroundColor: "rgba(245,240,232,0.05)", border: "1px solid rgba(201,168,76,0.14)" }}>
                <div className="w-11 h-11 flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: "rgba(201,168,76,0.13)" }}>
                  <Icon size={20} color={C.gold} />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 600, color: C.ivory, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem", color: "rgba(245,240,232,0.55)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ingredient Showcase ──────────────────────────────────────────────────────
function IngredientShowcase() {
  const product = PRODUCTS[0];
  return (
    <section className="py-24" style={{ backgroundColor: C.ivory }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn><SectionHeading tag="Key Ingredients" title="From Nature's Laboratory" sub="Every ingredient carefully selected from the world's finest botanical sources, working in harmony with your skin." /></FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.ingredients.map(({ name, emoji, desc }, i) => (
            <FadeIn key={name} delay={i * 0.06}>
              <div className="group p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default"
                style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                <div className="text-3xl mb-3">{emoji}</div>
                <div style={{ height: 1, width: 28, backgroundColor: C.gold, margin: "0 auto 12px" }} />
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", fontWeight: 600, color: C.green, marginBottom: 4 }}>{name}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: C.muted, lineHeight: 1.65 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Benefits Timeline ────────────────────────────────────────────────────────
const TIMELINE = [
  { when: "Day 1",    Icon: Sparkles, title: "Immediate Freshness",    desc: "Your skin feels instantly clean, soft, and deeply refreshed from the very first use." },
  { when: "Week 1",   Icon: Droplets, title: "Pores Visibly Cleaner",  desc: "Activated Charcoal and Tea Tree draw out impurities — pores look noticeably tighter." },
  { when: "Week 2",   Icon: Shield,   title: "Acne Begins to Fade",    desc: "Neem and Tea Tree's antibacterial action visibly reduces breakouts and redness." },
  { when: "Week 3",   Icon: Sun,      title: "Skin Tone Brightens",    desc: "Vitamin E and Aloe Vera work to even your complexion and restore natural radiance." },
  { when: "Month 1",  Icon: Award,    title: "Transformative Glow",    desc: "Consistent use delivers a clear, bright, hydrated complexion you will love every day." },
];

function BenefitsTimeline() {
  return (
    <section className="py-24" style={{ backgroundColor: C.green }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn><SectionHeading tag="Your Skin Journey" title="Results You Can See" sub="A transparent timeline of what to expect when you make Arwa Botaniqs part of your daily ritual." light /></FadeIn>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px hidden md:block" style={{ backgroundColor: "rgba(201,168,76,0.25)" }} />
          <div className="space-y-12">
            {TIMELINE.map(({ when, Icon, title, desc }, i) => {
              const isLeft = i % 2 === 0;
              return (
                <FadeIn key={when} delay={i * 0.1}>
                  <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 ${isLeft ? "" : "md:flex-row-reverse"}`}>
                    <div className={`md:w-[calc(50%-28px)] ${isLeft ? "md:text-right md:pr-8" : "md:pl-8"}`}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", letterSpacing: "0.28em", textTransform: "uppercase", backgroundColor: "rgba(201,168,76,0.14)", color: C.gold, padding: "3px 10px", display: "inline-block", marginBottom: 6 }}>{when}</span>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 600, color: C.ivory }}>{title}</h3>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.58)", lineHeight: 1.72, marginTop: 4 }}>{desc}</p>
                    </div>
                    <div className="hidden md:flex w-14 justify-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C.gold, boxShadow: `0 0 0 5px rgba(201,168,76,0.18)` }}>
                        <Icon size={17} color={C.green} />
                      </div>
                    </div>
                    <div className="hidden md:block md:w-[calc(50%-28px)]" />
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Customer Reviews ─────────────────────────────────────────────────────────
function CustomerReviews() {
  return (
    <section className="py-24" style={{ backgroundColor: C.ivory }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn><SectionHeading tag="Customer Stories" title="Loved Across Pakistan" sub="Real stories from real customers who have discovered the difference that botanical luxury makes." /></FadeIn>
        <div className="flex flex-wrap justify-center gap-12 mb-14">
          {[{ n: "500+", l: "Happy Customers" }, { n: "4.9★", l: "Average Rating" }, { n: "100%", l: "Botanical Extracts" }].map(s => (
            <FadeIn key={s.l} className="text-center">
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.4rem", fontWeight: 700, color: C.green }}>{s.n}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: C.muted }}>{s.l}</div>
            </FadeIn>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map(({ id, name, city, rating, title, text, date, verified }, i) => (
            <FadeIn key={id} delay={i * 0.08}>
              <div className="p-6 flex flex-col h-full" style={{ backgroundColor: C.cream, border: `1px solid rgba(201,168,76,0.2)` }}>
                <StarRating rating={rating} size={13} />
                <p className="mt-2 mb-1 font-semibold" style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.9rem", color: C.green }}>{title}</p>
                <p className="flex-1 mb-4" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "#4a5a4a", lineHeight: 1.75, fontStyle: "italic" }}>"{text}"</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid rgba(26,61,43,0.08)` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.green, color: C.gold, fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "0.9rem" }}>{name[0]}</div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", fontWeight: 600, color: C.green }}>{name}</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: C.muted }}>{city} · {verified && "✓ Verified"}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Brand Story ──────────────────────────────────────────────────────────────
function BrandStory() {
  return (
    <section id="brand-story" className="py-24 overflow-hidden" style={{ backgroundColor: C.cream }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#4a5a4a", lineHeight: 1.88, fontSize: "0.96rem", marginTop: "1rem", marginBottom: "2rem" }}>
                Every Arwa Botaniqs product is crafted with 100% botanical extracts — no harmful parabens, no sulphates, no compromises. We believe everyone deserves luxury skincare that actually works, made with integrity and love.
              </p>
              <div className="flex flex-wrap gap-8">
                {[{ n: "100%", l: "Natural Extracts" }, { n: "Zero", l: "Harmful Chemicals" }, { n: "24/7", l: "Customer Support" }].map(s => (
                  <div key={s.l} className="text-center">
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.8rem", fontWeight: 700, color: C.green }}>{s.n}</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="relative">
              <div className="overflow-hidden" style={{ aspectRatio: "1/1" }}>
                <ImageWithFallback src={logoImg} alt="Arwa Botaniqs brand identity" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 py-4 text-center" style={{ backgroundColor: "rgba(26,61,43,0.88)" }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", letterSpacing: "0.38em", textTransform: "uppercase", color: C.gold }}>Nature. Purity. You.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is Arwa Botaniqs soap suitable for all skin types?", a: "Yes! Our Beauty Soap is formulated to work harmoniously with all skin types — oily, dry, combination, sensitive, and even baby skin. The botanical ingredients naturally adapt to your skin's unique needs." },
  { q: "How often should I use the soap?", a: "For best results, use twice daily — morning and evening. You can adjust frequency based on how your skin responds." },
  { q: "Are there any harmful chemicals in the formula?", a: "Absolutely not. Our soap contains zero parabens, sulphates, synthetic fragrances, or harmful preservatives. Every ingredient is 100% botanical and nature-derived." },
  { q: "How long before I see visible results?", a: "Many customers notice fresher skin from the very first use. Visible improvements in acne and skin tone typically appear within 2–3 weeks of consistent daily use." },
  { q: "What payment methods do you accept?", a: "We accept JazzCash, EasyPaisa, Cash on Delivery (COD), Visa, Mastercard, and all major debit and credit cards." },
  { q: "What is your return policy?", a: "We offer a 2-day return policy from the date of delivery. Contact us within 2 days for a hassle-free return." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24" style={{ backgroundColor: C.ivory }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn><SectionHeading tag="FAQ" title="Frequently Asked Questions" sub="Everything you need to know about Arwa Botaniqs Beauty Soap and our service." /></FadeIn>
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ border: `1px solid rgba(201,168,76,0.22)`, backgroundColor: C.cream }}>
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.93rem", fontWeight: 500, color: C.green, paddingRight: 16 }}>{q}</span>
                  <span className="flex-shrink-0 transition-transform duration-300" style={{ transform: open === i ? "rotate(180deg)" : "none" }}>
                    <ChevronDown size={17} color={C.gold} />
                  </span>
                </button>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.28 }} style={{ overflow: "hidden" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", color: "#4a5a4a", lineHeight: 1.82, padding: "0 20px 20px" }}>{a}</p>
                  </motion.div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (email) { setDone(true); setEmail(""); } };

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: C.green }}>
      <div className="leaf-1 absolute top-8 left-6 pointer-events-none"><LeafSVG size={58} color={C.gold} /></div>
      <div className="leaf-3 absolute bottom-10 right-10 pointer-events-none"><LeafSVG size={76} color={C.ivory} /></div>
      <div className="relative z-10 max-w-xl mx-auto px-4 text-center">
        <FadeIn>
          <SectionTag text="Stay Connected" />
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.9rem,4vw,2.6rem)", fontWeight: 700, color: C.ivory, lineHeight: 1.2 }}>Join the Arwa Botaniqs Circle</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.65)", lineHeight: 1.78, marginTop: "1rem", marginBottom: "2.5rem" }}>
            Subscribe for exclusive offers, botanist skincare tips, and first access to new launches.
          </p>
          {done ? (
            <div className="py-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: C.gold }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", color: C.ivory }}>Thank you for subscribing!</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex max-w-md mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required
                className="flex-1 px-5 py-4 text-sm outline-none"
                style={{ backgroundColor: "rgba(245,240,232,0.09)", border: `1px solid rgba(201,168,76,0.28)`, borderRight: "none", color: C.ivory, fontFamily: "'DM Sans',sans-serif" }} />
              <button type="submit" className="px-6 py-4 text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
                Subscribe
              </button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProduct />
      <WhyChooseArwa />
      <IngredientShowcase />
      <BenefitsTimeline />
      <CustomerReviews />
      <BrandStory />
      <FAQ />
      <Newsletter />
    </>
  );
}
