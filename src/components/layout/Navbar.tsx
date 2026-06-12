import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../common/Button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: t('الرئيسية', 'דף הבית'), path: '/' },
    { name: t('من نحن', 'עלינו'), path: '/about' },
    { name: t('خدماتنا', 'שירותים'), path: '/services' },
    { name: t('المنتجات', 'מוצרים'), path: '/products' },
    { name: t('مشاريعنا', 'פרויקטים'), path: '/projects' },
    { name: t('اتصل بنا', 'צור קשר'), path: '/contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'he' : 'ar');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-brand-navy/95 backdrop-blur-md shadow-sm border-white/5 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-gold/10 border border-brand-gold/30 rounded flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-brand-gold font-bold text-xl">AL</span>
            </div>
            <span className={cn(
              "font-bold text-xl tracking-tight transition-colors",
              isScrolled ? "text-white" : "text-white lg:text-white"
            )}>
              {t('أفق الألمنيوم', 'אופק אלומיניום')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-brand-gold relative py-2",
                      isScrolled ? "text-gray-200" : "text-gray-200 hover:text-white",
                      location.pathname === link.path && (isScrolled ? "text-white" : "text-white")
                    )}
                  >
                    {link.name}
                    {location.pathname === link.path && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-gold"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-r border-gray-300/30 pr-4">
              <button 
                onClick={toggleLanguage}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer",
                  isScrolled ? "text-gray-200 hover:text-white" : "text-gray-200 hover:text-white"
                )}
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'ar' ? 'HE' : 'AR'}</span>
              </button>
              
              <Button href="/request-quote" variant="secondary" size="sm" className="shadow-xl shadow-brand-border/50 shadow-brand-gold/20">
                {t('اطلب عرض سعر', 'בקש הצעת מחיר')}
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className={cn(
              "p-2 lg:hidden",
              isScrolled ? "text-white" : "text-white"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 top-[60px] bg-brand-navy z-40 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col p-6 gap-6">
              <ul className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.path} className="border-b border-white/5 pb-2">
                    <Link 
                      to={link.path}
                      className={cn(
                        "text-lg font-medium block",
                        location.pathname === link.path ? "text-brand-gold" : "text-white"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col gap-4 mt-4">
                 <button onClick={toggleLanguage} className="flex items-center gap-2 text-white font-medium p-2 bg-white/5 rounded">
                  <Globe className="w-5 h-5" />
                  <span>{language === 'ar' ? 'עברית (HE)' : 'العربية (AR)'}</span>
                </button>
                <Button href="/request-quote" variant="primary" className="w-full justify-center">
                  {t('اطلب عرض سعر', 'בקש הצעת מחיר')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
