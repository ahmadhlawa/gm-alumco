import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      data-skeleton="true"
      className={cn('animate-pulse rounded bg-white/[0.07]', className)}
    />
  );
}

export function SkeletonCard({ variant = 'standard' }: { variant?: 'standard' | 'admin' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-brand-navy/80">
      <Skeleton className={variant === 'admin' ? 'h-44 w-full' : 'h-56 w-full'} />
      <div className="space-y-4 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, admin = false }: { count?: number; admin?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={admin ? 'admin' : 'standard'} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-brand-navy">
      <div className="grid gap-4 border-b border-white/10 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4" />
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton key={columnIndex} className="h-5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className={index === 1 ? 'h-28 w-full rounded' : 'h-12 w-full rounded'} />
        </div>
      ))}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-12 rounded" />
        <Skeleton className="h-12 rounded" />
      </div>
      <Skeleton className="h-12 w-48 rounded" />
    </div>
  );
}

export function ProductionProjectSkeleton({ index }: { index: number }) {
  return (
    <div
      data-skeleton-card="production"
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-brand-gold/20 bg-brand-navy/80 shadow-2xl shadow-black/25',
        index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row',
      )}
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none lg:aspect-auto lg:min-h-[420px] lg:w-[58%]" />
      <div className="flex min-h-[360px] flex-1 flex-col justify-center gap-5 p-6 md:p-8 lg:w-[42%]">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-px w-16 bg-brand-gold/40" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-brand-gold/15 bg-black/15 p-4">
            <Skeleton className="mb-3 h-4 w-28" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="rounded-lg border border-brand-gold/15 bg-black/15 p-4">
            <Skeleton className="mb-3 h-4 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductionProjectSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-8 md:space-y-12">
      {Array.from({ length: count }).map((_, index) => (
        <ProductionProjectSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-white/10 bg-brand-navy p-5">
            <Skeleton className="mb-5 h-10 w-10 rounded" />
            <Skeleton className="mb-3 h-4 w-2/3" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonTable rows={5} columns={2} />
        <SkeletonTable rows={5} columns={2} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-12 py-10">
      <Skeleton className="mx-auto h-10 w-72" />
      <SkeletonGrid count={3} />
      <SkeletonGrid count={3} />
    </div>
  );
}
