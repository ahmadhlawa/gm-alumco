import { CheckCircle2 } from 'lucide-react';
import type { Locale } from '@/api/types';
import { parseAboutBody } from '@/lib/aboutBody';

export function AboutBody({ text, language }: { text: string; language: Locale }) {
  return (
    <div dir={language === 'he' ? 'rtl' : 'ltr'} className="space-y-6">
      {parseAboutBody(text).map((block, index) => block.type === 'paragraph' ? (
        <p key={index} className="text-brand-silver leading-relaxed text-lg whitespace-pre-line break-words">{block.text}</p>
      ) : (
        <ul key={index} className="space-y-4">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-3 text-white font-medium">
              <CheckCircle2 aria-hidden="true" className="text-brand-gold w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
