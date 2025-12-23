"use client";

import React from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
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
import { CampusForm } from "@/components/campuses/campus-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Campus } from "@/lib/types";

export default function CampusesPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCampus, setSelectedCampus] = React.useState<Campus | null>(null);

  const campusesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, "campuses"), orderBy("createdAt", "desc")) : null),
    [firestore]
  );

  const { data: campuses, isLoading } = useCollection<Campus>(campusesQuery);

  const handleAddClick = () => {
    setSelectedCampus(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (campus: Campus) => {
    setSelectedCampus(campus);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCampus(null);
  };

  return (
    <>
      <PageHeader title="Campus Management" description="Manage your campus locations.">
        <Button onClick={handleAddClick}>Add Campus</Button>
      </PageHeader>

      <DataTable
        columns={columns({ onEdit: handleEditClick })}
        data={campuses || []}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCampus ? "Edit Campus" : "Add New Campus"}</DialogTitle>
            <DialogDescription>
              {selectedCampus ? "Update the details for this campus." : "Fill in the details for the new campus."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <CampusForm
              campus={selectedCampus}
              onSuccess={handleDialogClose}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
