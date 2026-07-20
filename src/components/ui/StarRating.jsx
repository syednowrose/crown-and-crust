import { motion } from 'framer-motion'
import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, readOnly = false, size = 24 }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readOnly}
          whileHover={!readOnly ? { scale: 1.2 } : {}}
          whileTap={!readOnly ? { scale: 0.9 } : {}}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange?.(star)}
          className={`focus:outline-none transition-colors duration-150 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            size={size}
            className={`transition-colors duration-150 ${
              star <= (hovered || value)
                ? 'fill-gold-400 text-gold-400'
                : 'fill-transparent text-sandalwood-300'
            }`}
          />
        </motion.button>
      ))}
    </div>
  )
}
