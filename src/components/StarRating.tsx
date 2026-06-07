import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const LABELS = ["", "Very Poor", "Poor", "Average", "Good", "Excellent"];

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Satisfaction rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""} - ${LABELS[i]}`}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={`h-9 w-9 transition-colors ${
                i <= active ? "fill-gold text-gold" : "text-muted-foreground/40"
              }`}
            />
          </motion.button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground h-5">
        {active ? LABELS[active] : "Tap a star to rate"}
      </p>
    </div>
  );
}
