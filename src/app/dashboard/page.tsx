
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users, HandHeart, Percent, Heart, Wheat, Pencil, Download, Upload, Loader2 } from "lucide-react";
import { FinancialCharts } from "@/components/dashboard/financial-charts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GivingEntryForm } from "@/components/entries/giving-entry-form";
import type { KpiData, FinancialRecord, Campus, PermissionRow, UserProfile, Region, Projection } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, getDocs, query, where, Timestamp, orderBy, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { GivingSummary } from '@/components/dashboard/giving-summary';
import { GlobalCampusSummary } from '@/components/dashboard/global-campus-summary';
import { useAuthContext } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { useDateRange } from '@/context/DateRangeContext';
import { DateRangeSelector } from '@/components/shared/date-range-selector';

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
        {kpi.subValue && (
            <p className="text-xs text-muted-foreground">
                {kpi.subValue}
            </p>
        )}
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
    const { user } = useUser();
    const { toast } = useToast();
    const [kpiData, setKpiData] = useState<KpiData[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const { dateRange, getPreviousPeriod } = useDateRange();
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [previousPeriodRecords, setPreviousPeriodRecords] = useState<FinancialRecord[]>([]);
    const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [projectionPercent, setProjectionPercent] = useState<number | null>(null);

    const { userProfile } = useAuthContext();

    const permissionsDocRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'permissions', 'matrix') : null, [firestore, user]);
    const { data: permissionsData } = useDoc<{rules: PermissionRow[]}>(permissionsDocRef);
    
    const canAddRecord = useMemo(() => {
        if (!userProfile || !permissionsData?.rules) return false;
        const addRecordPermission = permissionsData.rules.find(p => p.feature === 'Dashboard > Add Record');
        if (!addRecordPermission) return false;
        const userRole = userProfile.role || 'Guest';
        return addRecordPermission.permissions[userRole] || false;
    }, [userProfile, permissionsData]);


    const campusesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'campuses'), orderBy("name", "asc")) : null, [firestore]);
    const { data: campuses } = useCollection<Campus>(campusesQuery);

    const regionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'regions'), orderBy("order", "asc")) : null, [firestore]);
    const { data: regions } = useCollection<Region>(regionsQuery);

    const currentYear = new Date().getFullYear();
    const projectionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projections'), where('year', '==', currentYear)) : null, [firestore]);
    const { data: projections } = useCollection<Projection>(projectionsQuery);

    useEffect(() => {
        if (projections && projections.length > 0) {
            setProjectionPercent(projections[0].projection);
        } else {
            setProjectionPercent(null);
        }
    }, [projections]);

    const handleDownloadTemplate = () => {
        const headers = 'reporterFullName,campus,date,serviceTime,serviceType,Offerings,Tithes,365 Offerings,First Fruit Offerings,Salomon Offerings,Attendance';
        const exampleRow = 'John Doe,Main Campus,2024-07-28,9:00:00 AM,SUNDAY_SERVICE,100,50,20,0,0,150';
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + exampleRow;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].type !== 'text/csv') {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please upload a valid .csv file.",
                });
                setImportFile(null);
                e.target.value = ''; // Reset file input
            } else {
                setImportFile(e.target.files[0]);
            }
        } else {
            setImportFile(null);
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            toast({
                variant: "destructive",
                title: "No File Selected",
                description: "Please select a CSV file to import.",
            });
            return;
        }
        if (!firestore || !user) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "Cannot import records. User or database not available.",
            });
            return;
        };

        setIsImporting(true);

        const Papa = (await import('papaparse')).default;

        Papa.parse(importFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const requiredHeaders = ['reporterFullName', 'campus', 'date', 'serviceTime', 'serviceType', 'Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'Attendance'];
                const fileHeaders = results.meta.fields || [];

                const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

                if (missingHeaders.length > 0) {
                    toast({
                        variant: "destructive",
                        title: "Invalid CSV Format",
                        description: `The following required columns are missing: ${missingHeaders.join(', ')}`,
                        duration: 10000,
                    });
                    setIsImporting(false);
                    return;
                }

                try {
                    const batch = writeBatch(firestore);
                    const recordsCollection = collection(firestore, "financial_records");

                    for (const row of results.data as any[]) {
                        const date = new Date(row.date + 'T00:00:00');
                        if (isNaN(date.getTime())) {
                            console.warn(`Skipping row due to invalid date: ${row.date}`, row);
                            continue;
                        }

                        const commonData = {
                            userId: user.uid,
                            reporterFullName: row.reporterFullName,
                            campus: row.campus,
                            date: Timestamp.fromDate(date),
                            serviceTime: row.serviceTime,
                            serviceType: row.serviceType,
                            createdAt: serverTimestamp(),
                        };
                        
                        const categories = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'Attendance'];

                        for (const category of categories) {
                            const amount = parseFloat(row[category]);
                            if (!isNaN(amount) && amount > 0) {
                                const recordData = {
                                    ...commonData,
                                    amount,
                                    category,
                                };
                                const newRecordRef = doc(recordsCollection);
                                batch.set(newRecordRef, recordData);
                            }
                        }
                    }

                    await batch.commit();

                    toast({
                        title: "Import Successful",
                        description: `${results.data.length} rows have been successfully imported.`,
                    });

                    setIsImportDialogOpen(false);
                    setImportFile(null);

                } catch (error) {
                    console.error("Error importing records:", error);
                    toast({
                        variant: "destructive",
                        title: "Import Failed",
                        description: "An error occurred while importing the records. Please check the file and try again.",
                    });
                } finally {
                    setIsImporting(false);
                }
            },
            error: (error) => {
                console.error("CSV Parsing Error:", error);
                toast({
                    variant: "destructive",
                    title: "CSV Parsing Error",
                    description: "Could not parse the CSV file. Please ensure it's a valid CSV.",
                });
                setIsImporting(false);
            }
        });
    };

    useEffect(() => {
        const hasCampusAccess = userProfile?.campus && userProfile.campus.length > 0;
        const hasAllCampusAccess = userProfile?.campus === 'All Campuses';

        if (!firestore || !dateRange?.from || !dateRange?.to || !userProfile || (!hasCampusAccess && !hasAllCampusAccess)) {
            // Set empty state if no date range
            const emptyKpis: KpiData[] = [
                { title: 'Total Giving', value: formatCurrency(0), change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
                { title: 'Total Attendance', value: '0', subValue: 'Max: 0 | Avg: 0', change: '0.0%', changeType: 'neutral', description: 'vs. previous period' },
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
            const currentPeriodStart = new Date(dateRange.from!);
            currentPeriodStart.setHours(0, 0, 0, 0);

            const currentPeriodEnd = new Date(dateRange.to!);
            currentPeriodEnd.setHours(23, 59, 59, 999);

            const { from: previousPeriodStart, to: previousPeriodEnd } = getPreviousPeriod(dateRange);

            const financialRecordsRef = collection(firestore, 'financial_records');
            
            const buildQuery = (start: Date, end: Date) => {
                const queryConstraints: any[] = [
                    where('date', '>=', Timestamp.fromDate(start)),
                    where('date', '<=', Timestamp.fromDate(end))
                ];
                if (hasCampusAccess && !hasAllCampusAccess) {
                    queryConstraints.push(where('campus', '==', userProfile.campus));
                }
                return query(financialRecordsRef, ...queryConstraints);
            }

            const currentPeriodQuery = buildQuery(currentPeriodStart, currentPeriodEnd);
            const previousPeriodQuery = buildQuery(previousPeriodStart, previousPeriodEnd);

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

            const givingCategories = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings'];
            const allCategories = [...givingCategories, 'Attendance', 'Total Giving'];

            const calculateTotals = (records: FinancialRecord[]) => {
                const totals: Record<string, number> = {};
                allCategories.forEach(c => totals[c] = 0);
                records.forEach(r => {
                    totals[r.category] = (totals[r.category] || 0) + (r.amount || 0);
                });
                totals['Total Giving'] = givingCategories.reduce((sum, cat) => sum + (totals[cat] || 0), 0);
                totals['Total Attendance'] = totals['Attendance'] || 0; // alias
                return totals;
            };

            const currentTotals = calculateTotals(currentRecords);
            const previousTotals = calculateTotals(previousRecords);
            
            const createKpi = (title: string, isCurrency: boolean): KpiData => {
                const totalKey = title === 'Total Attendance' ? 'Total Attendance' : title;
                const current = currentTotals[totalKey] || 0;
                const previous = previousTotals[totalKey] || 0;
                const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
                
                let subValue = '';
                if (title === 'Total Attendance') {
                    const attendanceRecords = currentRecords.filter(r => r.category === 'Attendance');
                    const totalAttendance = currentTotals['Attendance'];
                    const maxAttendance = attendanceRecords.length > 0 ? Math.max(...attendanceRecords.map(r => r.amount)) : 0;
                    const avgAttendance = attendanceRecords.length > 0 ? totalAttendance / attendanceRecords.length : 0;
                    subValue = `Max: ${maxAttendance.toLocaleString()} | Avg: ${avgAttendance.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
                }

                const kpi: KpiData = {
                    title,
                    value: isCurrency ? formatCurrency(current) : current.toLocaleString(),
                    change: `${change.toFixed(1)}%`,
                    changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
                    description: 'vs. previous period',
                    subValue: subValue,
                };
                
                return kpi;
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
    }, [firestore, dateRange, userProfile, getPreviousPeriod]);


  return (
    <>
      <PageHeader title="Dashboard" description="Here's a snapshot of your financial health.">
        <div className="flex items-center space-x-2">
            <DateRangeSelector />
             {canAddRecord && (
                <>
                  <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
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
                                  <GivingEntryForm 
                                      onSuccess={() => setIsAddRecordDialogOpen(false)}
                                      onCancel={() => setIsAddRecordDialogOpen(false)}
                                  />
                              </div>
                          </ScrollArea>
                      </DialogContent>
                  </Dialog>
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Import Record</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Import Records via CSV</DialogTitle>
                            <DialogDescription>
                                Follow the instructions below to format your CSV file for a successful import.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-grow pr-4 -mr-4">
                            <div className="prose prose-sm max-w-none text-sm text-foreground pr-4">
                                <p>Your CSV file must contain the following headers in the first row. The order of columns matters.</p>
                                <h4 className="font-semibold mt-4 text-base">Required Headers:</h4>
                                <pre className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap break-all">
                                    <code>reporterFullName,campus,date,serviceTime,serviceType,Offerings,Tithes,365 Offerings,First Fruit Offerings,Salomon Offerings,Attendance</code>
                                </pre>
                                <h4 className="font-semibold mt-4 text-base">Column Formatting Rules:</h4>
                                <div className="border rounded-lg overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="font-semibold">Column</TableHead>
                                                <TableHead className="font-semibold">Format</TableHead>
                                                <TableHead className="font-semibold">Example</TableHead>
                                                <TableHead className="font-semibold">Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>reporterFullName</TableCell>
                                                <TableCell>Text</TableCell>
                                                <TableCell>John Doe</TableCell>
                                                <TableCell>Full name of the person submitting the record.</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>campus</TableCell>
                                                <TableCell>Text</TableCell>
                                                <TableCell>Main Campus</TableCell>
                                                <TableCell>Must match an existing campus name exactly.</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>date</TableCell>
                                                <TableCell>YYYY-MM-DD</TableCell>
                                                <TableCell>2024-07-28</TableCell>
                                                <TableCell>Date of the service/event.</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>serviceTime</TableCell>
                                                <TableCell>Text</TableCell>
                                                <TableCell>9:00:00 AM</TableCell>
                                                <TableCell>Must match an existing service time value exactly.</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>serviceType</TableCell>
                                                <TableCell>Text</TableCell>
                                                <TableCell>SUNDAY_SERVICE</TableCell>
                                                <TableCell>Must match an existing service type value exactly.</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Offerings, Tithes, etc.</TableCell>
                                                <TableCell>Number</TableCell>
                                                <TableCell>1250.75</TableCell>
                                                <TableCell>Use numbers only, no currency symbols. Leave blank or use 0 if no amount.</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Attendance</TableCell>
                                                <TableCell>Integer</TableCell>
                                                <TableCell>150</TableCell>
                                                <TableCell>Whole numbers only. Leave blank or use 0 if not applicable.</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="csv-file">Upload CSV File</Label>
                            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleDownloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Template
                            </Button>
                            <Button onClick={handleImport} disabled={!importFile || isImporting}>
                                {isImporting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                                ) : (
                                    <><Upload className="mr-2 h-4 w-4" /> Import</>
                                )}
                            </Button>
                            <Button onClick={() => setIsImportDialogOpen(false)} variant="outline">Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </>
            )}
        </div>
      </PageHeader>
      <div className="space-y-6">
        <GivingSummary
            records={financialRecords.filter(r => r.category !== 'Attendance')}
            previousRecords={previousPeriodRecords.filter(r => r.category !== 'Attendance')}
            projectionPercent={projectionPercent}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
            <KpiCard key={kpi.title} kpi={kpi} />
            ))}
        </div>
        <FinancialCharts data={chartData}/>
        <GlobalCampusSummary 
            campuses={campuses || []} 
            regions={regions || []}
            currentRecords={financialRecords} 
            previousRecords={previousPeriodRecords}
        />
      </div>
    </>
  );
}
