import { BRAND_NAME, BRAND_TAGLINE } from "../../constants/brand";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Grocery",
  "Toys",
  "Automotive",
  "Health",
  "Furniture",
  "Footwear",
];

// Deterministic pseudo-variety so chip styles differ without random flicker
// on every re-render (React re-renders shouldn't reshuffle the mosaic).
function chipVariant(i: number): "filled" | "outline" | "ghost" {
  const pattern: ("filled" | "outline" | "ghost")[] = ["outline", "ghost", "filled"];
  return pattern[i % pattern.length];
}

export function CategoryMosaicPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[42%] flex-col justify-between overflow-hidden bg-ink p-10 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, var(--color-ink-light), transparent 60%)",
        }}
      />

      <div className="relative z-10">
        <span className="font-display text-2xl font-semibold tracking-tight">
          {BRAND_NAME}
        </span>
        <p className="mt-2 max-w-xs text-sm text-white/60">{BRAND_TAGLINE}</p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-3 py-16">
        {CATEGORIES.map((cat, i) => {
          const variant = chipVariant(i);
          const base =
            "chip-float rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap";
          const styleByVariant = {
            filled: "bg-accent text-ink",
            outline: "border border-white/30 text-white/90",
            ghost: "bg-white/10 text-white/80",
          }[variant];

          return (
            <span
              key={cat}
              className={`${base} ${styleByVariant}`}
              style={{ animationDelay: `${(i % 6) * 0.4}s` }}
            >
              {cat}
            </span>
          );
        })}
      </div>

      <p className="relative z-10 text-xs text-white/40">
        Thousands of independent sellers, one checkout.
      </p>
    </div>
  );
}
