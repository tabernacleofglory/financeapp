'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Shield, User, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ActionsCell = ({ row, onEdit }: { row: any; onEdit: (user: UserProfile) => void }) => {
  const user = row.original as UserProfile;
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleRoleChange = async (role: 'Admin' | 'User' | 'Developer' | 'Tech Support' | 'Team' | 'Volunteer') => {
    if (!firestore) return;
    try {
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, { role });
        toast({
            title: 'Role Updated',
            description: `${user.name || user.email}'s role has been updated to ${role}.`,
        });
    } catch (error) {
        console.error("Error updating role:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update user role. Please try again.",
        });
    }
  }

  const handleDelete = () => {
     toast({
        variant: "destructive",
        title: 'Action Not Implemented',
        description: `Deleting user ${user.name} is not yet implemented.`,
    });
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.uid)}>
          Copy User ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <DropdownMenuItem onClick={() => onEdit(user)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange('Admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Make Admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange('User')}>
            <User className="mr-2 h-4 w-4" />
            Make User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns = (onEdit: (user: UserProfile) => void): ColumnDef<UserProfile>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL} alt={name} />
            <AvatarFallback>
              {(user.firstName?.charAt(0).toUpperCase() || '') + (user.lastName?.charAt(0).toUpperCase() || '')}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const variant = (role === 'Admin' || role === 'Developer') ? 'default' : 'secondary';
      return <Badge variant={variant as any}>{role}</Badge>;
    },
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Login',
    cell: ({ row }) => {
      const date = row.getValue('lastLoginAt') as
        | { seconds: number; nanoseconds: number }
        | undefined;
      if (!date) return 'Never';
      const jsDate = new Date(date.seconds * 1000);
      return (
        <span>
          {jsDate.toLocaleDateString()} {jsDate.toLocaleTimeString()}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as
        | { seconds: number; nanoseconds: number }
        | undefined;
      if (!date) return 'N/A';
      const jsDate = new Date(date.seconds * 1000);
      return (
        <span>
          {jsDate.toLocaleDateString()} {jsDate.toLocaleTimeString()}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
  },
];
