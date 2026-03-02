
'use client';

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Resource } from "@/lib/types";
import { ResourceForm } from "@/components/resources/resource-form";
import { ResourceCard } from "@/components/resources/resource-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ResourcesPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null);

  const firestore = useFirestore();
  const resourcesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, "resources"), orderBy("createdAt", "desc")) : null,
    [firestore]
  );
  const { data: resources, isLoading } = useCollection<Resource>(resourcesQuery);

  const handleAddResource = () => {
    setEditingResource(null);
    setIsDialogOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingResource(null);
  };

  return (
    <>
      <PageHeader
        title="Resource Hub"
        description="A central place for links, videos, images, documents, and memos."
      >
        <Button onClick={handleAddResource}>Add Resource</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
            [...Array(8)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-end pt-4">
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))
        ) : resources && resources.length > 0 ? (
          resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={handleEditResource}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No resources found. Add one to get started!
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            <DialogDescription>
              {editingResource ? "Update the details for this resource." : "Fill in the details for the new resource."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <ResourceForm
              resource={editingResource}
              onSuccess={handleDialogClose}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
