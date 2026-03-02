
'use client';

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectionForm } from "@/components/projection/projection-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Projection } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

export default function ProjectionPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedProjection, setSelectedProjection] = React.useState<Projection | null>(null);
    const firestore = useFirestore();

    const projectionsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, "projections"), orderBy("year", "asc")) : null,
        [firestore]
    );
    
    const { data: projections, isLoading } = useCollection<Projection>(projectionsQuery);
    
    const handleAddClick = () => {
      setSelectedProjection(null);
      setIsDialogOpen(true);
    };
  
    const handleEditClick = (projection: Projection) => {
      setSelectedProjection(projection);
      setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
      setIsDialogOpen(false);
      setSelectedProjection(null);
    };

    const tableColumns = React.useMemo(() => columns({ onEdit: handleEditClick }), [handleEditClick]);

    return (
        <>
            <PageHeader title="Projection" description="View your financial projections.">
                <Button onClick={handleAddClick}>Add Projection</Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Financial Projections</CardTitle>
                    <CardDescription>Future financial forecasting based on your data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>YEAR</TableHead>
                                <TableHead className="text-center">PROJECTION %</TableHead>
                                <TableHead className="text-right">PROJECTED STATE</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                projections?.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell className="font-medium">{data.year}</TableCell>
                                        <TableCell className="text-center">{data.projection}%</TableCell>
                                        <TableCell className="text-right">{formatCurrency(data.projectedState)}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const actionColumn = tableColumns.find(c => c.id === 'actions');
                                                if (actionColumn && actionColumn.cell) {
                                                    const cellContent = actionColumn.cell;
                                                    if (typeof cellContent === 'function') {
                                                        return cellContent({ row: { original: data } } as any);
                                                    }
                                                    return cellContent;
                                                }
                                                return null;
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                             {!isLoading && projections?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No projections found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedProjection ? "Edit Projection" : "Add New Projection"}</DialogTitle>
                        <DialogDescription>
                            {selectedProjection ? "Update the details for this projection." : "Enter the details for the new financial projection."}
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectionForm projection={selectedProjection} onSuccess={handleDialogClose} />
                </DialogContent>
            </Dialog>
        </>
    )
}
