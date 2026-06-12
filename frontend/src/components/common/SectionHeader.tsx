import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  light?: boolean;
}

export function SectionHeader({ title, subtitle, centered = false, className, light = true }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", centered && "text-center", className)}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight mb-4",
          light ? "text-white" : "text-brand-navy"
        )}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={cn(
            "text-lg max-w-2xl",
            centered && "mx-auto",
            light ? "text-brand-silver" : "text-gray-600"
          )}
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "60px" }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={cn(
          "h-1 mt-6 bg-brand-gold",
          centered && "mx-auto"
        )}
      />
    </div>
  );
}
