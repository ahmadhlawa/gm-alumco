import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { createSiteContent, listAdminSiteContent, updateSiteContent } from '@/api/content';
import type { JsonValue, SiteContentDto } from '@/api/types';
import { defaultPublicStats, normalizePublicStatsContent, type PublicStat, type PublicStatsContent } from '@/data/publicStats';

type StatGroupKey = 'heroStats' | 'aboutPreviewStats' | 'aboutPageStats' | 'valueChips';

const groups: Array<{ key: StatGroupKey; title: string }> = [
  { key: 'heroStats', title: 'Hero stats' },
  { key: 'aboutPreviewStats', title: 'Homepage about stats' },
  { key: 'aboutPageStats', title: 'About page stats' },
  { key: 'valueChips', title: 'Hero value chips' },
];

function asJson(value: PublicStatsContent): JsonValue {
  return value as unknown as JsonValue;
}

function StatEditor({
  stat,
  onChange,
}: {
  stat: PublicStat;
  onChange: (stat: PublicStat) => void;
}) {
  // Hebrew + English only. The existing label.ar value is kept in state and
  // re-serialized on save (never cleared); it is simply not edited here.
  return (
    <div className="grid gap-3 rounded border border-white/10 bg-brand-navy p-4 md:grid-cols-5">
      <input value={stat.value} onChange={(e) => onChange({ ...stat, value: e.target.value })} className="rounded bg-brand-surface px-3 py-2 text-white" placeholder="value" dir="ltr" />
      <input value={stat.suffix ?? ''} onChange={(e) => onChange({ ...stat, suffix: e.target.value })} className="rounded bg-brand-surface px-3 py-2 text-white" placeholder="suffix" dir="ltr" />
      <input value={stat.label.he} onChange={(e) => onChange({ ...stat, label: { ...stat.label, he: e.target.value } })} className="rounded bg-brand-surface px-3 py-2 text-white" placeholder="label_he" dir="rtl" />
      <input value={stat.label.en} onChange={(e) => onChange({ ...stat, label: { ...stat.label, en: e.target.value } })} className="rounded bg-brand-surface px-3 py-2 text-white" placeholder="label_en" dir="ltr" />
      <div className="flex items-center gap-2">
        <input type="number" value={stat.sort_order ?? 0} onChange={(e) => onChange({ ...stat, sort_order: Number(e.target.value) })} className="w-20 rounded bg-brand-surface px-3 py-2 text-white" />
        <label className="flex items-center gap-2 text-xs text-brand-silver">
          <input type="checkbox" checked={stat.is_active !== false} onChange={(e) => onChange({ ...stat, is_active: e.target.checked })} />
          active
        </label>
      </div>
    </div>
  );
}

export function AdminPublicStats() {
  const [content, setContent] = useState<PublicStatsContent>(defaultPublicStats);
  const [row, setRow] = useState<SiteContentDto | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    listAdminSiteContent().then((rows) => {
      const existing = rows.find((item) => item.section === 'public_stats' && item.key === 'content');
      setRow(existing ?? null);
      setContent(normalizePublicStatsContent(existing?.value));
    }).catch(() => setStatus('Could not load stats. Defaults are shown.'));
  }, []);

  const updateGroup = (key: StatGroupKey, index: number, stat: PublicStat) => {
    setContent((current) => {
      const next = { ...current, [key]: [...current[key]] };
      next[key][index] = stat;
      return next;
    });
  };

  const save = async () => {
    setStatus('Saving...');
    const payload = { section: 'public_stats', key: 'content', value: asJson(content), content_type: 'json', is_active: true };
    const saved = row
      ? await updateSiteContent(row.id, { value: asJson(content), is_active: true })
      : await createSiteContent(payload);
    setRow(saved);
    setStatus('Stats saved.');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Public website stats</h2>
          <p className="text-sm text-brand-silver">Edit T.A.S public counters, value chips, labels, order, and visibility.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setContent(defaultPublicStats)} className="inline-flex items-center gap-2 rounded bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> Reset defaults
          </button>
          <button onClick={() => void save()} className="inline-flex items-center gap-2 rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy hover:bg-[#e3c454]">
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.key} className="space-y-3 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
          <h3 className="text-lg font-bold text-brand-gold">{group.title}</h3>
          {content[group.key].map((stat, index) => (
            <StatEditor key={stat.id} stat={stat} onChange={(next) => updateGroup(group.key, index, next)} />
          ))}
        </section>
      ))}

      <section className="space-y-3 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h3 className="text-lg font-bold text-brand-gold">About image highlight</h3>
        <StatEditor stat={content.aboutHighlight} onChange={(aboutHighlight) => setContent((current) => ({ ...current, aboutHighlight }))} />
      </section>

      <section className="space-y-3 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h3 className="text-lg font-bold text-brand-gold">Hero since year</h3>
        <StatEditor stat={content.heroSince} onChange={(heroSince) => setContent((current) => ({ ...current, heroSince }))} />
      </section>

      {status && <p className="text-sm text-brand-silver">{status}</p>}
    </div>
  );
}
