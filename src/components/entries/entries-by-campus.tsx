
"use client";

import React from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, deleteDoc, doc, orderBy, query, writeBatch } from "firebase/firestore";
import type { FinancialRecord } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

const GIVING_CATEGORIES = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'First Foots'];
const ALL_CATEGORIES = [...GIVING_CATEGORIES, 'Attendance'];


export interface GroupedEntry {
    id: string; // Composite key
    docIds: Record<string, string>; // category -> docId
    campus: string;
    reporterFullName: string;
    date: any;
    serviceTime: string;
    serviceType: string;
    [key: string]: number | string | any;
}


const ActionsCell = ({ entry, onEdit }: { entry: GroupedEntry; onEdit: (entry: GroupedEntry) => void; }) => {
    const firestore = useFirestore();
    const { toast } = useToast();

    const deleteEntry = async () => {
        if (confirm(`Are you sure you want to delete this service entry? This will delete ${Object.keys(entry.docIds).length} record(s).`)) {
            if (!firestore) return;
            try {
                const batch = writeBatch(firestore);
                Object.values(entry.docIds).forEach(docId => {
                    batch.delete(doc(firestore, "financial_records", docId));
                });
                await batch.commit();
                toast({
                    title: "Entry Deleted",
                    description: "The service entry has been deleted.",
                });
            } catch (error) {
                console.error("Error deleting entry:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not delete entry. Please try again.",
                });
            }
        }
    };
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(entry)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={deleteEntry} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function EntriesByCampus({ onEdit }: { onEdit: (entry: GroupedEntry) => void }) {
    const firestore = useFirestore();

    const recordsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, "financial_records"), orderBy("date", "desc")) : null,
        [firestore]
    );

    const { data: records, isLoading } = useCollection<FinancialRecord>(recordsQuery);

    const allEntries = React.useMemo(() => {
        if (!records) return [];

        const services: Record<string, GroupedEntry> = {};

        records.forEach(record => {
            const dateStr = record.date?.seconds ? new Date(record.date.seconds * 1000).toISOString().split('T')[0] : 'unknown-date';
            const campusName = record.campus || "Unassigned";
            const serviceKey = `${campusName}-${record.reporterFullName}-${dateStr}-${record.serviceTime}-${record.serviceType}`;

            if (!services[serviceKey]) {
                services[serviceKey] = {
                    id: serviceKey,
                    docIds: {},
                    campus: campusName,
                    reporterFullName: record.reporterFullName || 'N/A',
                    date: record.date,
                    serviceTime: record.serviceTime || 'N/A',
                    serviceType: record.serviceType || 'N/A',
                };
                ALL_CATEGORIES.forEach(cat => services[serviceKey][cat] = 0);
            }
            
            if (record.category && ALL_CATEGORIES.includes(record.category)) {
                services[serviceKey][record.category] = (services[serviceKey][record.category] as number || 0) + record.amount;
                services[serviceKey].docIds[record.category] = record.id;
            }
        });
        
        return Object.values(services);

    }, [records]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>All Entries</CardTitle>
                    <CardDescription>
                        A list of recent giving entries across all campuses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full whitespace-nowrap">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Campus</TableHead>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead className="w-[120px]">Time</TableHead>
                                {GIVING_CATEGORIES.map(cat => <TableHead key={cat} className="text-right">{cat}</TableHead>)}
                                <TableHead className="text-right">Attendance</TableHead>
                                <TableHead className="w-[150px] text-right">Reporter</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        {GIVING_CATEGORIES.map(cat => <TableCell key={cat}><Skeleton className="h-6 w-full" /></TableCell>)}
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : allEntries.length > 0 ? (
                                allEntries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium">{entry.campus}</TableCell>
                                        <TableCell>
                                            {entry.date?.seconds ? format(new Date(entry.date.seconds * 1000), "PPP") : "N/A"}
                                        </TableCell>
                                        <TableCell>{entry.serviceTime}</TableCell>
                                        
                                        {GIVING_CATEGORIES.map(cat => (
                                            <TableCell key={cat} className="text-right font-medium">
                                                {(entry[cat] as number) > 0 ? formatCurrency(entry[cat] as number) : '-'}
                                            </TableCell>
                                        ))}
                                        
                                        <TableCell className="text-right font-medium">
                                            {(entry.Attendance as number) > 0 ? (entry.Attendance as number).toLocaleString() : '-'}
                                        </TableCell>
                                        <TableCell className="font-medium text-right">{entry.reporterFullName}</TableCell>
                                        <TableCell>
                                            <ActionsCell entry={entry} onEdit={onEdit} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={GIVING_CATEGORIES.length + 5} className="h-24 text-center">
                                    No entries found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                     <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
