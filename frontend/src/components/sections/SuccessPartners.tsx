import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionHeader } from '@/components/common/SectionHeader';
import { getPartners } from '@/lib/api';
import type { Partner } from '@/types';
import { useLanguage } from '@/i18n';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

export function SuccessPartners() {
  const { t, language } = useLanguage();
  const autoplayInterval = 6000;

  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    getPartners(language)
      .then((data) => setPartners(data))
      .catch(() => setPartners([]));
  }, [language]);

  const totalItems = partners.length;
  // We triplicate the items to create a seamless infinite loop track
  const trackItems = [...partners, ...partners, ...partners];

  const [currentIndex, setCurrentIndex] = useState(totalItems); // Start at the middle block
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Recenter the track on the middle block once partners load from the API
  useEffect(() => {
    if (totalItems > 0) setCurrentIndex(totalItems);
  }, [totalItems]);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [isHovered, setIsHovered] = useState(false);
  
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(2); // Mobile
      else if (window.innerWidth < 1024) setItemsPerView(3); // Tablet
      else if (window.innerWidth < 1280) setItemsPerView(4); // Small Desktop
      else setItemsPerView(5); // Large Desktop (Matches reference image)
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isHovered || isDragging.current) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, autoplayInterval]);

  // Infinite loop reset
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - totalItems);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + totalItems);
    }
  };

  // Re-enable transitions after snapping
  useEffect(() => {
    if (!isTransitioning && !isDragging.current) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    setIsTransitioning(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - dragStartX.current);
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Calculate how many slides we dragged across based on container width
    const containerWidth = document.documentElement.clientWidth;
    const slideWidth = containerWidth / itemsPerView;
    const dragRatio = -dragOffset / slideWidth;
    let slidesToMove = Math.round(dragRatio);
    
    // Add velocity threshold for quick small swipes
    if (slidesToMove === 0) {
      if (dragOffset > 50) slidesToMove = -1;
      else if (dragOffset < -50) slidesToMove = 1;
    }
    
    setCurrentIndex(prev => prev + slidesToMove);
    setDragOffset(0);
    setIsTransitioning(true);
  };

  const onPointerLeave = () => {
    if (isDragging.current) {
      onPointerUp();
    }
  };

  const itemPercentage = 100 / itemsPerView;
  // Always LTR for the math track so drag and logic match simply
  const trackTransform = `translateX(calc(${-currentIndex * itemPercentage}% + ${dragOffset}px))`;

  return (
    <section id="partners" className="scroll-mt-24 py-24 bg-[#0A192F] relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-[#0A192F] opacity-50" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] opacity-[0.02] bg-cover bg-center" />
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader 
          title={t("شركاؤنا في النجاح", "Our Success Partners")} 
          subtitle={t(
            "نفخر بالتعاون مع نخبة من الموردين والشركاء العالميين لتقديم أفضل جودة",
            "We are proud to collaborate with elite global suppliers and partners to deliver the best quality"
          )}
          centered 
          light={true}
        />
        
        <div 
          className="relative mt-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            onPointerLeave();
          }}
        >
          {/* Carousel Track Wrapper */}
          <div 
            className="overflow-hidden md:px-0 touch-pan-y"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div 
              className="flex w-full cursor-grab active:cursor-grabbing pb-8 pt-4"
              dir="ltr"
              style={{
                transform: trackTransform,
                transition: isTransitioning && !isDragging.current ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {trackItems.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  style={{ width: `${itemPercentage}%` }}
                  className="flex-shrink-0 px-3 md:px-4"
                >
                  <div className="group flex flex-col items-center justify-center p-8 aspect-square bg-[#112240] border border-white/5 rounded-xl hover:border-brand-gold/30 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:-translate-y-2 transition-all duration-300">
                    <div className="w-full flex flex-col items-center justify-center text-center">
                      {partner.logo ? (
                        <img
                          src={normalizeImageUrl(partner.logo)}
                          onError={handleImageError}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain grayscale scale-95 opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-md"
                          draggable="false"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0A192F] border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:border-brand-gold/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-500">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-400 group-hover:text-brand-gold transition-colors duration-500">
                            {partner.name.substring(0, 2)}
                          </span>
                        </div>
                      )}
                      <h3 className="text-sm sm:text-base font-bold text-brand-silver group-hover:text-white transition-colors duration-300 mt-2">
                        {partner.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
