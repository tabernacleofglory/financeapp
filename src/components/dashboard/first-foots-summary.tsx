
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { FinancialRecord } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

export function FirstFootsSummary() {
    const firestore = useFirestore();
    const recordsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, "financial_records"), where("category", "==", "First Foots")) : null,
        [firestore]
    );

    const { data: records, isLoading } = useCollection<FinancialRecord>(recordsQuery);

    const summary = React.useMemo(() => {
        if (!records || records.length === 0) {
            return {
                sum: 0,
                mean: 0,
                stdDev: 0,
                count: 0
            };
        }

        const amounts = records.map(r => r.amount);
        const count = amounts.length;
        const sum = amounts.reduce((acc, val) => acc + val, 0);
        const mean = sum / count;
        const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / count);

        return { sum, mean, stdDev, count };
    }, [records]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>First Foots Summary</CardTitle>
                <CardDescription>An overview of all "First Foots" contributions.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Contributions</p>
                            <p className="text-2xl font-bold">{formatCurrency(summary.sum)}</p>
                            <p className="text-xs text-muted-foreground">{summary.count} entries</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Contribution</p>
                            <p className="text-2xl font-bold">{formatCurrency(summary.mean)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Standard Deviation</p>
                            <p className="text-2xl font-bold">{formatCurrency(summary.stdDev)}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
