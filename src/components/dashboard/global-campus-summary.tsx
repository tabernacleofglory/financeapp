
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Campus, FinancialRecord } from '@/lib/types';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

interface CampusOfferingData {
    campus: string;
    attendance: number;
    reported: number;
    ratio: number;
    change: number;
}

interface GlobalCampusSummaryProps {
    campuses: Campus[];
    currentRecords: FinancialRecord[];
    previousRecords: FinancialRecord[];
}

const GIVING_CATEGORIES = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'First Foots'];

export function GlobalCampusSummary({ campuses, currentRecords, previousRecords }: GlobalCampusSummaryProps) {
    const campusData = React.useMemo(() => {
        if (!campuses) return [];

        return campuses.map(campus => {
            const thisPeriodCampusEntries = currentRecords.filter(entry => entry.campus === campus.name);
            const lastPeriodCampusEntries = previousRecords.filter(entry => entry.campus === campus.name);

            const thisPeriodReported = thisPeriodCampusEntries
                .filter(e => GIVING_CATEGORIES.includes(e.category))
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            
            const thisPeriodAttendance = thisPeriodCampusEntries
                .filter(e => e.category === 'Attendance')
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            
            const lastPeriodReported = lastPeriodCampusEntries
                .filter(e => GIVING_CATEGORIES.includes(e.category))
                .reduce((sum, entry) => sum + (entry.amount || 0), 0);

            const ratio = thisPeriodAttendance > 0 ? thisPeriodReported / thisPeriodAttendance : 0;
            const change = lastPeriodReported > 0 ? ((thisPeriodReported - lastPeriodReported) / lastPeriodReported) * 100 : thisPeriodReported > 0 ? 100 : 0;

            return {
                campus: campus.name,
                attendance: thisPeriodAttendance,
                reported: thisPeriodReported,
                ratio,
                change,
            };
        });

    }, [campuses, currentRecords, previousRecords]);

    const isLoading = !currentRecords || !previousRecords;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Campus Summary</CardTitle>
            <CardDescription>Performance across all campuses for the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CAMPUSES</TableHead>
                        <TableHead className="text-right">Attendance</TableHead>
                        <TableHead className="text-right">Reported</TableHead>
                        <TableHead className="text-right">Ratio per Giver</TableHead>
                        <TableHead className="text-right">CHG%</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : campusData.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{item.campus}</TableCell>
                            <TableCell className="text-right">{item.attendance.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{item.reported > 0 ? formatCurrency(item.reported) : '-'}</TableCell>
                            <TableCell className="text-right">{item.ratio > 0 ? formatCurrency(item.ratio) : '-'}</TableCell>
                            <TableCell className={cn("text-right flex items-center justify-end gap-1", item.change > 0 ? "text-green-600" : item.change < 0 ? "text-red-600" : "text-muted-foreground")}>
                                {item.change !== 0 && (
                                  item.change > 0 ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>
                                )}
                                {item.change.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && campusData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">No campus data for this period.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
