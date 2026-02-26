interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-8" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ParkingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-16 mb-3" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
