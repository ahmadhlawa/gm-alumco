import { useState, useEffect, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../common/Button';
import { cn } from '@/lib/utils';
import { getNextPublicLanguage, useLanguage } from '@/i18n';
import {
  getHomeNavigationAction,
  scrollToHomeSection,
  type HomeSectionId,
} from '@/lib/homeNavigation';

type NavLink = {
  name: string;
  path: string;
  scrollTarget?: HomeSectionId;
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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

  const navLinks: NavLink[] = [
    { name: t('דף הבית', "Home"), path: '/', scrollTarget: 'home' },
    { name: t('עלינו', "About"), path: '/', scrollTarget: 'about' },
    { name: t('שירותים', "Services"), path: '/', scrollTarget: 'services' },
    { name: t('פרויקטים', "Projects"), path: '/', scrollTarget: 'projects' },
    { name: t('השותפים שלנו', "Partners"), path: '/', scrollTarget: 'partners' },
    { name: t('צור קשר', "Contact"), path: '/contact' },
  ];

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    if (!link.scrollTarget) return;
    event.preventDefault();
    setIsMobileMenuOpen(false);
    const action = getHomeNavigationAction(location.pathname, link.scrollTarget);
    if (action.type === 'scroll') scrollToHomeSection(action.target);
    else navigate(action.to, { state: action.state });
  };

  const toggleLanguage = () => {
    setLanguage(getNextPublicLanguage(language));
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
          <Link to="/" className="flex items-center">
            <img
              src="/images/ATS-logo.png"
              alt="T.A.S"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = link.scrollTarget === 'home'
                  ? location.pathname === '/'
                  : !link.scrollTarget && location.pathname === link.path;
                return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={(event) => handleNavClick(event, link)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-brand-gold relative py-2",
                      isScrolled ? "text-gray-200" : "text-gray-200 hover:text-white",
                      isActive && (isScrolled ? "text-white" : "text-white")
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-gold"
                      />
                    )}
                  </Link>
                </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 border-s border-gray-300/30 ps-4">
              <button 
                onClick={toggleLanguage}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer",
                  isScrolled ? "text-gray-200 hover:text-white" : "text-gray-200 hover:text-white"
                )}
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'he' ? 'EN' : 'HE'}</span>
              </button>
              
              <Button href="/request-quote" variant="secondary" size="sm" className="shadow-xl shadow-brand-border/50 shadow-brand-gold/20">
                {t('בקש הצעת מחיר', "Request a quote")}
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
                  <li key={link.name} className="border-b border-white/5 pb-2">
                    <Link
                      to={link.path}
                      onClick={(event) => handleNavClick(event, link)}
                      className={cn(
                        "text-lg font-medium block",
                        ((link.scrollTarget === 'home' && location.pathname === '/') ||
                          (!link.scrollTarget && location.pathname === link.path))
                          ? "text-brand-gold"
                          : "text-white"
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
                  <span>{language === 'he' ? 'English (EN)' : 'עברית (HE)'}</span>
                </button>
                <Button href="/request-quote" variant="primary" className="w-full justify-center">
                  {t('בקש הצעת מחיר', "Request a quote")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
