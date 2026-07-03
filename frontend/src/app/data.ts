export type ProductCategory = "soap" | "face-care" | "body-care";
export type SkinType = "All" | "Oily" | "Dry" | "Combination" | "Sensitive" | "Normal";

export interface IngredientItem {
  name: string;
  emoji: string;
  desc: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  price: number;
  oldPrice: number;
  discount: number;
  weight: string;
  category: ProductCategory;
  benefits: string[];
  skinTypes: SkinType[];
  ingredients: IngredientItem[];
  howToUse: string[];
  warnings: string[];
  shippingInfo: string;
  returnPolicy: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  slug: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  verified: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "arwa-beauty-soap-200g",
    slug: "arwa-beauty-soap-200g",
    name: "Arwa Botaniqs",
    subtitle: "Beauty Soap",
    tagline: "Naturally Beautiful, Inside & Out",
    description:
      "Our signature Beauty Soap is formulated with 100% botanical extracts — Neem, Aloe Vera, Tea Tree, Olive Oil, Vitamin E, Honey, and Activated Charcoal — working in harmony to deeply cleanse, brighten, and nourish your skin. Free from parabens, sulphates, and harmful chemicals, this soap is safe for the whole family including babies and sensitive skin types. Experience the difference that pure nature makes with every wash.",
    price: 549,
    oldPrice: 1000,
    discount: 45,
    weight: "200g",
    category: "soap",
    benefits: [
      "Acne Control",
      "Skin Brightening",
      "Oil Control",
      "Deep Cleansing",
      "Hydration",
      "Baby Friendly",
      "Sensitive Skin",
    ],
    skinTypes: ["All", "Oily", "Dry", "Sensitive", "Normal"],
    ingredients: [
      { name: "Neem",               emoji: "🌿", desc: "Nature's antibacterial shield — combats acne-causing bacteria and purifies skin." },
      { name: "Aloe Vera",          emoji: "🌱", desc: "Soothing hydration powerhouse that calms irritation and locks in moisture." },
      { name: "Olive Extract",      emoji: "🫒", desc: "Ancient skin-nourishing elixir rich in antioxidants and fatty acids." },
      { name: "Tea Tree",           emoji: "🌲", desc: "Pore-purifying botanical essence that controls breakouts and excess oil." },
      { name: "Vitamin E",          emoji: "✨", desc: "Antioxidant skin repair complex that evens tone and restores radiance." },
      { name: "Honey",              emoji: "🍯", desc: "Natural humectant and antibacterial — keeps skin soft and supple all day." },
      { name: "Activated Charcoal", emoji: "🖤", desc: "Deep-pore detoxifying mineral that draws out impurities and pollutants." },
      { name: "Botanical Herbs",    emoji: "🌾", desc: "A synergistic blend of botanicals that work together for total skin wellness." },
    ],
    howToUse: [
      "Wet your face or body thoroughly with warm water.",
      "Lather the soap gently between your palms or directly on skin.",
      "Massage in circular motions for 30–60 seconds, paying attention to problem areas.",
      "Rinse thoroughly with clean water.",
      "Pat skin dry with a soft towel — do not rub.",
      "Follow with your favourite moisturiser for best results.",
      "Use twice daily — morning and evening — for optimal results.",
    ],
    warnings: [
      "For external use only. Avoid direct contact with eyes.",
      "If irritation occurs, discontinue use and consult a dermatologist.",
      "Keep out of reach of children under 3 years.",
      "Store in a cool, dry place away from direct sunlight.",
      "Not for use on open wounds or severely broken skin.",
    ],
    shippingInfo:
      "We deliver across Pakistan within 2–4 business days. Flat shipping rate of Rs. 300 per order, regardless of quantity. Orders dispatched Monday through Sunday.",
    returnPolicy:
      "2-day return policy from the date of delivery. If you are not satisfied, contact us within 2 days and we will arrange a hassle-free return.",
    stock: 50,
    rating: 4.9,
    reviewCount: 128,
    isNew: false,
    isBestSeller: true,
    isFeatured: true,
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "arwa-beauty-soap-200g",
    name: "Ayesha Malik",
    city: "Lahore",
    rating: 5,
    title: "Best soap I have ever used!",
    text: "I have been using Arwa Botaniqs for three weeks and my skin has never felt this clean. The lather is incredible and the botanical scent is so refreshing. My acne has reduced significantly and my skin looks brighter!",
    date: "June 28, 2026",
    verified: true,
  },
  {
    id: "r2",
    productId: "arwa-beauty-soap-200g",
    name: "Fatima Zahra",
    city: "Karachi",
    rating: 5,
    title: "Perfect for sensitive skin",
    text: "Finally a soap that doesn't dry out my sensitive skin. I have tried so many products and this is the one that actually works. The neem and aloe combination is just perfect. My skin feels hydrated and calm.",
    date: "June 20, 2026",
    verified: true,
  },
  {
    id: "r3",
    productId: "arwa-beauty-soap-200g",
    name: "Zara Ahmed",
    city: "Islamabad",
    rating: 5,
    title: "Cleared my daughter's acne!",
    text: "Ordered for my teenage daughter who struggles with breakouts. After just two weeks the difference is clearly visible. Genuine botanical ingredients you can trust. Will order again — highly recommend!",
    date: "June 15, 2026",
    verified: true,
  },
  {
    id: "r4",
    productId: "arwa-beauty-soap-200g",
    name: "Hina Qureshi",
    city: "Faisalabad",
    rating: 5,
    title: "Luxurious feel at an incredible price",
    text: "The packaging alone made me fall in love but the product exceeded all expectations. My skin feels incredibly soft and hydrated all day long. Worth every rupee — and the discount makes it an absolute steal!",
    date: "June 10, 2026",
    verified: true,
  },
  {
    id: "r5",
    productId: "arwa-beauty-soap-200g",
    name: "Sana Tariq",
    city: "Multan",
    rating: 5,
    title: "Visible brightening in two weeks",
    text: "I was skeptical at first but the results speak for themselves. My complexion is noticeably brighter and my pores look smaller. The activated charcoal does an amazing job at deep cleansing. Will not go back to chemical soaps.",
    date: "June 3, 2026",
    verified: true,
  },
];

export const ALL_BENEFITS = [
  "Acne Control",
  "Skin Brightening",
  "Oil Control",
  "Deep Cleansing",
  "Hydration",
  "Baby Friendly",
  "Sensitive Skin",
];

export const ALL_SKIN_TYPES: SkinType[] = ["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"];
export const ALL_WEIGHTS = ["100g", "200g", "300g"];
export const ALL_CATEGORIES = [
  { id: "all",       label: "All Products" },
  { id: "soap",      label: "Botanical Soap" },
  { id: "face-care", label: "Face Care" },
  { id: "body-care", label: "Body Care" },
];

export const POPULAR_SEARCHES = [
  "Beauty Soap",
  "Acne Soap",
  "Natural Soap",
  "Brightening Soap",
  "Sensitive Skin",
];
