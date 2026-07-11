import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store";
import { C, LeafSVG, BrandLogo } from "../shared";
import type { Product } from "../data";
import { ChevronLeft, ChevronRight, Check, ShoppingCart, RotateCcw, Sparkles } from "lucide-react";

// ─── Quiz data ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "skin-type",
    question: "What is your skin type?",
    sub: "Choose the option that best describes your skin on a normal day.",
    options: [
      { value: "normal",      label: "Normal",      emoji: "😊", desc: "Balanced — not too oily or dry" },
      { value: "oily",        label: "Oily",         emoji: "✨", desc: "Shiny, prone to blackheads" },
      { value: "dry",         label: "Dry",          emoji: "🌵", desc: "Tight, flaky, or rough texture" },
      { value: "combination", label: "Combination",  emoji: "⚖️",  desc: "Oily T-zone, dry cheeks" },
      { value: "sensitive",   label: "Sensitive",    emoji: "🌸", desc: "Easily irritated or reactive" },
    ],
  },
  {
    id: "concern",
    question: "What is your primary skin concern?",
    sub: "Select the issue that bothers you most.",
    options: [
      { value: "acne",       label: "Acne & Breakouts",   emoji: "🚫", desc: "Pimples, blackheads, blemishes" },
      { value: "dullness",   label: "Dullness & Dark Spots", emoji: "💫", desc: "Uneven tone, pigmentation" },
      { value: "oiliness",   label: "Excess Oil",          emoji: "💧", desc: "Shine, greasy feeling" },
      { value: "dryness",    label: "Dryness & Roughness",  emoji: "🌾", desc: "Tight, dehydrated, flaky" },
      { value: "sensitivity", label: "Sensitivity",         emoji: "🌷", desc: "Redness, reactions, irritation" },
      { value: "antiaging",  label: "Anti-Aging",          emoji: "⏳", desc: "Fine lines, loss of firmness" },
    ],
  },
  {
    id: "age",
    question: "What is your age group?",
    sub: "Different age groups have different skincare needs.",
    options: [
      { value: "under18",  label: "Under 18",  emoji: "🌱", desc: "Teen skincare" },
      { value: "18to25",   label: "18 – 25",   emoji: "✨", desc: "Young adult skincare" },
      { value: "26to35",   label: "26 – 35",   emoji: "🌿", desc: "Adult skincare" },
      { value: "36to45",   label: "36 – 45",   emoji: "🌺", desc: "Mature skincare" },
      { value: "over45",   label: "45 & over", emoji: "🌸", desc: "Senior skincare" },
    ],
  },
  {
    id: "midday",
    question: "How does your skin feel by midday?",
    sub: "Without applying any products, what does your skin feel like after a few hours?",
    options: [
      { value: "oily-midday",  label: "Shiny & Oily",    emoji: "🔆", desc: "Noticeable shine on forehead, nose, chin" },
      { value: "dry-midday",   label: "Tight & Dry",     emoji: "💨", desc: "Feels uncomfortable or dehydrated" },
      { value: "normal-midday", label: "Normal",         emoji: "😊", desc: "Balanced and comfortable" },
      { value: "patchy-midday", label: "Patchy & Mixed", emoji: "🎭", desc: "Oily in some areas, dry in others" },
    ],
  },
  {
    id: "sensitivity",
    question: "How sensitive is your skin?",
    sub: "Do products, weather, or food changes affect your skin?",
    options: [
      { value: "very-sensitive",   label: "Very Sensitive",  emoji: "🌡️", desc: "React to most products or changes" },
      { value: "sometimes",        label: "Sometimes",       emoji: "🤔", desc: "Occasional reactions to harsh products" },
      { value: "rarely",           label: "Rarely",          emoji: "😌", desc: "Most products work fine" },
      { value: "not-sensitive",    label: "Not Sensitive",   emoji: "💪", desc: "Rarely have reactions" },
    ],
  },
];

// ─── Generate results ─────────────────────────────────────────────────────────
function getResults(answers: Record<string, string>, product: Product) {
  const { concern, sensitivity } = answers;

  let headline = "Arwa Botaniqs Beauty Soap — Your Perfect Match! 🌿";
  let explanation = "";
  let benefits: string[] = [];

  if (concern === "acne") {
    explanation = "Based on your skin profile, you need a soap that actively fights acne-causing bacteria while being gentle enough for daily use. Arwa Botaniqs Beauty Soap with Neem and Tea Tree is exactly what your skin needs.";
    benefits = ["Neem combats acne bacteria", "Tea Tree controls breakouts", "Activated Charcoal unclogs pores"];
  } else if (concern === "dullness") {
    explanation = "Your skin craves brightening and even tone. Our Vitamin E and Aloe Vera formula works to restore natural radiance and fade dark spots with consistent daily use.";
    benefits = ["Vitamin E brightens skin tone", "Aloe Vera evens complexion", "Honey restores natural glow"];
  } else if (concern === "dryness") {
    explanation = "Your skin needs deep hydration and nourishment. Our Honey and Olive Extract formula locks in moisture and leaves your skin soft, supple, and deeply nourished.";
    benefits = ["Honey humectant keeps skin hydrated", "Olive Extract provides deep nourishment", "Aloe Vera soothes dryness"];
  } else if (concern === "oiliness") {
    explanation = "For oily skin, you need a soap that balances sebum production without stripping your skin's natural moisture barrier. Our Neem and Activated Charcoal formula is perfect.";
    benefits = ["Neem regulates oil production", "Activated Charcoal deep-cleanses pores", "Tea Tree keeps skin balanced"];
  } else if (concern === "sensitivity") {
    explanation = "Sensitive skin needs the gentlest care possible. Our 100% botanical formula is free from harsh chemicals and specially suited for reactive skin types.";
    benefits = ["Paraben and sulphate free", "Aloe Vera calms irritation", "Gentle botanical extracts"];
  } else {
    explanation = "Arwa Botaniqs Beauty Soap is your perfect daily companion for healthy, glowing skin. Our 100% botanical formula works for all skin types and concerns.";
    benefits = ["100% botanical extracts", "Gentle for all skin types", "Daily use formula"];
  }

  const matchScore = sensitivity === "not-sensitive" || sensitivity === "rarely" ? 98 : sensitivity === "sometimes" ? 95 : 92;

  return { product, headline, explanation, benefits, matchScore };
}

// ─── Option card ──────────────────────────────────────────────────────────────
function OptionCard({ option, selected, onSelect }: { option: typeof QUESTIONS[0]["options"][0]; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="w-full flex items-center gap-4 p-4 text-left transition-all duration-200"
      style={{ backgroundColor: selected ? "rgba(201,168,76,0.1)" : "transparent", border: `2px solid ${selected ? C.gold : "rgba(201,168,76,0.2)"}`, transform: selected ? "scale(1.01)" : "scale(1)" }}>
      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
      <div className="flex-1">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", fontWeight: selected ? 600 : 400, color: selected ? C.gold : C.ivory }}>{option.label}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "rgba(245,240,232,0.45)", marginTop: 2 }}>{option.desc}</p>
      </div>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: selected ? C.gold : "rgba(201,168,76,0.3)", backgroundColor: selected ? C.gold : "transparent" }}>
        {selected && <Check size={11} color={C.green} />}
      </div>
    </button>
  );
}

// ─── Results page ─────────────────────────────────────────────────────────────
function Results({ answers, onRetake }: { answers: Record<string, string>; onRetake: () => void }) {
  const { addToCart, products } = useStore();
  const navigate      = useNavigate();
  const recommended = products.find(p => p.isFeatured) || products.find(p => p.isBestSeller) || products[0];

  if (!recommended) {
    return (
      <div className="text-center py-16">
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.6)" }}>No products available right now — check back soon!</p>
      </div>
    );
  }

  const { product, headline, explanation, benefits, matchScore } = getResults(answers, recommended);

  return (
    <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.gold }}>
          <Sparkles size={28} color={C.green} />
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>Your Results</p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 700, color: C.ivory, lineHeight: 1.2 }}>{headline}</h2>
      </div>

      {/* Match score */}
      <div className="p-5 mb-6 text-center" style={{ backgroundColor: "rgba(201,168,76,0.08)", border: `1px solid rgba(201,168,76,0.3)` }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", letterSpacing: "0.25em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>Match Score</p>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem", fontWeight: 700, color: C.gold }}>{matchScore}%</div>
        <div className="w-full h-2 mt-3 overflow-hidden" style={{ backgroundColor: "rgba(201,168,76,0.15)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${matchScore}%` }} transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            className="h-full" style={{ backgroundColor: C.gold }} />
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: "rgba(245,240,232,0.55)", marginTop: 8 }}>Highly recommended for your skin profile</p>
      </div>

      {/* Product recommendation */}
      <div className="p-5 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid rgba(201,168,76,0.2)` }}>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="sm:w-32 h-32 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(201,168,76,0.06)" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.65rem", color: C.gold, textAlign: "center" }}>Arwa<br />Botaniqs</span>
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>Recommended For You</p>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 700, color: C.ivory }}>{product.name}<br /><span style={{ fontStyle: "italic", color: "rgba(245,240,232,0.7)" }}>{product.subtitle}</span></h3>
            <div className="flex items-baseline gap-3 my-3">
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: C.gold }}>Rs. {product.price}</span>
              <span className="line-through" style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.35)" }}>Rs. {product.oldPrice}</span>
            </div>
            <div className="space-y-1.5">
              {benefits.map(b => (
                <div key={b} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(201,168,76,0.2)" }}>
                    <Check size={10} color={C.gold} />
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(245,240,232,0.7)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why it's perfect */}
      <div className="p-5 mb-6" style={{ backgroundColor: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.15)` }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.95rem", color: C.ivory, marginBottom: 8, fontStyle: "italic" }}>Why this is perfect for you:</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.86rem", color: "rgba(245,240,232,0.65)", lineHeight: 1.78 }}>{explanation}</p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button onClick={() => { addToCart(product); navigate("/cart"); }}
          className="group flex-1 py-4 text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-2"
          style={{ backgroundColor: C.gold, color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
          <ShoppingCart size={15} /> Add to Cart
        </button>
        <button onClick={() => navigate(`/products/${product.slug}`)}
          className="flex-1 py-4 text-sm font-medium uppercase tracking-widest border"
          style={{ borderColor: "rgba(201,168,76,0.4)", color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>
          View Full Details
        </button>
      </div>

      <button onClick={onRetake} className="w-full flex items-center justify-center gap-2 py-2.5 text-xs hover:opacity-60 transition-opacity"
        style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        <RotateCcw size={12} /> Retake Quiz
      </button>
    </motion.div>
  );
}

// ─── Skin Quiz Page ───────────────────────────────────────────────────────────
export default function SkinQuiz() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done,    setDone]    = useState(false);

  const total    = QUESTIONS.length;
  const progress = ((step) / total) * 100;
  const q        = QUESTIONS[step];
  const selected = answers[q?.id] || "";

  const next = () => {
    if (step < total - 1) setStep(s => s + 1);
    else setDone(true);
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const select = (value: string) => {
    setAnswers(a => ({ ...a, [q.id]: value }));
  };

  const retake = () => { setStep(0); setAnswers({}); setDone(false); };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.green }}>
      {/* Decorative leaves */}
      <div className="leaf-1 fixed top-20 left-4 pointer-events-none z-0"><LeafSVG size={50} color={C.gold} /></div>
      <div className="leaf-3 fixed bottom-24 right-6 pointer-events-none z-0"><LeafSVG size={40} color={C.ivory} /></div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-24 pb-12 relative z-10">
        <div className="w-full max-w-xl">
          {!done && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <BrandLogo light compact />
                <div className="mt-5 flex items-center gap-2 mb-2">
                  <button onClick={() => navigate(-1)} className="p-1 hover:opacity-60"><ChevronLeft size={16} color="rgba(245,240,232,0.5)" /></button>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, flex: 1 }}>Skin Type Quiz</p>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(245,240,232,0.5)" }}>{step + 1}/{total}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 overflow-hidden" style={{ backgroundColor: "rgba(201,168,76,0.15)" }}>
                  <motion.div animate={{ width: `${progress + (1 / total) * 100}%` }} transition={{ duration: 0.4 }}
                    className="h-full" style={{ backgroundColor: C.gold }} />
                </div>
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 700, color: C.ivory, marginBottom: 8, lineHeight: 1.25 }}>
                    {q.question}
                  </h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: "rgba(245,240,232,0.55)", marginBottom: 24 }}>{q.sub}</p>

                  <div className="space-y-3">
                    {q.options.map(opt => (
                      <OptionCard key={opt.value} option={opt} selected={selected === opt.value} onSelect={() => select(opt.value)} />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-8">
                {step > 0 && (
                  <button onClick={back} className="flex items-center gap-1.5 px-5 py-3 border text-sm"
                    style={{ borderColor: "rgba(201,168,76,0.3)", color: "rgba(245,240,232,0.6)", fontFamily: "'DM Sans',sans-serif" }}>
                    <ChevronLeft size={14} /> Back
                  </button>
                )}
                <button onClick={next} disabled={!selected}
                  className="group flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium uppercase tracking-widest transition-all disabled:opacity-30"
                  style={{ backgroundColor: selected ? C.gold : "rgba(201,168,76,0.25)", color: selected ? C.green : "rgba(245,240,232,0.3)", fontFamily: "'DM Sans',sans-serif" }}>
                  {step < total - 1 ? <><span>Next Question</span> <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></> : <><span>Get My Results</span> <Sparkles size={15} /></>}
                </button>
              </div>
            </>
          )}

          {done && <Results answers={answers} onRetake={retake} />}
        </div>
      </div>
    </div>
  );
}
