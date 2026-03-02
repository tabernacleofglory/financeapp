
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
} from "@/components/ui/dialog";
import { RegionForm } from "@/components/regions/region-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Region } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RegionsPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState<Region | null>(null);

  const regionsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, "regions")) : null,
    [firestore]
  );
  
  const { data: regions, isLoading } = useCollection<Region>(regionsQuery);

  const handleAddClick = () => {
    setSelectedRegion(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (region: Region) => {
    setSelectedRegion(region);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedRegion(null);
  };

  return (
    <>
      <PageHeader title="Region Management" description="Manage your geographical regions.">
        <Button onClick={handleAddClick}>Add Region</Button>
      </PageHeader>
      <DataTable columns={columns({ onEdit: handleEditClick })} data={regions || []} isLoading={isLoading} />
      
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRegion ? "Edit Region" : "Add New Region"}</DialogTitle>
            <DialogDescription>
              {selectedRegion ? "Update the details for this region." : "Fill in the details for the new region."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <RegionForm
              region={selectedRegion}
              onSuccess={handleDialogClose}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
