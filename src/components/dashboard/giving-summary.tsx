
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialRecord } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

interface GivingSummaryProps {
  records?: FinancialRecord[];
  previousRecords?: FinancialRecord[];
  projectionPercent?: number | null;
}

export function GivingSummary({ records, previousRecords, projectionPercent }: GivingSummaryProps) {
  const summary = React.useMemo(() => {
    if (!records || !previousRecords) {
      return { currentPeriod: 0, previousPeriod: 0, projected: 0 };
    }

    const currentPeriodTotal = records.reduce((sum, r) => sum + r.amount, 0);
    const previousPeriodTotal = previousRecords.reduce((sum, r) => sum + r.amount, 0);

    // Use the projection percentage if available, otherwise default to 0% growth
    const projected = currentPeriodTotal * (1 + ((projectionPercent || 0) / 100));

    return { currentPeriod: currentPeriodTotal, previousPeriod: previousPeriodTotal, projected };
  }, [records, previousRecords, projectionPercent]);

  const isLoading = records === undefined || previousRecords === undefined;

  if (isLoading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Giving Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className='space-y-2'>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-40" />
            </div>
             <div className='space-y-2'>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-40" />
            </div>
             <div className='space-y-2'>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-40" />
            </div>
        </CardContent>
      </Card>
    )
  }
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giving Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">CURRENT PERIOD</span>
            <span className="font-semibold">{formatCurrency(summary.currentPeriod)}</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">PREVIOUS PERIOD</span>
            <span className="font-semibold">{formatCurrency(summary.previousPeriod)}</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
                PROJECTED {projectionPercent !== null && projectionPercent !== undefined && `(${projectionPercent}%)`}
            </span>
            <span className="font-semibold">{formatCurrency(summary.projected)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
