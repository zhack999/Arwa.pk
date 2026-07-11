import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store";
import { ALL_BENEFITS, ALL_SKIN_TYPES, type Product } from "../data";
import { fetchCategories, type Category } from "../api/categories";
import { C, FadeIn, GoldLine, ProductCard } from "../shared";
import { Filter, Grid, List, Search, X, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 8;

type SortKey = "featured" | "best-selling" | "newest" | "price-low" | "price-high" | "discounted";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured",     label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest",       label: "Newest" },
  { value: "price-low",    label: "Price: Low to High" },
  { value: "price-high",   label: "Price: High to Low" },
  { value: "discounted",   label: "Most Discounted" },
];

function applySort(products: Product[], sort: SortKey) {
  const arr = [...products];
  switch (sort) {
    case "price-low":    return arr.sort((a, b) => a.price - b.price);
    case "price-high":   return arr.sort((a, b) => b.price - a.price);
    case "discounted":   return arr.sort((a, b) => b.discount - a.discount);
    case "best-selling": return arr.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    case "newest":       return arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    default:             return arr.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
function FilterSidebar({
  categories,
  category, setCategory,
  maxPrice, setMaxPrice,
  selectedBenefits, setSelectedBenefits,
  selectedSkins, setSelectedSkins,
  inStockOnly, setInStockOnly,
  onClear,
}: {
  categories: { id: string; label: string }[];
  category: string; setCategory: (v: string) => void;
  maxPrice: number; setMaxPrice: (v: number) => void;
  selectedBenefits: string[]; setSelectedBenefits: (v: string[]) => void;
  selectedSkins: string[]; setSelectedSkins: (v: string[]) => void;
  inStockOnly: boolean; setInStockOnly: (v: boolean) => void;
  onClear: () => void;
}) {
  const toggleBenefit = (b: string) =>
    setSelectedBenefits(selectedBenefits.includes(b) ? selectedBenefits.filter(x => x !== b) : [...selectedBenefits, b]);
  const toggleSkin = (s: string) =>
    setSelectedSkins(selectedSkins.includes(s) ? selectedSkins.filter(x => x !== s) : [...selectedSkins, s]);

  const activeCount = (category !== "all" ? 1 : 0) + (maxPrice < 2000 ? 1 : 0) + selectedBenefits.length + selectedSkins.length + (inStockOnly ? 1 : 0);

  return (
    <div>
      {/* Clear filters */}
      {activeCount > 0 && (
        <button onClick={onClear} className="w-full flex items-center justify-between py-2.5 px-3 mb-5 text-xs uppercase tracking-widest hover:opacity-75 transition-opacity"
          style={{ backgroundColor: "rgba(201,168,76,0.1)", color: C.gold, fontFamily: "'DM Sans',sans-serif", border: `1px solid rgba(201,168,76,0.25)` }}>
          Clear All Filters
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: C.gold, color: C.green }}>{activeCount}</span>
        </button>
      )}

      {/* Category */}
      <div className="mb-6">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Category</p>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className="w-full text-left px-3 py-2 mb-1 text-sm transition-all"
            style={{ backgroundColor: category === cat.id ? "rgba(201,168,76,0.12)" : "transparent", color: category === cat.id ? C.gold : C.green, fontFamily: "'DM Sans',sans-serif", borderLeft: category === cat.id ? `2px solid ${C.gold}` : "2px solid transparent" }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Price */}
      <div className="mb-6" style={{ borderTop: `1px solid rgba(201,168,76,0.15)`, paddingTop: 20 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Max Price</p>
        <input type="range" min={200} max={2000} step={50} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
          className="w-full accent-[#c9a84c]" style={{ accentColor: C.gold }} />
        <div className="flex justify-between mt-1">
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: C.muted }}>Rs. 0</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: C.green, fontWeight: 600 }}>Rs. {maxPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6" style={{ borderTop: `1px solid rgba(201,168,76,0.15)`, paddingTop: 20 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Benefits</p>
        {ALL_BENEFITS.map(b => (
          <label key={b} className="flex items-center gap-2 py-1.5 cursor-pointer hover:opacity-75 transition-opacity">
            <input type="checkbox" checked={selectedBenefits.includes(b)} onChange={() => toggleBenefit(b)} className="sr-only" />
            <div className="w-4 h-4 border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: selectedBenefits.includes(b) ? C.gold : "rgba(26,61,43,0.3)", backgroundColor: selectedBenefits.includes(b) ? C.gold : "transparent" }}>
              {selectedBenefits.includes(b) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: C.green }}>{b}</span>
          </label>
        ))}
      </div>

      {/* Skin Type */}
      <div className="mb-6" style={{ borderTop: `1px solid rgba(201,168,76,0.15)`, paddingTop: 20 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Skin Type</p>
        {ALL_SKIN_TYPES.map(s => (
          <label key={s} className="flex items-center gap-2 py-1.5 cursor-pointer hover:opacity-75 transition-opacity">
            <input type="checkbox" checked={selectedSkins.includes(s)} onChange={() => toggleSkin(s)} className="sr-only" />
            <div className="w-4 h-4 border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: selectedSkins.includes(s) ? C.gold : "rgba(26,61,43,0.3)", backgroundColor: selectedSkins.includes(s) ? C.gold : "transparent" }}>
              {selectedSkins.includes(s) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: C.green }}>{s}</span>
          </label>
        ))}
      </div>

      {/* Availability */}
      <div style={{ borderTop: `1px solid rgba(201,168,76,0.15)`, paddingTop: 20 }}>
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity">
          <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="sr-only" />
          <div className="w-4 h-4 border flex items-center justify-center flex-shrink-0"
            style={{ borderColor: inStockOnly ? C.gold : "rgba(26,61,43,0.3)", backgroundColor: inStockOnly ? C.gold : "transparent" }}>
            {inStockOnly && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: C.green }}>In Stock Only</span>
        </label>
      </div>
    </div>
  );
}

// ─── Coming Soon Card ─────────────────────────────────────────────────────────
function ComingSoonCard() {
  return (
    <div className="flex flex-col" style={{ backgroundColor: C.cream, border: `1px dashed rgba(201,168,76,0.35)` }}>
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.2)` }}>
          <span style={{ fontSize: "1.4rem" }}>🌿</span>
        </div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", color: C.green, fontWeight: 600 }}>Coming Soon</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: C.muted, marginTop: 6, lineHeight: 1.6 }}>New botanical products are on their way. Subscribe to be notified.</p>
      </div>
    </div>
  );
}

// ─── Empty / No Results ───────────────────────────────────────────────────────
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full text-center py-24">
      <div className="text-5xl mb-4">🌿</div>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", color: C.green, marginBottom: 8 }}>No Products Found</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted, marginBottom: 24 }}>Try adjusting your filters or clearing the search.</p>
      <button onClick={onClear} className="px-6 py-3 text-sm uppercase tracking-widest"
        style={{ backgroundColor: C.green, color: C.ivory, fontFamily: "'DM Sans',sans-serif" }}>
        Clear All Filters
      </button>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────
export default function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, wishlist, toggleWishlist, setQuickViewId, products, productsLoading, productsError } = useStore();

  // Real categories, fetched from the backend (admin-managed) instead of a
  // hardcoded list. "All Products" is a client-side pseudo-category.
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([{ id: "all", label: "All Products" }]);
  useEffect(() => {
    fetchCategories()
      .then(cats => setCategories([{ id: "all", label: "All Products" }, ...cats.map(c => ({ id: c.id, label: c.name }))]))
      .catch(() => {}); // filter sidebar just shows "All Products" if this fails
  }, []);

  // Filter state
  const [category,         setCategory]         = useState("all");
  const [sort,             setSort]             = useState<SortKey>("featured");
  const [maxPrice,         setMaxPrice]         = useState(2000);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedSkins,    setSelectedSkins]    = useState<string[]>([]);
  const [inStockOnly,      setInStockOnly]      = useState(false);
  const [searchQ,          setSearchQ]          = useState(searchParams.get("q") || "");
  const [viewMode,         setViewMode]         = useState<"grid" | "list">("grid");
  const [page,             setPage]             = useState(1);
  const [filterOpen,       setFilterOpen]       = useState(false); // mobile drawer
  const [sortOpen,         setSortOpen]         = useState(false);

  // Sync search query from URL
  useEffect(() => { const q = searchParams.get("q"); if (q) setSearchQ(q); }, [searchParams]);

  const clearFilters = () => {
    setCategory("all"); setMaxPrice(2000); setSelectedBenefits([]); setSelectedSkins([]); setInStockOnly(false); setSearchQ(""); setPage(1);
  };

  const filtered = useMemo(() => {
    let res = products.filter(p => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (inStockOnly && p.stock === 0) return false;
      if (selectedBenefits.length && !selectedBenefits.every(b => p.benefits.includes(b))) return false;
      if (selectedSkins.length && !selectedSkins.every(s => p.skinTypes.includes(s as any))) return false;
      if (searchQ && !`${p.name} ${p.subtitle} ${p.tagline}`.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    });
    return applySort(res, sort);
  }, [products, category, sort, maxPrice, selectedBenefits, selectedSkins, inStockOnly, searchQ]);

  const totalPages = Math.ceil((filtered.length + 1) / ITEMS_PER_PAGE); // +1 for coming soon
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const showComingSoon = page === 1; // show coming soon slot on page 1

  return (
    <div style={{ backgroundColor: C.ivory, minHeight: "100vh" }}>
      {/* Banner */}
      <div className="relative overflow-hidden pt-20" style={{ backgroundColor: C.green, minHeight: 220 }}>
        <div className="sun absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 70% 40%, rgba(201,168,76,0.12) 0%, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate("/")} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: "rgba(245,240,232,0.5)" }} className="hover:text-[#c9a84c] transition-colors">Home</button>
            <span style={{ color: "rgba(245,240,232,0.3)" }}>/</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.gold }}>Shop</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: C.ivory, lineHeight: 1.15 }}>
            Our Collection
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(245,240,232,0.65)", marginTop: "0.75rem", maxWidth: 480 }}>
            Luxury botanical beauty products crafted from nature's purest extracts.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile filter / sort bar */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <button onClick={() => setFilterOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-3 border text-sm uppercase tracking-widest"
            style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
            <SlidersHorizontal size={15} /> Filter
          </button>
          <div className="flex-1 relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="w-full flex items-center justify-center gap-2 py-3 border text-sm uppercase tracking-widest"
              style={{ borderColor: "rgba(26,61,43,0.25)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
              Sort <ChevronDown size={13} />
            </button>
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60]"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setFilterOpen(false)} />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }}
                className="fixed left-0 top-0 bottom-0 z-[70] overflow-y-auto p-5 w-72"
                style={{ backgroundColor: C.cream }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", color: C.green }}>Filters</h3>
                  <button onClick={() => setFilterOpen(false)}><X size={20} color={C.green} /></button>
                </div>
                <FilterSidebar categories={categories} category={category} setCategory={setCategory} maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                  selectedBenefits={selectedBenefits} setSelectedBenefits={setSelectedBenefits}
                  selectedSkins={selectedSkins} setSelectedSkins={setSelectedSkins}
                  inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
                  onClear={clearFilters} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <FilterSidebar categories={categories} category={category} setCategory={setCategory} maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              selectedBenefits={selectedBenefits} setSelectedBenefits={setSelectedBenefits}
              selectedSkins={selectedSkins} setSelectedSkins={setSelectedSkins}
              inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
              onClear={clearFilters} />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4" style={{ borderBottom: `1px solid rgba(201,168,76,0.2)` }}>
              {/* Search bar */}
              <div className="flex items-center gap-2 flex-1 min-w-48">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} color={C.muted} className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "transparent", border: `1px solid rgba(26,61,43,0.2)`, color: C.green, fontFamily: "'DM Sans',sans-serif" }} />
                  {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={12} color={C.muted} /></button>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Product count */}
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", color: C.muted }}>
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </span>

                {/* Sort dropdown */}
                <div className="relative hidden md:block">
                  <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 px-3 py-2 border text-sm"
                    style={{ borderColor: "rgba(26,61,43,0.2)", color: C.green, fontFamily: "'DM Sans',sans-serif" }}>
                    {SORT_OPTIONS.find(s => s.value === sort)?.label} <ChevronDown size={13} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 py-1"
                      style={{ backgroundColor: C.cream, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: `1px solid rgba(201,168,76,0.2)` }}>
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); setPage(1); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[rgba(201,168,76,0.08)] transition-colors"
                          style={{ fontFamily: "'DM Sans',sans-serif", color: sort === opt.value ? C.gold : C.green, fontWeight: sort === opt.value ? 600 : 400 }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex border" style={{ borderColor: "rgba(26,61,43,0.2)" }}>
                  <button onClick={() => setViewMode("grid")} className="p-2 hover:bg-black/5 transition-colors"
                    style={{ backgroundColor: viewMode === "grid" ? "rgba(201,168,76,0.12)" : "transparent" }}>
                    <Grid size={15} color={viewMode === "grid" ? C.gold : C.green} />
                  </button>
                  <button onClick={() => setViewMode("list")} className="p-2 hover:bg-black/5 transition-colors"
                    style={{ backgroundColor: viewMode === "list" ? "rgba(201,168,76,0.12)" : "transparent" }}>
                    <List size={15} color={viewMode === "list" ? C.gold : C.green} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(searchQ || selectedBenefits.length > 0 || selectedSkins.length > 0 || category !== "all") && (
              <div className="flex flex-wrap gap-2 mb-5">
                {searchQ && (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs" style={{ backgroundColor: "rgba(201,168,76,0.12)", color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>
                    "{searchQ}" <button onClick={() => setSearchQ("")}><X size={10} /></button>
                  </span>
                )}
                {category !== "all" && (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs" style={{ backgroundColor: "rgba(201,168,76,0.12)", color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>
                    {categories.find(c => c.id === category)?.label} <button onClick={() => setCategory("all")}><X size={10} /></button>
                  </span>
                )}
                {selectedBenefits.map(b => (
                  <span key={b} className="flex items-center gap-1 px-3 py-1 text-xs" style={{ backgroundColor: "rgba(201,168,76,0.12)", color: C.gold, fontFamily: "'DM Sans',sans-serif" }}>
                    {b} <button onClick={() => setSelectedBenefits(selectedBenefits.filter(x => x !== b))}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Product grid */}
            {productsLoading ? (
              <div className="col-span-full text-center py-24" style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted }}>Loading products…</div>
            ) : productsError ? (
              <div className="col-span-full text-center py-24" style={{ fontFamily: "'DM Sans',sans-serif", color: C.muted }}>Couldn't load products. Please try again later.</div>
            ) : filtered.length === 0 ? (
              <div className="grid"><EmptyState onClear={clearFilters} /></div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "flex flex-col gap-5"}>
                {paged.map((product, i) => (
                  <FadeIn key={product.id} delay={i * 0.06}>
                    <ProductCard
                      product={product}
                      onView={() => navigate(`/products/${product.slug}`)}
                      onAddToCart={() => addToCart(product)}
                      onQuickView={() => setQuickViewId(product.id)}
                      onToggleWishlist={() => toggleWishlist(product)}
                      inWishlist={wishlist.has(product.id)}
                      viewMode={viewMode}
                    />
                  </FadeIn>
                ))}
                {showComingSoon && viewMode === "grid" && <FadeIn delay={paged.length * 0.06}><ComingSoonCard /></FadeIn>}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center border disabled:opacity-30 hover:border-[#c9a84c] transition-colors"
                  style={{ borderColor: "rgba(26,61,43,0.25)" }}>
                  <ChevronLeft size={15} color={C.green} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className="w-9 h-9 flex items-center justify-center text-sm border transition-all"
                    style={{ borderColor: page === i + 1 ? C.gold : "rgba(26,61,43,0.25)", backgroundColor: page === i + 1 ? C.gold : "transparent", color: page === i + 1 ? C.green : C.green, fontFamily: "'DM Sans',sans-serif" }}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center border disabled:opacity-30 hover:border-[#c9a84c] transition-colors"
                  style={{ borderColor: "rgba(26,61,43,0.25)" }}>
                  <ChevronRight size={15} color={C.green} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
