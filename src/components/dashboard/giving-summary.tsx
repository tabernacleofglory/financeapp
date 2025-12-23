
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { FinancialRecord } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Timestamp } from 'firebase/firestore';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

interface GivingSummaryProps {
  records?: FinancialRecord[];
}

export function GivingSummary({ records }: GivingSummaryProps) {
  const summary = React.useMemo(() => {
    if (!records) {
      return { thisWeek: 0, lastWeek: 0, projected: 0 };
    }

    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    
    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfWeek.getDate() - 7);

    const thisWeekRecords = records.filter(r => {
        const recordDate = r.date instanceof Timestamp ? r.date.toDate() : new Date(r.date);
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
    });

    const lastWeekRecords = records.filter(r => {
        const recordDate = r.date instanceof Timestamp ? r.date.toDate() : new Date(r.date);
        return recordDate >= startOfLastWeek && recordDate <= endOfLastWeek;
    });

    const thisWeekTotal = thisWeekRecords.reduce((sum, r) => sum + r.amount, 0);
    const lastWeekTotal = lastWeekRecords.reduce((sum, r) => sum + r.amount, 0);
    const projected = thisWeekTotal > 0 ? thisWeekTotal + (thisWeekTotal - lastWeekTotal) : 0;

    return { thisWeek: thisWeekTotal, lastWeek: lastWeekTotal, projected };
  }, [records]);

  const isLoading = records === undefined;

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
            <span className="text-sm text-muted-foreground">THIS WEEK</span>
            <span className="font-semibold">{formatCurrency(summary.thisWeek)}</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">LAST WEEK</span>
            <span className="font-semibold">{formatCurrency(summary.lastWeek)}</span>
        </div>
        <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">PROJECTED</span>
            <span className="font-semibold">{formatCurrency(summary.projected)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
