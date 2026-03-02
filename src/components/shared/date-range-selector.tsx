
'use client';

import React from 'react';
import { useDateRange } from '@/context/DateRangeContext';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export function DateRangeSelector() {
    const { dateRange, setDateRange } = useDateRange();

    return (
        <div className="flex items-center gap-2">
            <Input
                type="date"
                value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                    const fromDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                    setDateRange((prev) => ({ from: fromDate, to: prev?.to }));
                }}
                className="w-auto"
            />
            <span className="text-muted-foreground">-</span>
            <Input
                type="date"
                value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                    const toDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                    setDateRange((prev) => ({ from: prev?.from, to: toDate }));
                }}
                className="w-auto"
            />
        </div>
    );
}
