import { ArrowLeft, Gem, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const values = [
  { label: 'PREMIUM QUALITY', icon: Gem },
  { label: 'PRECISE ENGINEERING', icon: Ruler },
  { label: 'DURABLE PERFORMANCE', icon: ShieldCheck },
  { label: 'MODERN AESTHETIC', icon: Sparkles },
];

const stats = [
  { value: '250+', label: 'פרויקטים שהושלמו' },
  { value: '10+', label: 'שנות ניסיון' },
  { value: '5', label: 'שנות אחריות' },
];

const shapes = [
  'right-[8%] top-[15%] h-32 w-32 md:h-52 md:w-52',
  'left-[7%] top-[22%] h-24 w-24 md:h-40 md:w-40',
  'bottom-[18%] right-[20%] h-20 w-20 md:h-36 md:w-36',
];

export function GeometricHero() {
  return (
    <section
      dir="rtl"
      className="relative isolate flex min-h-screen overflow-hidden bg-brand-navy text-brand-text"
      aria-label="T.A.S"
    >
      <img
        src="/images/main.jpeg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      <div className="absolute inset-0 bg-gradient-to-l from-brand-navy/95 via-brand-navy/78 to-brand-surface-alt/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(212,175,55,0.18),transparent_28%),linear-gradient(135deg,rgba(10,25,47,0.3),rgba(10,25,47,0.94))]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-brand-navy to-transparent" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-px w-full bg-gradient-to-l from-transparent via-brand-gold/55 to-transparent" />
        <div className="absolute right-[12%] top-0 h-full w-px bg-gradient-to-b from-brand-gold/40 via-white/5 to-transparent" />
        <div className="absolute bottom-[18%] left-0 h-px w-2/3 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

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

      <div className="container relative z-10 mx-auto flex min-h-screen flex-col justify-end px-5 pb-10 pt-28 sm:px-8 lg:pb-14">
        <motion.div
          className="max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="mb-6 inline-flex items-center gap-3 border border-brand-gold/35 bg-brand-surface/60 px-4 py-2 text-sm font-semibold text-brand-gold backdrop-blur-md">
            <span className="h-px w-8 bg-brand-gold" />
            מצוינות הנדסית מאז 2014
          </div>

          <p className="mb-4 text-xl font-bold tracking-normal text-brand-gold md:text-2xl">
            T.A.S
          </p>

          <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
            פתרונות אלומיניום וזכוכית
            <span className="block text-brand-text">לפרויקטים אדריכליים יוקרתיים</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-brand-silver sm:text-lg">
            תכנון, ייצור והתקנה של מערכות אלומיניום וזכוכית בסטנדרטים הנדסיים בינלאומיים.
            קירות מסך, דלתות הזזה ופתרונות מותאמים אישית לווילות וארמונות.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-3 bg-brand-gold px-7 py-4 text-sm font-bold text-brand-navy transition hover:bg-[#e3c454]"
            >
              צפה בפרויקטים שלנו
              <ArrowLeft className="h-4 w-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-brand-gold/60 hover:text-brand-gold"
            >
              השירותים ההנדסיים שלנו
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-px border border-white/10 bg-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-brand-navy/55 px-3 py-4 text-center backdrop-blur-md">
                <div className="text-2xl font-black text-white sm:text-3xl" dir="ltr">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-semibold text-brand-silver">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 grid gap-px border-y border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 bg-brand-navy/55 px-4 py-5 backdrop-blur-md">
              <Icon className="h-5 w-5 shrink-0 text-brand-gold" />
              <span className="text-xs font-bold text-brand-text">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
