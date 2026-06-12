import { ButtonHTMLAttributes, forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-brand-surface-alt text-brand-text border border-white/5 hover:bg-brand-surface",
      secondary: "bg-brand-gold text-white hover:bg-[#B8962E] uppercase tracking-wide",
      outline: "border border-white/20 text-white hover:bg-brand-surface/5",
      ghost: "text-[#D4AF37] hover:bg-brand-surface/5",
    };
    
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-8 text-base",
      lg: "h-14 px-10 text-lg",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link to={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={classes}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
