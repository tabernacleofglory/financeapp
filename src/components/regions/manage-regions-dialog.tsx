"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import type { Region } from "@/lib/types";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { Trash2, ArrowUp, ArrowDown, Pencil, Check, X } from "lucide-react";

interface ManageRegionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageRegionsDialog({
  open,
  onOpenChange,
}: ManageRegionsDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newRegionName, setNewRegionName] = useState("");
  const [editingItem, setEditingItem] = useState<Region | null>(null);
  const [editedName, setEditedName] = useState("");

  const regionsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "regions"))
        : null,
    [firestore]
  );
  const { data: regionsData, isLoading } = useCollection<Region>(regionsQuery);

  const regions = useMemo(() => {
    if (!regionsData) return [];
    // Sort by order, putting items without an order at the end, then by name for stability.
    return [...regionsData].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      if (orderA === orderB) {
        return (a.name || "").localeCompare(b.name || "");
      }
      return orderA - orderB;
    });
  }, [regionsData]);

  const handleAddRegion = async () => {
    if (!firestore || !newRegionName.trim()) return;

    try {
      const maxOrder = regionsData ? Math.max(-1, ...regionsData.map(r => r.order ?? -1)) : -1;
      const newOrder = maxOrder + 1;
      await addDoc(collection(firestore, "regions"), {
        name: newRegionName.trim(),
        createdAt: serverTimestamp(),
        order: newOrder,
      });
      toast({
        title: "Region Added",
        description: `"${newRegionName.trim()}" has been added.`,
      });
      setNewRegionName("");
    } catch (error) {
      console.error("Error adding region:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add region. Please try again.",
      });
    }
  };

  const handleDeleteRegion = async (regionId: string, regionName: string) => {
    if (!firestore) return;
    if (confirm(`Are you sure you want to delete the region "${regionName}"?`)) {
      try {
        await deleteDoc(doc(firestore, "regions", regionId));
        toast({
          title: "Region Deleted",
          description: `"${regionName}" has been deleted.`,
        });
      } catch (error) {
        console.error("Error deleting region:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not delete region. Please try again.",
        });
      }
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    if (!firestore || !regions) return;

    const itemToMove = regions[index];
    let itemToSwapWith: Region;

    if (direction === "up" && index > 0) {
      itemToSwapWith = regions[index - 1];
    } else if (direction === "down" && index < regions.length - 1) {
      itemToSwapWith = regions[index + 1];
    } else {
      return;
    }

    const itemOrder = itemToMove.order ?? index;
    const swapWithOrder =
      itemToSwapWith.order ?? (direction === "up" ? index - 1 : index + 1);

    const batch = writeBatch(firestore);
    const itemRef = doc(firestore, "regions", itemToMove.id);
    const swapWithRef = doc(firestore, "regions", itemToSwapWith.id);

    batch.update(itemRef, { order: swapWithOrder });
    batch.update(swapWithRef, { order: itemOrder });

    try {
      await batch.commit();
      toast({
        title: "Region Reordered",
        description: `The order of the regions has been updated.`,
      });
    } catch (error) {
      console.error(`Error reordering region:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not reorder region. Please try again.`,
      });
    }
  };

  const handleEditClick = (item: Region) => {
    setEditingItem(item);
    setEditedName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditedName("");
  };

  const handleSaveEdit = async () => {
    if (!firestore || !editingItem || !editedName.trim()) return;

    const regionRef = doc(firestore, "regions", editingItem.id);
    try {
      await updateDoc(regionRef, { name: editedName.trim() });
      toast({
        title: `Region Updated`,
        description: `"${editingItem.name}" has been updated to "${editedName.trim()}".`,
      });
      handleCancelEdit();
    } catch (error) {
      console.error(`Error updating region:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not update region. Please try again.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Regions</DialogTitle>
          <DialogDescription>
            Add, edit, or delete geographical regions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Current Regions</Label>
            <ScrollArea className="h-60 w-full rounded-md border">
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : regions && regions.length > 0 ? (
                  regions.map((region, index) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between group py-1"
                    >
                      {editingItem?.id === region.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            placeholder="Region name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="h-8"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleSaveEdit}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span>{region.name}</span>
                          <div className="flex items-center opacity-0 group-hover:opacity-100">
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(region)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === 0}
                                onClick={() => handleMoveItem(index, 'up')}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === (regions?.length ?? 0) - 1}
                                onClick={() => handleMoveItem(index, 'down')}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleDeleteRegion(region.id, region.name)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No regions found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-region-name">Add New Region</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="new-region-name"
                placeholder="New region name..."
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleAddRegion}
                disabled={!newRegionName.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
