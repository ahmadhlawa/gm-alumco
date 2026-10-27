import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { listGalleryImages, type GalleryImageDto, type GalleryLocation } from '@/api/gallery';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useLanguage } from '@/i18n';
import { normalizeImageUrl } from '@/lib/utils';

type PhotoFilter = 'ALL' | GalleryLocation;
const PHOTO_FILTERS: PhotoFilter[] = ['ALL', 'LOCAL', 'INTERNATIONAL'];

export function ProjectPhotoGallery() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<GalleryImageDto[]>([]);
  const [filter, setFilter] = useState<PhotoFilter>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    // Optional, independent section: an API failure must not break the existing projects.
    void listGalleryImages().then((items) => {
      if (mounted) setPhotos(items.filter((photo) =>
        photo.category === 'LOCAL' || photo.category === 'INTERNATIONAL'));
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const visiblePhotos = photos.filter((photo) => filter === 'ALL' || photo.category === filter);
  const selectedIndex = visiblePhotos.findIndex((photo) => photo.id === selectedId);
  const currentPhoto = selectedIndex >= 0 ? visiblePhotos[selectedIndex] : null;

  useEffect(() => {
    if (!currentPhoto) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
      if (event.key === 'ArrowRight') {
        setSelectedId(visiblePhotos[(selectedIndex + 1) % visiblePhotos.length].id);
      }
      if (event.key === 'ArrowLeft') {
        setSelectedId(visiblePhotos[(selectedIndex - 1 + visiblePhotos.length) % visiblePhotos.length].id);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [currentPhoto, selectedIndex, visiblePhotos]);

  if (photos.length === 0) return null;

  const locationName = (category: string | null) =>
    category === 'INTERNATIONAL' ? t('בחו״ל', 'Abroad') : t('בארץ', 'Local');

  const filterName = (key: PhotoFilter) =>
    key === 'ALL' ? t('הכל', 'All photos') : locationName(key);

  return (
    <section className="bg-brand-navy py-20 text-white md:py-24" aria-labelledby="project-photo-gallery">
      <div className="container mx-auto px-4">
        <div id="project-photo-gallery">
          <SectionHeader
            title={t('עוד מהעבודות שלנו', 'More of our work')}
            subtitle={t('גלריית תמונות מפרויקטים בארץ ובחו״ל.', 'A visual collection of work at home and abroad.')}
            centered
          />
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3" role="group" aria-label={t('סינון לפי מיקום', 'Filter by location')}>
          {PHOTO_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => { setFilter(key); setSelectedId(null); }}
              className={filter === key
                ? 'rounded-full bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy'
                : 'rounded-full border border-white/20 px-6 py-2.5 text-sm font-bold text-brand-silver transition hover:border-brand-gold hover:text-white'}
            >
              {filterName(key)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {visiblePhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
              onClick={() => setSelectedId(photo.id)}
              aria-label={t('פתיחת תמונה', 'Open photo') + ' ' + (index + 1) + ' — ' + locationName(photo.category)}
            >
              <img
                src={normalizeImageUrl(photo.image_url)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('תצוגת תמונה', 'Photo viewer')}
          onClick={() => setSelectedId(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label={t('סגירה', 'Close')}
            className="absolute right-5 top-5 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={normalizeImageUrl(currentPhoto.image_url)}
            alt={t('תמונת פרויקט', 'Project photo') + ' — ' + locationName(currentPhoto.category)}
            className="max-h-[84vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {visiblePhotos.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t('התמונה הקודמת', 'Previous photo')}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(visiblePhotos[(selectedIndex - 1 + visiblePhotos.length) % visiblePhotos.length].id);
                }}
                className="absolute left-3 top-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:left-6 sm:p-3"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label={t('התמונה הבאה', 'Next photo')}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(visiblePhotos[(selectedIndex + 1) % visiblePhotos.length].id);
                }}
                className="absolute right-3 top-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:right-6 sm:p-3"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <span className="absolute bottom-5 text-sm text-white/75" dir="ltr">
            {selectedIndex + 1} / {visiblePhotos.length}
          </span>
        </div>
      )}
    </section>
  );
}
