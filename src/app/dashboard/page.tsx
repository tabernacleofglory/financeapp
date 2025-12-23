
'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users, HandHeart, Percent, Heart, Wheat, Pencil } from "lucide-react";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { FinancialCharts } from "@/components/dashboard/financial-charts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GivingEntryForm } from "@/components/entries/giving-entry-form";
import type { KpiData, FinancialRecord, Campus } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { DateRange } from 'react-day-picker';
import { addDays, differenceInDays } from 'date-fns';
import { GivingSummary } from '@/components/dashboard/giving-summary';
import { GlobalCampusSummary } from '@/components/dashboard/global-campus-summary';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

const KpiCard = ({ kpi }: { kpi: KpiData }) => {
  const Icon = {
    'Total Giving': DollarSign,
    'Total Attendance': Users,
    'Offerings': HandHeart,
    'Tithes': Percent,
    '365 Offerings': Heart,
    'First Fruit Offerings': Wheat,
    'Salomon Offerings': Pencil,
    'First Foots': DollarSign,
  }[kpi.title] || DollarSign;

  const ChangeIcon = kpi.changeType === 'increase' ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span className={`flex items-center gap-1 ${kpi.changeType === 'increase' ? 'text-green-600' : kpi.changeType === 'decrease' ? 'text-red-600' : ''}`}>
             {kpi.changeType !== 'neutral' && <ChangeIcon className="h-3 w-3" />}
            {kpi.change}
          </span>
          <span className="ml-1">{kpi.description}</span>
        </p>
      </CardContent>
    </Card>
  );
};


export default function DashboardPage() {
    const firestore = useFirestore();
    const [kpiData, setKpiData] = useState<KpiData[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [previousPeriodRecords, setPreviousPeriodRecords] = useState<FinancialRecord[]>([]);

    const campusesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'campuses') : null, [firestore]);
    const { data: campuses } = useCollection<Campus>(campusesQuery);

    useEffect(() => {
        if (!firestore || !dateRange?.from || !dateRange?.to) {
            // Set empty state if no date range
            const emptyKpis: KpiData[] = [
                { title: 'Total Giving', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: 'Total Attendance', value: '0', change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: 'Offerings', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: 'Tithes', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: '365 Offerings', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: 'First Fruit Offerings', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: 'Salomon Offerings', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
            ];
            setKpiData(emptyKpis);
            setChartData([]);
            setFinancialRecords([]);
            setPreviousPeriodRecords([]);
            return;
        }

        const fetchData = async () => {
            const currentPeriodStart = dateRange.from!;
            const currentPeriodEnd = dateRange.to!;
            const daysDifference = differenceInDays(currentPeriodEnd, currentPeriodStart);

            const previousPeriodEnd = addDays(currentPeriodStart, -1);
            const previousPeriodStart = addDays(previousPeriodEnd, -daysDifference);

            const financialRecordsRef = collection(firestore, 'financial_records');

            const currentPeriodQuery = query(financialRecordsRef, 
                where('date', '>=', Timestamp.fromDate(currentPeriodStart)), 
                where('date', '<=', Timestamp.fromDate(currentPeriodEnd))
            );
            const previousPeriodQuery = query(financialRecordsRef, 
                where('date', '>=', Timestamp.fromDate(previousPeriodStart)), 
                where('date', '<=', Timestamp.fromDate(previousPeriodEnd))
            );

            const [currentSnapshot, previousSnapshot] = await Promise.all([
                getDocs(currentPeriodQuery),
                getDocs(previousPeriodQuery)
            ]);

            const currentRecords = currentSnapshot.docs.map(doc => {
              const data = doc.data() as FinancialRecord;
              if (data.date instanceof Timestamp) {
                  data.date = data.date.toDate();
              }
              return data;
            });
            setFinancialRecords(currentRecords);

            const previousRecords = previousSnapshot.docs.map(doc => {
              const data = doc.data() as FinancialRecord;
               if (data.date instanceof Timestamp) {
                  data.date = data.date.toDate();
              }
              return data;
            });
            setPreviousPeriodRecords(previousRecords);

            const givingCategories = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'First Foots'];
            const allCategories = [...givingCategories, 'Total Attendance', 'Total Giving'];

            const calculateTotals = (records: FinancialRecord[]) => {
                const totals = allCategories.reduce((acc, category) => {
                    acc[category] = 0;
                    return acc;
                }, {} as Record<string, number>);

                records.forEach(r => {
                    if (r.category === 'Attendance') {
                        totals['Total Attendance'] += r.amount || 0;
                    } else if (givingCategories.includes(r.category)) {
                        totals[r.category] = (totals[r.category] || 0) + (r.amount || 0);
                    }
                });
                
                totals['Total Giving'] = givingCategories.reduce((sum, cat) => sum + (totals[cat] || 0), 0);
                return totals;
            };

            const currentTotals = calculateTotals(currentRecords);
            const previousTotals = calculateTotals(previousRecords);
            
            const createKpi = (title: string, isCurrency: boolean): KpiData => {
                const current = currentTotals[title] || 0;
                const previous = previousTotals[title] || 0;
                const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
                
                return {
                    title,
                    value: isCurrency ? formatCurrency(current) : current.toLocaleString(),
                    change: `${change.toFixed(1)}%`,
                    changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
                    description: 'vs. previous period'
                };
            };
            
            const newKpiData: KpiData[] = [
                createKpi('Total Giving', true),
                createKpi('Total Attendance', false),
                createKpi('Offerings', true),
                createKpi('Tithes', true),
                createKpi('365 Offerings', true),
                createKpi('First Fruit Offerings', true),
                createKpi('Salomon Offerings', true),
            ];

            setKpiData(newKpiData);
            
            const dailyData: Record<string, any> = {};
            currentRecords.forEach(record => {
                const dateStr = record.date.toISOString().split('T')[0];
                if (!dailyData[dateStr]) {
                    dailyData[dateStr] = { date: dateStr };
                    allCategories.forEach(cat => dailyData[dateStr][cat] = 0);
                }
                dailyData[dateStr][record.category] += record.amount;
            });
            setChartData(Object.values(dailyData).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        };

        fetchData();
    }, [firestore, dateRange]);


  return (
    <>
      <PageHeader title="Dashboard" description="Here's a snapshot of your financial health.">
        <div className="flex items-center space-x-2">
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
             <Dialog>
                <DialogTrigger asChild>
                    <Button>Add Record</Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] md:max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Giving Entry</DialogTitle>
                        <DialogDescription>
                            Enter the details of the contribution.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-grow">
                        <div className="px-1">
                            <GivingEntryForm />
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
      </PageHeader>
      <div className="grid gap-6 grid-cols-1">
        <div>
            <GivingSummary records={financialRecords.filter(r => r.category !== 'Attendance')} />
        </div>
        <div className="mt-6">
            <GlobalCampusSummary 
                campuses={campuses || []} 
                currentRecords={financialRecords} 
                previousRecords={previousPeriodRecords}
            />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.title} kpi={kpi} />
        ))}
      </div>
      <div className="mt-6">
        <FinancialCharts data={chartData}/>
      </div>
    </>
  );
}
