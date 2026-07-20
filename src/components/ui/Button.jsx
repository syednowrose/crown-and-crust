import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  gold:      'btn-gold',
  danger:    'bg-red-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all duration-200',
}

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: '',
  lg: 'px-8 py-3 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={clsx(
        variants[variant],
        sizes[size],
        'relative overflow-hidden',
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading…
        </span>
      ) : children}
    </motion.button>
  )
}
