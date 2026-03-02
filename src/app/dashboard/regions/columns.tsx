"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash2, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Region } from "@/lib/types"
import { deleteDoc, doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { toast } from "@/hooks/use-toast"

const ActionsCell = ({ row, onEdit }: { row: any; onEdit: (region: Region) => void; }) => {
    const region = row.original as Region;
    const firestore = useFirestore();

    const deleteRegion = async () => {
        if (confirm(`Are you sure you want to delete "${region.name}"?`)) {
            try {
                if (!firestore) return;
                await deleteDoc(doc(firestore, "regions", region.id));
                toast({
                    title: "Region Deleted",
                    description: `"${region.name}" has been deleted.`,
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
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(region.id)}
                >
                    Copy Region ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(region)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Region
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteRegion} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export const columns = ({ onEdit }: { onEdit: (region: Region) => void }): ColumnDef<Region>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Region Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "order",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const order = row.getValue("order") as number | undefined;
      return <div className="text-center">{order ?? 'N/A'}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
        const date = row.getValue("createdAt") as { seconds: number, nanoseconds: number } | undefined;
        if (!date) return "N/A";
        const jsDate = new Date(date.seconds * 1000);
        return <span>{jsDate.toLocaleDateString()} {jsDate.toLocaleTimeString()}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
  },
]
