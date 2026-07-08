import {
  DashboardSkeleton,
  PageSkeleton,
  ProductionProjectSkeletons,
  Skeleton,
  SkeletonForm,
  SkeletonGrid,
  SkeletonTable,
} from './Skeleton';

export type LoadingVariant =
  | 'generic'
  | 'page'
  | 'card-grid'
  | 'admin-grid'
  | 'production-cards'
  | 'table'
  | 'form'
  | 'dashboard';

interface LoadingStateProps {
  message?: string;
  variant?: LoadingVariant;
  count?: number;
}

export function LoadingState({ variant = 'generic', count }: LoadingStateProps) {
  const content = (() => {
    switch (variant) {
      case 'page':
        return <PageSkeleton />;
      case 'card-grid':
        return <SkeletonGrid count={count ?? 6} />;
      case 'admin-grid':
        return <SkeletonGrid count={count ?? 6} admin />;
      case 'production-cards':
        return <ProductionProjectSkeletons count={count ?? 3} />;
      case 'table':
        return <SkeletonTable rows={count ?? 6} />;
      case 'form':
        return <SkeletonForm />;
      case 'dashboard':
        return <DashboardSkeleton />;
      default:
        return (
          <div className="mx-auto max-w-3xl space-y-4 py-12">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        );
    }
  })();

  return (
    <div aria-busy="true" data-loading-variant={variant}>
      {content}
    </div>
  );
}
