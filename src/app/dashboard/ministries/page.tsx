
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MinistryForm } from "@/components/ministries/ministry-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Ministry } from "@/lib/types";
import { collection, orderBy, query } from "firebase/firestore";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MinistriesPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const ministriesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, "ministries"), orderBy("createdAt", "desc")) : null,
    [firestore]
  );
  
  const { data: ministries, isLoading } = useCollection<Ministry>(ministriesQuery);

  return (
    <>
      <PageHeader title="Ministry Management" description="Manage your ministries.">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Ministry</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Ministry</DialogTitle>
              <DialogDescription>
                Fill in the details for the new ministry.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-6">
                <MinistryForm onSuccess={() => setIsDialogOpen(false)} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable columns={columns} data={ministries || []} isLoading={isLoading} />
    </>
  );
}

    