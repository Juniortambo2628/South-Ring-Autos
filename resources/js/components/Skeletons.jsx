import React from 'react';

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
);

export const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
    </div>
);

export const SkeletonRow = () => (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 space-x-4">
        <div className="flex items-center space-x-4 flex-grow">
            <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
    </div>
);
