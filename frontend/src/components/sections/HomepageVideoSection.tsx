import { useEffect, useRef } from 'react';
import type { HomepageVideoSectionDto } from '@/api/types';
import { normalizeMediaUrl } from '@/lib/utils';

interface HomepageVideoSectionProps {
  section: HomepageVideoSectionDto | null;
}

/**
 * Cinematic autoplay video band for the public homepage — video only, no text.
 *
 * Renders nothing when the section is disabled or has no video. Autoplay is
 * muted + looped + inline (the only combination browsers allow to start on
 * load); when the visitor prefers reduced motion the video is paused.
 */
export function HomepageVideoSection({ section }: HomepageVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = section?.video_url ? normalizeMediaUrl(section.video_url) : '';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) {
      video.pause();
    }
  }, [videoUrl]);

  if (!section?.is_enabled || !section?.video_url) return null;

  return (
    <section aria-label="Video" className="w-full overflow-hidden bg-brand-navy px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto h-[52vh] min-h-[320px] w-full max-w-[1700px] md:h-[70vh]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          preload="metadata"
        />
      </div>
    </section>
  );
}
