
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { Campus, FinancialRecord, Projection } from '@/lib/types';

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

export default function SalomonPage() {
  const [summaryData, setSummaryData] = React.useState({ thisWeek: 0, lastWeek: 0, projected: 0 });
  const [campusData, setCampusData] = React.useState<CampusOfferingData[]>([]);
  const [projectionPercent, setProjectionPercent] = React.useState<number | null>(null);
  const firestore = useFirestore();

  const campusesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'campuses') : null, [firestore]);
  const { data: campuses } = useCollection<Campus>(campusesQuery);

  const currentYear = new Date().getFullYear();
  const projectionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projections'), where('year', '==', currentYear)) : null, [firestore]);
  const { data: projections } = useCollection<Projection>(projectionsQuery);

  React.useEffect(() => {
    if (projections && projections.length > 0) {
      setProjectionPercent(projections[0].projection);
    } else {
      setProjectionPercent(null);
    }
  }, [projections]);

  React.useEffect(() => {
    if (!firestore || !campuses) return;

    const fetchData = async () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);

        const financialRecordsQuery = collection(firestore, 'financial_records');
        
        const thisWeekQuery = query(financialRecordsQuery, where('date', '>=', Timestamp.fromDate(startOfWeek)), where('date', '<=', Timestamp.fromDate(endOfWeek)));
        const lastWeekQuery = query(financialRecordsQuery, where('date', '>=', Timestamp.fromDate(startOfLastWeek)), where('date', '<=', Timestamp.fromDate(endOfLastWeek)));

        const [thisWeekSnapshot, lastWeekSnapshot] = await Promise.all([
            getDocs(thisWeekQuery),
            getDocs(lastWeekQuery)
        ]);

        const thisWeekEntries = thisWeekSnapshot.docs.map(doc => {
            const data = doc.data() as FinancialRecord;
            if (data.date instanceof Timestamp) {
                data.date = data.date.toDate();
            }
            return data;
        });
        const lastWeekEntries = lastWeekSnapshot.docs.map(doc => {
            const data = doc.data() as FinancialRecord;
            if (data.date instanceof Timestamp) {
                data.date = data.date.toDate();
            }
            return data;
        });

        const thisWeekTotal = thisWeekEntries.filter(e => e.category === 'Salomon Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const lastWeekTotal = lastWeekEntries.filter(e => e.category === 'Salomon Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);

        const calculatedProjected = thisWeekTotal * (1 + ((projectionPercent || 0) / 100));

        setSummaryData({
            thisWeek: thisWeekTotal,
            lastWeek: lastWeekTotal,
            projected: calculatedProjected,
        });

        const aggregatedCampusData = campuses.map(campus => {
            const thisWeekCampusEntries = thisWeekEntries.filter(entry => entry.campus === campus.name);
            const lastWeekCampusEntries = lastWeekEntries.filter(entry => entry.campus === campus.name);

            const thisWeekReported = thisWeekCampusEntries.filter(e => e.category === 'Salomon Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);
            const thisWeekAttendance = thisWeekCampusEntries.filter(e => e.category === 'Attendance').reduce((sum, entry) => sum + (entry.amount || 0), 0);
            
            const lastWeekReported = lastWeekCampusEntries.filter(e => e.category === 'Salomon Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);

            const ratio = thisWeekAttendance > 0 ? thisWeekReported / thisWeekAttendance : 0;
            const change = lastWeekReported > 0 ? ((thisWeekReported - lastWeekReported) / lastWeekReported) * 100 : thisWeekReported > 0 ? 100 : 0;

            return {
                campus: campus.name,
                attendance: thisWeekAttendance,
                reported: thisWeekReported,
                ratio,
                change,
            };
        });

        setCampusData(aggregatedCampusData);
    };

    fetchData();
  }, [firestore, campuses, projectionPercent]);


  return (
    <>
        <div className="relative w-full mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search Salomon..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-1/3 lg:w-1/4"
            />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="tracking-wider">SALOMON</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">THIS WEEK</span>
                        <span className="font-semibold">{formatCurrency(summaryData.thisWeek)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">LAST WEEK</span>
                        <span className="font-semibold">{formatCurrency(summaryData.lastWeek)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                            PROJECTED {projectionPercent !== null && `(${projectionPercent}%)`}
                        </span>
                        <span className="font-semibold">{formatCurrency(summaryData.projected)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 mt-6 lg:mt-0">
            <Card>
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
                            {campusData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.campus}</TableCell>
                                    <TableCell className="text-right">{item.attendance.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{item.reported > 0 ? formatCurrency(item.reported) : '-'}</TableCell>
                                    <TableCell className="text-right">{item.ratio > 0 ? item.ratio.toFixed(2) : '-'}</TableCell>
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
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
