
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Ministry } from "@/lib/types"
import { deleteDoc, doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { toast } from "@/hooks/use-toast"

const ActionsCell = ({ row }: { row: any }) => {
    const ministry = row.original as Ministry;
    const firestore = useFirestore();

    const deleteMinistry = async () => {
        if (confirm(`Are you sure you want to delete "${ministry.name}"?`)) {
            try {
                if (!firestore) return;
                await deleteDoc(doc(firestore, "ministries", ministry.id));
                toast({
                    title: "Ministry Deleted",
                    description: `"${ministry.name}" has been deleted.`,
                });
            } catch (error) {
                console.error("Error deleting ministry:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not delete ministry. Please try again.",
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
                    onClick={() => navigator.clipboard.writeText(ministry.id)}
                >
                    Copy Ministry ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Edit Ministry</DropdownMenuItem>
                <DropdownMenuItem onClick={deleteMinistry} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export const columns: ColumnDef<Ministry>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ministry Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "description",
    header: "Description",
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
    cell: ActionsCell,
  },
]

    