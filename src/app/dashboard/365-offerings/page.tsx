
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, doc } from 'firebase/firestore';
import type { Campus, FinancialRecord, Projection, UserProfile, Region } from '@/lib/types';
import { RegionalCampusData, RegionalCampusSummaryTable } from '@/components/dashboard/regional-campus-summary-table';
import { useDateRange } from '@/context/DateRangeContext';
import { PageHeader } from '@/components/shared/page-header';
import { DateRangeSelector } from '@/components/shared/date-range-selector';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

export default function ThreeSixtyFiveOfferingsPage() {
  const [summaryData, setSummaryData] = React.useState({ currentPeriod: 0, previousPeriod: 0, projected: 0 });
  const [campusData, setCampusData] = React.useState<RegionalCampusData[]>([]);
  const [projectionPercent, setProjectionPercent] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const firestore = useFirestore();
  const { dateRange, getPreviousPeriod } = useDateRange();

  const { user } = useUser();
  const userDocRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const campusesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'campuses'), orderBy("name", "asc")) : null, [firestore]);
  const { data: campuses } = useCollection<Campus>(campusesQuery);

  const regionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'regions')) : null, [firestore]);
  const { data: regions } = useCollection<Region>(regionsQuery);

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
    const hasCampusAccess = userProfile?.campus && userProfile.campus.length > 0;
    const hasAllCampusAccess = userProfile?.campus === 'All Campuses';

    if (!firestore || !campuses || !userProfile || (!hasCampusAccess && !hasAllCampusAccess) || !dateRange?.from || !dateRange?.to) {
        setIsLoading(false);
        setSummaryData({ currentPeriod: 0, previousPeriod: 0, projected: 0 });
        setCampusData([]);
        return;
    }

    setIsLoading(true);
    const fetchData = async () => {
        const currentPeriodStart = dateRange.from!;
        const currentPeriodEnd = dateRange.to!;
        const { from: previousPeriodStart, to: previousPeriodEnd } = getPreviousPeriod(dateRange)!;

        const financialRecordsRef = collection(firestore, 'financial_records');
        
        const getRecordsForPeriod = async (start: Date, end: Date) => {
            const queryConstraints: any[] = [
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<=', Timestamp.fromDate(end))
            ];
            if (hasCampusAccess && !hasAllCampusAccess) {
                queryConstraints.push(where('campus', '==', userProfile.campus));
            }

            const q = query(financialRecordsRef, ...queryConstraints);
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data() as FinancialRecord;
                if (data.date instanceof Timestamp) {
                    data.date = data.date.toDate();
                }
                return data;
            });
        };

        const [currentPeriodEntries, previousPeriodEntries] = await Promise.all([
            getRecordsForPeriod(currentPeriodStart, currentPeriodEnd),
            getRecordsForPeriod(previousPeriodStart, previousPeriodEnd)
        ]);

        const currentPeriodTotal = currentPeriodEntries.filter(e => e.category === '365 Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const previousPeriodTotal = previousPeriodEntries.filter(e => e.category === '365 Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        const calculatedProjected = currentPeriodTotal * (1 + ((projectionPercent || 0) / 100));

        setSummaryData({
            currentPeriod: currentPeriodTotal,
            previousPeriod: previousPeriodTotal,
            projected: calculatedProjected,
        });

        const aggregatedCampusData = campuses.map(campus => {
            const thisWeekCampusEntries = currentPeriodEntries.filter(entry => entry.campus === campus.name);
            const lastWeekCampusEntries = previousPeriodEntries.filter(entry => entry.campus === campus.name);

            const thisWeekReported = thisWeekCampusEntries.filter(e => e.category === '365 Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);
            const thisWeekAttendance = thisWeekCampusEntries.filter(e => e.category === 'Attendance').reduce((sum, entry) => sum + (entry.amount || 0), 0);
            
            const lastWeekReported = lastWeekCampusEntries.filter(e => e.category === '365 Offerings').reduce((sum, entry) => sum + (entry.amount || 0), 0);

            const ratio = thisWeekAttendance > 0 ? thisWeekReported / thisWeekAttendance : 0;
            const change = lastWeekReported > 0 ? ((thisWeekReported - lastWeekReported) / lastWeekReported) * 100 : thisWeekReported > 0 ? 100 : 0;

            return {
                campus: campus.name,
                attendance: thisWeekAttendance,
                reported: thisWeekReported,
                ratio,
                change,
                region: campus.region || 'Uncategorized',
            };
        });

        setCampusData(aggregatedCampusData);
        setIsLoading(false);
    };

    fetchData();
  }, [firestore, campuses, projectionPercent, userProfile, dateRange, getPreviousPeriod]);


  return (
    <>
        <PageHeader title="365 Offerings">
            <DateRangeSelector />
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="tracking-wider">365 OFFERINGS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">CURRENT PERIOD</span>
                            <span className="font-semibold">{formatCurrency(summaryData.currentPeriod)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">PREVIOUS PERIOD</span>
                            <span className="font-semibold">{formatCurrency(summaryData.previousPeriod)}</span>
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

            <div className="lg:col-span-2">
                <RegionalCampusSummaryTable data={campusData} regions={regions || []} isLoading={isLoading} />
            </div>
        </div>
    </>
  );
}
