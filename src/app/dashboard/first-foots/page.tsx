
'use client';

import { PageHeader } from "@/components/shared/page-header";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FinancialRecordForm } from "@/components/dashboard/financial-record-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirstFootsSummary } from "@/components/dashboard/first-foots-summary";

export default function FirstFootsPage() {
    return (
        <>
        <PageHeader title="First Foots" description="Log your 'First Foots' contributions.">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Add First Foots Record</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add First Foots Record</DialogTitle>
                        <DialogDescription>
                            Enter the details of your contribution.
                        </DialogDescription>
                    </DialogHeader>
                    <FinancialRecordForm category="First Foots" />
                </DialogContent>
            </Dialog>
        </PageHeader>
        <FirstFootsSummary />
        </>
    )
}
