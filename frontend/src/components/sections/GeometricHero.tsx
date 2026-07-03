import { ArrowLeft, Gem, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { useLanguage } from '@/i18n';
import { defaultPublicStats, type PublicStat } from '@/data/publicStats';

// Cinematic easing reused across the staged hero reveal.
const EASE = [0.22, 1, 0.36, 1] as const;

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
};

const shapes = [
  'right-[8%] top-[15%] h-32 w-32 md:h-52 md:w-52',
  'left-[7%] top-[22%] h-24 w-24 md:h-40 md:w-40',
  'bottom-[18%] right-[20%] h-20 w-20 md:h-36 md:w-36',
];

interface GeometricHeroProps {
  stats?: PublicStat[];
  valueChips?: PublicStat[];
  heroSince?: PublicStat;
}

const valueIcons = {
  'premium-quality': Gem,
  'precise-engineering': Ruler,
  'durable-performance': ShieldCheck,
  'modern-aesthetic': Sparkles,
} as const;

// The Hero background follows the text direction: Hebrew/RTL keeps the original
// orientation, English/LTR mirrors the image so the building moves to the
// opposite side from the headline. Only the background <img> uses this.
export function heroBackgroundTransform(dir: 'rtl' | 'ltr'): string {
  return dir === 'rtl' ? 'scaleX(-1)' : 'scaleX(1)';
}

export function GeometricHero({
  stats = defaultPublicStats.heroStats,
  valueChips = defaultPublicStats.valueChips,
}: GeometricHeroProps) {
  const { t, dir } = useLanguage();

  return (
    <section
      id="home"
      dir={dir}
      className="relative isolate flex min-h-screen scroll-mt-24 overflow-hidden bg-brand-navy text-brand-text"
      aria-label="T.A.S"
    >
      {/* Background image with a slow, luxurious zoom — never fully static.
          The outer wrapper owns the ken-burns scale; the inner <img> owns the
          direction mirror, so the two transforms never conflict. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.13 }}
        transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      >
        {/* RTL (Hebrew) keeps the original orientation; LTR (English) mirrors the
            image so the building moves to the opposite side from the headline. */}
        <img
          src="/images/main.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: heroBackgroundTransform(dir) }}
        />
      </motion.div>

      {/* Layered overlays — rebalanced for a more visible building while keeping
          premium contrast + readable text. The dark stays anchored on the text
          side (RTL → right, LTR → left) and the bottom; the mid/far and diagonal
          are lightened so the center reveals more of the image. */}
      <div
        className={
          dir === 'rtl'
            ? 'absolute inset-0 bg-linear-to-l from-brand-navy/88 via-brand-navy/58 to-brand-surface-alt/20'
            : 'absolute inset-0 bg-linear-to-r from-brand-navy/88 via-brand-navy/58 to-brand-surface-alt/20'
        }
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(212,175,55,0.18),transparent_28%),linear-gradient(135deg,rgba(10,25,47,0.22),rgba(10,25,47,0.68))]" />
      <div className="absolute inset-0 bg-linear-to-t from-brand-navy/40 via-transparent to-brand-navy/22" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-linear-to-t from-brand-navy/85 to-transparent" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-px w-full bg-linear-to-l from-transparent via-brand-gold/55 to-transparent" />
        <div className="absolute right-[12%] top-0 h-full w-px bg-linear-to-b from-brand-gold/40 via-white/5 to-transparent" />
        <div className="absolute bottom-[18%] left-0 h-px w-2/3 bg-linear-to-r from-transparent via-brand-gold/40 to-transparent" />

        {shapes.map((shape, index) => (
          <motion.div
            key={shape}
            className={`absolute ${shape} border border-brand-gold/25 bg-brand-surface/10 backdrop-blur-[2px]`}
            style={{
              clipPath: 'polygon(50% 0%, 100% 28%, 100% 72%, 50% 100%, 0% 72%, 0% 28%)',
            }}
            animate={{
              y: [0, index % 2 ? -18 : 18, 0],
              rotate: [0, index % 2 ? -7 : 7, 0],
              opacity: [0.28, 0.58, 0.28],
            }}
            transition={{
              duration: 8 + index * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        className="container relative z-10 mx-auto flex min-h-screen flex-col justify-end px-5 pb-10 pt-28 sm:px-8 lg:pb-14"
        variants={heroStagger}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-4xl">
          <motion.h1
            variants={heroItem}
            className={`max-w-4xl text-4xl font-black leading-[1.08] tracking-tight text-[#F4F5F7] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:text-5xl ${
              dir === 'rtl' ? 'lg:text-6xl' : 'lg:text-7xl'
            }`}
          >
            {t('פתרונות אלומיניום וזכוכית', 'Aluminum & glass solutions')}
            <span className="block text-brand-text">
              {t('לפרויקטים אדריכליים יוקרתיים', 'for premium architectural projects')}
            </span>
          </motion.h1>

          <motion.p variants={heroItem} className="mt-6 max-w-2xl text-base leading-8 text-[#A7B0C2] sm:text-lg">
            {t('תכנון, ייצור והתקנה של מערכות אלומיניום וזכוכית בסטנדרטים הנדסיים בינלאומיים. קירות מסך, דלתות הזזה ופתרונות מותאמים אישית לווילות וארמונות.',
              'Design, manufacturing and installation of aluminum and glass systems to international engineering standards. Curtain walls, sliding doors and bespoke solutions for villas and palaces.',
            )}
          </motion.p>

          <motion.div variants={heroItem} className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-3 bg-brand-gold px-7 py-4 text-sm font-bold text-brand-navy shadow-lg shadow-brand-gold/20 transition hover:-translate-y-0.5 hover:bg-[#e3c454] hover:shadow-xl hover:shadow-brand-gold/30"
            >
              {t('צפה בפרויקטים שלנו', 'View our projects')}
              <ArrowLeft className="h-4 w-4 ltr:-scale-x-100" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-brand-gold/60 hover:text-brand-gold"
            >
              {t('השירותים ההנדסיים שלנו', 'Our engineering services')}
            </a>
          </motion.div>

          <motion.div
            variants={heroItem}
            className="mt-10 grid max-w-xl grid-cols-3 gap-px border border-white/10 bg-white/10"
          >
            {stats.map((stat) => (
              <div key={stat.id} className="bg-brand-navy/55 px-3 py-4 text-center backdrop-blur-md">
                <div className="text-2xl font-black text-white sm:text-3xl" dir="ltr">
                  {stat.value}{stat.suffix ?? ''}
                </div>
                <div className="mt-1 text-xs font-semibold text-brand-silver">{t(stat.label.he, stat.label.en)}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={heroItem}
          className="mt-12 grid gap-px border-y border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {valueChips.map((chip) => {
            const Icon = valueIcons[chip.id as keyof typeof valueIcons] ?? Sparkles;
            return (
            <div key={chip.id} className="flex items-center gap-3 bg-brand-navy/55 px-4 py-5 backdrop-blur-md">
              <Icon className="h-5 w-5 shrink-0 text-brand-gold" />
              <span className="text-xs font-bold text-brand-text">{t(chip.label.he, chip.label.en)}</span>
            </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
