
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Campus, FinancialRecord, Region } from '@/lib/types';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

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
    region?: string;
}

interface GlobalCampusSummaryProps {
    campuses: Campus[];
    regions: Region[];
    currentRecords: FinancialRecord[];
    previousRecords: FinancialRecord[];
}

const GIVING_CATEGORIES = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings'];

export function GlobalCampusSummary({ campuses, regions, currentRecords, previousRecords }: GlobalCampusSummaryProps) {
    const groupedData = React.useMemo(() => {
        if (!campuses || !regions) return {};

        const dataByRegion: { [key: string]: CampusOfferingData[] } = {};

        campuses.forEach(campus => {
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
            
            const campusData = {
                campus: campus.name,
                attendance: thisPeriodAttendance,
                reported: thisPeriodReported,
                ratio,
                change,
                region: campus.region || 'Uncategorized',
            };

            const region = campusData.region;
            if (!dataByRegion[region]) {
                dataByRegion[region] = [];
            }
            dataByRegion[region].push(campusData);
        });

        const regionOrderMap = new Map(regions.map(r => [r.name, r.order]));

        const sortedRegions = Object.keys(dataByRegion).sort((a, b) => {
            const orderA = regionOrderMap.get(a) ?? Infinity;
            const orderB = regionOrderMap.get(b) ?? Infinity;

            if (a === 'Uncategorized') return 1;
            if (b === 'Uncategorized') return -1;

            if (orderA === orderB) {
                return a.localeCompare(b);
            }
            return orderA - orderB;
        });

        const sortedGroupedData: { [key: string]: CampusOfferingData[] } = {};
        sortedRegions.forEach(region => {
            sortedGroupedData[region] = dataByRegion[region];
        });

        return sortedGroupedData;

    }, [campuses, regions, currentRecords, previousRecords]);

    const isLoading = !currentRecords || !previousRecords;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Campus Summary</CardTitle>
            <CardDescription>Performance across all campuses for the selected period, grouped by region.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                       <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : Object.keys(groupedData).length > 0 ? (
                <Accordion type="multiple" className="w-full" defaultValue={Object.keys(groupedData)}>
                    {Object.entries(groupedData).map(([region, campusData]) => (
                        <AccordionItem value={region} key={region}>
                            <AccordionTrigger className='text-lg font-medium'>{region}</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>CAMPUS</TableHead>
                                            <TableHead className="text-right">Attendance</TableHead>
                                            <TableHead className="text-right">Reported</TableHead>
                                            <TableHead className="text-right">Ratio per Giver</TableHead>
                                            <TableHead className="text-right">CHG%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campusData.map((item, index) => (
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
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    No campus data available for this period.
                </div>
            )}
        </CardContent>
    </Card>
  );
}
