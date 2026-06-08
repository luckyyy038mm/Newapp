'use client';

import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-700/50',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between">
        <Skeleton width={120} height={20} />
        <Skeleton width={60} height={20} />
      </div>
      <Skeleton width="100%" height={40} />
      <div className="flex gap-4">
        <Skeleton width={80} height={16} />
        <Skeleton width={80} height={16} />
      </div>
    </div>
  );
}