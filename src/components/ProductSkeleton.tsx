import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductSkeletonProps {
  className?: string;
}

/** Single product card skeleton - matches ProductCard layout for no layout shift */
const ProductSkeleton = ({ className }: ProductSkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Image - aspect-square like ProductCard */}
      <Skeleton className="aspect-square w-full rounded-none skeleton-shimmer" />
      {/* Info - same padding as ProductCard */}
      <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
        <Skeleton className="h-4 sm:h-5 w-full max-w-[95%] rounded skeleton-shimmer" />
        <Skeleton className="h-3 sm:h-4 w-full max-w-[85%] rounded skeleton-shimmer" />
        <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
          <Skeleton className="h-4 sm:h-5 w-20 rounded skeleton-shimmer" />
          <Skeleton className="h-3 w-14 rounded skeleton-shimmer" />
        </div>
        <Skeleton className="h-3 w-24 rounded skeleton-shimmer" />
        <div className="flex flex-col gap-2 mt-1 sm:mt-2">
          <Skeleton className="h-8 sm:h-9 w-full rounded skeleton-shimmer" />
          <Skeleton className="h-8 sm:h-9 w-full rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

/** Grid of product skeletons - use for product list loading state */
interface ProductSkeletonGridProps {
  count?: number;
  gridClass?: string;
}

export const ProductSkeletonGrid = ({
  count = 8,
  gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
}: ProductSkeletonGridProps) => {
  return (
    <div className={`grid gap-2 sm:gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};

/** Category pill skeletons for homepage */
export const CategorySkeletonGrid = () => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl"
        >
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl skeleton-shimmer" />
          <Skeleton className="h-3 w-12 sm:w-14 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
