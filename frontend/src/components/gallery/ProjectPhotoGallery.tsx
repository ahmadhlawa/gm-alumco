import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  listGalleryImages,
  type GalleryImageDto,
  type GalleryLocation,
} from '@/api/gallery';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useLanguage } from '@/i18n';
import { normalizeImageUrl } from '@/lib/utils';
import { projectFilterLabel } from '@/lib/projectCategories';

type PhotoFilter = 'ALL' | GalleryLocation;
const PHOTO_FILTERS: PhotoFilter[] = ['ALL', 'LOCAL', 'INTERNATIONAL'];
const CONTROL =
  'rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold';

function PhotoImage({
  photo,
  viewer = false,
}: {
  photo: GalleryImageDto;
  viewer?: boolean;
}) {
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <>
      {viewer && !loaded && !failed && (
        <span role="status" className="absolute text-white/80">
          {t('טוען תמונה…', 'Loading photo…')}
        </span>
      )}
      {failed ? (
        <span
          role="status"
          className="flex h-full items-center justify-center p-5 text-sm text-white/80"
        >
          {t('לא ניתן להציג תמונה זו.', 'This photo could not be displayed.')}
        </span>
      ) : (
        <img
          src={normalizeImageUrl(photo.image_url)}
          alt={viewer ? t('תמונת פרויקט', 'Project photo') : ''}
          loading={viewer ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={
            viewer
              ? 'max-h-[calc(100dvh-12rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-full object-contain sm:max-h-[calc(100dvh-10rem)]'
              : 'h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105'
          }
        />
      )}
    </>
  );
}

function PhotoViewer({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: GalleryImageDto[];
  index: number;
  onChange: (id: number) => void;
  onClose: () => void;
}) {
  const { t, dir } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const navigate = (step: number) =>
    onChange(photos[(index + step + photos.length) % photos.length].id);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const originalOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = rootOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('תצוגת תמונה', 'Photo viewer')}
      aria-modal="true"
      dir={dir}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          navigate(
            (event.key === 'ArrowRight' ? 1 : -1) * (dir === 'rtl' ? -1 : 1),
          );
        }
        if (event.key === 'Tab') {
          const buttons = Array.from(
            event.currentTarget.querySelectorAll('button'),
          );
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }}
      onTouchStart={(event) => {
        if (event.touches.length !== 1) { touchStart.current = null; return; }
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        const touch = event.changedTouches[0];
        if (!start || !touch) return;
        const dx = touch.clientX - start.x;
        if (
          Math.abs(dx) > 50 &&
          Math.abs(dx) > Math.abs(touch.clientY - start.y)
        )
          navigate((dx < 0 ? 1 : -1) * (dir === 'rtl' ? -1 : 1));
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none items-center justify-center overflow-hidden overscroll-none bg-black/95 px-[max(env(safe-area-inset-left),env(safe-area-inset-right))] pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] text-white open:flex backdrop:bg-black/95 sm:px-20 sm:py-20"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t('סגירה', 'Close')}
        className={`absolute end-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 sm:top-4 ${CONTROL}`}
      >
        <X className="h-6 w-6" />
      </button>
      <div className="relative flex max-h-full max-w-full items-center justify-center">
        <PhotoImage key={photos[index].id} photo={photos[index]} viewer />
      </div>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label={t('התמונה הקודמת', 'Previous photo')}
            onClick={() => navigate(-1)}
            className={`absolute start-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:start-5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 ${CONTROL}`}
          >
            <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
          </button>
          <button
            type="button"
            aria-label={t('התמונה הבאה', 'Next photo')}
            onClick={() => navigate(1)}
            className={`absolute end-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:end-5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 ${CONTROL}`}
          >
            <ChevronRight className="h-6 w-6 rtl:rotate-180" />
          </button>
        </>
      )}
      <span
        role="status"
        aria-live="polite"
        className="absolute bottom-[calc(2.25rem+env(safe-area-inset-bottom))] text-sm text-white/80 sm:bottom-6"
        dir="ltr"
      >
        {index + 1} / {photos.length}
      </span>
    </dialog>
  );
}

export function ProjectPhotoGallery() {
  const { t, language } = useLanguage();
  const [photos, setPhotos] = useState<GalleryImageDto[]>([]);
  const [filter, setFilter] = useState<PhotoFilter>('ALL');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    void listGalleryImages()
      .then((items) => {
        if (mounted)
          setPhotos(
            items.filter(
              (photo) =>
                photo.is_active &&
                (photo.category === 'LOCAL' ||
                  photo.category === 'INTERNATIONAL'),
            ),
          );
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [attempt]);

  const visiblePhotos = photos.filter(
    (photo) => filter === 'ALL' || photo.category === filter,
  );
  const selectedIndex = visiblePhotos.findIndex(
    (photo) => photo.id === selectedId,
  );

  return (
    <section
      className="bg-brand-navy py-12 text-white sm:py-16 md:py-24"
      aria-labelledby="project-photo-gallery"
    >
      <div className="container mx-auto px-4">
        <div id="project-photo-gallery">
          <SectionHeader
            title={t('עוד מהעבודות שלנו', 'More of our work')}
            subtitle={t(
              'גלריית תמונות מפרויקטים בארץ ובחו״ל.',
              'A visual collection of local and international projects.',
            )}
            centered
            className="mb-6 max-sm:[&_h2]:text-2xl max-sm:[&_p]:text-sm max-sm:[&_p]:leading-6 sm:mb-12"
          />
        </div>
        <div
          className="mb-6 grid grid-cols-3 items-center gap-2 sm:mb-10 sm:flex sm:flex-wrap sm:justify-center sm:gap-3"
          role="group"
          aria-label={t('סינון לפי מיקום', 'Filter by location')}
        >
          {PHOTO_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => {
                setFilter(key);
                setSelectedId(null);
              }}
              className={`min-h-11 whitespace-nowrap rounded-full px-1 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold sm:px-5 lg:min-h-0 ${filter === key ? 'bg-brand-gold text-brand-navy' : 'border border-white/20 text-brand-silver hover:border-brand-gold hover:text-white'}`}
            >
              {projectFilterLabel(key, language)}
            </button>
          ))}
        </div>
        {loading ? (
          <div
            role="status"
            aria-label={t('טוען תמונות…', 'Loading photos…')}
            className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-3"
          >
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="aspect-[4/3] rounded-lg bg-white/5 motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="py-12 text-center text-brand-silver">
            <p>
              {t(
                'טעינת התמונות נכשלה. נסו שוב.',
                'Could not load photos. Please try again.',
              )}
            </p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-4 rounded border border-white/30 px-5 py-3 text-white hover:border-brand-gold"
            >
              {t('נסו שוב', 'Try again')}
            </button>
          </div>
        ) : visiblePhotos.length === 0 ? (
          <p role="status" className="py-12 text-center text-brand-silver">
            {photos.length === 0
              ? t('אין תמונות בגלריה.', 'No gallery photos yet.')
              : t('אין תמונות בקטגוריה זו.', 'No photos in this category yet.')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 lg:grid-cols-3">
            {visiblePhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedId(photo.id)}
                aria-label={`${t('פתיחת תמונה', 'Open photo')} ${index + 1} — ${projectFilterLabel(photo.category as GalleryLocation, language)}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5 text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
              >
                <PhotoImage photo={photo} />
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedIndex >= 0 && (
        <PhotoViewer
          photos={visiblePhotos}
          index={selectedIndex}
          onChange={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
