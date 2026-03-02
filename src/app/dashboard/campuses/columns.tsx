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
import type { Campus } from "@/lib/types"
import { deleteDoc, doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { toast } from "@/hooks/use-toast"

const ActionsCell = ({ row, onEdit }: { row: any; onEdit: (campus: Campus) => void; }) => {
    const campus = row.original as Campus;
    const firestore = useFirestore();

    const deleteCampus = async () => {
        if (confirm(`Are you sure you want to delete "${campus.name}"?`)) {
            try {
                if (!firestore) return;
                await deleteDoc(doc(firestore, "campuses", campus.id));
                toast({
                    title: "Campus Deleted",
                    description: `"${campus.name}" has been deleted.`,
                });
            } catch (error) {
                console.error("Error deleting campus:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not delete campus. Please try again.",
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
                    onClick={() => navigator.clipboard.writeText(campus.id)}
                >
                    Copy Campus ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(campus)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Campus
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteCampus} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export const columns = ({ onEdit }: { onEdit: (campus: Campus) => void }): ColumnDef<Campus>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Campus Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
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
