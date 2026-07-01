import { Testimonial } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

type FuturePhotoFields = {
  photo?: string | null;
  photoUrl?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
};

interface TestimonialCardProps {
  testimonial: Testimonial & FuturePhotoFields;
  index?: number;
  active?: boolean;
  className?: string;
}

const clippedCorner = {
  clipPath: 'polygon(0% 0%, 90% 0%, 100% 10%, 100% 100%, 10% 100%, 0% 90%)',
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

function getPhotoUrl(testimonial: Testimonial & FuturePhotoFields) {
  return [
    testimonial.photoUrl,
    testimonial.photo,
    testimonial.avatarUrl,
    testimonial.avatar,
    testimonial.imageUrl,
    testimonial.image,
    testimonial.image_url,
    testimonial.avatar_url,
  ].find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();
}

export function TestimonialCard({ testimonial, index = 0, active = false, className }: TestimonialCardProps) {
  const rating = Math.max(0, Math.min(5, Math.round(testimonial.rating ?? 5)));
  const company = testimonial.company && testimonial.company !== '-' ? testimonial.company : '';
  const meta = [testimonial.role, company].filter(Boolean).join(' \u2022 ');
  const initials = getInitials(testimonial.name);
  const photoUrl = getPhotoUrl(testimonial);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const showPhoto = Boolean(photoUrl && photoUrl !== failedPhotoUrl);

  return (
    <motion.article
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      style={clippedCorner}
      className={cn(
        'relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden border p-8 transition-all duration-500 md:p-10',
        active
          ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-[0_24px_80px_rgba(212,175,55,0.18)]'
          : 'border-white/10 bg-[#1d2939]/60 text-brand-text shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl',
        className,
      )}
    >
      <div>
        <Quote className={cn('mb-5 h-14 w-14', active ? 'text-brand-navy/35' : 'text-brand-gold/40')} />
        <div className={cn('mb-7 flex gap-1', active ? 'text-brand-navy/80' : 'text-brand-gold')} aria-label={`${rating}/5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="h-4 w-4" fill={i < rating ? 'currentColor' : 'none'} />
          ))}
        </div>
        <p className={cn('relative z-10 mb-10 text-xl italic leading-relaxed md:text-2xl', active ? 'text-brand-navy' : 'text-gray-100')}>
          "{testimonial.content}"
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 items-center justify-center text-lg font-bold',
            active ? 'bg-brand-navy/10 text-brand-navy' : 'bg-brand-surface-alt text-brand-gold',
          )}
          style={clippedCorner}
        >
          {showPhoto ? (
            <img
              src={photoUrl}
              alt={testimonial.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setFailedPhotoUrl(photoUrl ?? null)}
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <h4 className={cn('text-xl font-bold', active ? 'text-brand-navy' : 'text-white')}>{testimonial.name}</h4>
          {meta && <p className={cn('text-sm font-medium', active ? 'text-brand-navy/75' : 'text-brand-silver')}>{meta}</p>}
        </div>
      </div>
    </motion.article>
  );
}
