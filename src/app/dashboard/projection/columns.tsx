
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Trash2, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Projection } from "@/lib/types"
import { deleteDoc, doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { toast } from "@/hooks/use-toast"

const ActionsCell = ({ row, onEdit }: { row: any; onEdit: (projection: Projection) => void; }) => {
    const projection = row.original as Projection;
    const firestore = useFirestore();

    const deleteProjection = async () => {
        if (confirm(`Are you sure you want to delete the projection for ${projection.year}?`)) {
            try {
                if (!firestore) return;
                await deleteDoc(doc(firestore, "projections", projection.id));
                toast({
                    title: "Projection Deleted",
                    description: `The projection for ${projection.year} has been deleted.`,
                });
            } catch (error) {
                console.error("Error deleting projection:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not delete projection. Please try again.",
                });
            }
        }
    }

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
                <DropdownMenuItem onClick={() => onEdit(projection)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={deleteProjection} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};


export const columns = ({ onEdit }: { onEdit: (projection: Projection) => void }): ColumnDef<Projection>[] => [
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "projection",
    header: "Projection %",
    cell: ({ row }) => <div className="text-center">{row.original.projection}%</div>,
  },
  {
    accessorKey: "projectedState",
    header: "Projected State",
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.projectedState)}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
  },
]
