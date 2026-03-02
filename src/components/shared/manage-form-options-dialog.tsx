
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
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import {
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import type { FormOptions, OptionItem } from "@/lib/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { Trash2, ArrowUp, ArrowDown, Pencil, Check, X } from "lucide-react";

interface ManageFormOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionId: string;
  title: string;
  description: string;
  noun: string;
}

export function ManageFormOptionsDialog({
  open,
  onOpenChange,
  optionId,
  title,
  description,
  noun,
}: ManageFormOptionsDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  
  const [editingItem, setEditingItem] = useState<OptionItem | null>(null);
  const [editedLabel, setEditedLabel] = useState("");
  const [editedValue, setEditedValue] = useState("");

  const optionsDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "form_options", optionId) : null),
    [firestore, optionId]
  );
  const { data: formOptions, isLoading } = useDoc<FormOptions>(optionsDocRef);

  const handleAddItem = async () => {
    if (!firestore || !optionsDocRef || !newLabel.trim() || !newValue.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Label and Value cannot be empty.",
        });
        return;
    };

    try {
      await updateDoc(optionsDocRef, {
        options: arrayUnion({ label: newLabel.trim(), value: newValue.trim() }),
      });
      toast({
        title: `${noun} Added`,
        description: `"${newLabel.trim()}" has been added.`,
      });
      setNewLabel("");
      setNewValue("");
    } catch (error) {
      console.error(`Error adding ${noun}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not add ${noun}. Please try again.`,
      });
    }
  };

  const handleDeleteItem = async (item: OptionItem) => {
    if (!firestore || !optionsDocRef) return;
    if (confirm(`Are you sure you want to delete "${item.label}"?`)) {
      try {
        await updateDoc(optionsDocRef, {
            options: arrayRemove(item)
        });
        toast({
          title: `${noun} Deleted`,
          description: `"${item.label}" has been deleted.`,
        });
      } catch (error) {
        console.error(`Error deleting ${noun}:`, error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Could not delete ${noun}. Please try again.`,
        });
      }
    }
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (!firestore || !optionsDocRef || !formOptions?.options) return;

    const newOptions = [...formOptions.options];
    const item = newOptions[index];

    if (direction === 'up' && index > 0) {
        newOptions.splice(index, 1);
        newOptions.splice(index - 1, 0, item);
    } else if (direction === 'down' && index < newOptions.length - 1) {
        newOptions.splice(index, 1);
        newOptions.splice(index + 1, 0, item);
    } else {
        return;
    }

    try {
        await updateDoc(optionsDocRef, {
            options: newOptions
        });
        toast({
            title: `${noun} Reordered`,
            description: `The order of the options has been updated.`,
        });
    } catch (error) {
        console.error(`Error reordering ${noun}:`, error);
        toast({
            variant: "destructive",
            title: "Error",
            description: `Could not reorder ${noun}. Please try again.`,
        });
    }
  };

  const handleEditClick = (item: OptionItem) => {
    setEditingItem(item);
    setEditedLabel(item.label);
    setEditedValue(item.value);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditedLabel("");
    setEditedValue("");
  };

  const handleSaveEdit = async () => {
    if (!firestore || !optionsDocRef || !editingItem || !formOptions?.options) return;
    if (!editedLabel.trim() || !editedValue.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Label and Value cannot be empty.",
      });
      return;
    }

    const newOptions = formOptions.options.map((opt) =>
      opt.value === editingItem.value && opt.label === editingItem.label
        ? { label: editedLabel.trim(), value: editedValue.trim() }
        : opt
    );

    try {
      await updateDoc(optionsDocRef, { options: newOptions });
      toast({
        title: `${noun} Updated`,
        description: `"${editingItem.label}" has been updated.`,
      });
      handleCancelEdit();
    } catch (error) {
      console.error(`Error updating ${noun}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not update ${noun}. Please try again.`,
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Current {noun}s</Label>
            <ScrollArea className="h-60 w-full rounded-md border">
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : formOptions?.options && formOptions.options.length > 0 ? (
                  formOptions.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group py-1"
                    >
                      {editingItem?.value === option.value && editingItem?.label === option.label ? (
                        <div className="flex-1 flex items-center gap-2">
                            <Input
                                placeholder="Label"
                                value={editedLabel}
                                onChange={(e) => setEditedLabel(e.target.value)}
                                className="h-8"
                            />
                            <Input
                                placeholder="Value"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="h-8"
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveEdit}>
                                <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                                <X className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      ) : (
                        <>
                          <span>{option.label} ({option.value})</span>
                          <div className="flex items-center opacity-0 group-hover:opacity-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditClick(option)}
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
                                disabled={index === (formOptions?.options.length ?? 0) - 1}
                                onClick={() => handleMoveItem(index, 'down')}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteItem(option)}
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
                    No {noun}s found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <Label>Add New {noun}</Label>
            <div className="grid grid-cols-2 gap-2">
                <Input
                    placeholder="Label (e.g., Sunday Service)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                />
                 <Input
                    placeholder="Value (e.g., SUNDAY_SERVICE)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                />
            </div>
             <Button
                type="button"
                onClick={handleAddItem}
                disabled={!newLabel.trim() || !newValue.trim()}
                className="w-full"
              >
                Add
              </Button>
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
