import { Testimonial } from '@/types';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-brand-surface p-8 relative shadow-sm border border-white/5"
    >
      <Quote className="absolute top-6 left-6 w-12 h-12 text-brand-silver/30" />
      <div className="flex gap-1 text-brand-gold mb-6">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className="w-4 h-4" 
            fill={i < Math.floor(testimonial.rating) ? "currentColor" : "none"} 
          />
        ))}
      </div>
      <p className="text-gray-200 text-lg mb-8 leading-relaxed relative z-10 italic">
        "{testimonial.content}"
      </p>
      <div>
        <h4 className="font-bold text-white">{testimonial.name}</h4>
        <p className="text-sm text-brand-silver">{testimonial.role} {testimonial.company !== '-' && `• ${testimonial.company}`}</p>
      </div>
    </motion.div>
  );
}
