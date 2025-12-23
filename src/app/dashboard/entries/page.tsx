
'use client';

import { PageHeader } from "@/components/shared/page-header";
import { GivingEntryForm } from "@/components/entries/giving-entry-form";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import React from "react";
import { EntriesByCampus, type GroupedEntry } from "@/components/entries/entries-by-campus";

export default function EntriesPage() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [editingEntry, setEditingEntry] = React.useState<GroupedEntry | null>(null);

    const handleEdit = (entry: GroupedEntry) => {
        setEditingEntry(entry);
        setIsOpen(true);
        // Scroll to the top to make the form visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleFormSuccess = () => {
      setIsOpen(false);
      setEditingEntry(null);
    }

    return (
        <div className="container mx-auto p-0">
            <PageHeader title="Giving Entry" />
            <div className="container mx-auto p-0">
                <Collapsible
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open)
                        if (!open) {
                            setEditingEntry(null);
                        }
                    }}
                    className="space-y-2 mb-6"
                >
                    <div className="flex items-center justify-between space-x-4 px-4">
                        <h4 className="text-lg font-semibold">
                            {editingEntry ? "Edit Entry" : "New Entry Form"}
                        </h4>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <GivingEntryForm 
                            editingEntry={editingEntry}
                            onSuccess={handleFormSuccess}
                        />
                    </CollapsibleContent>
                </Collapsible>
            </div>
            
            <EntriesByCampus onEdit={handleEdit} />
        </div>
    )
}
