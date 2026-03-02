'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Shield, User, XCircle, Mail } from 'lucide-react';

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
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { format } from 'date-fns';

const ActionsCell = ({ row, onEdit }: { row: any; onEdit: (user: UserProfile) => void }) => {
  const user = row.original as UserProfile;
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: currentUser } = useUser();
  const isCurrentUser = currentUser?.uid === user.uid;

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

  const handleSendResetLink = async () => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not get authentication service.",
        });
        return;
    }
    try {
        await sendPasswordResetEmail(auth, user.email);
        toast({
            title: 'Password Reset Email Sent',
            description: `A password reset link has been sent to ${user.email}.`,
        });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send password reset email. Please try again.",
        });
    }
  };

  const handleDelete = async () => {
    if (!firestore || !currentUser) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot perform delete operation. Services not available.",
        });
        return;
    }
    
    if (currentUser.uid === user.uid) {
        toast({
            variant: "destructive",
            title: "Action Not Allowed",
            description: "You cannot delete your own profile.",
        });
        return;
    }

    if (confirm(`Are you sure you want to delete user "${user.name || user.email}"? This will only remove the user profile from the database, not their authentication record. This action is irreversible.`)) {
        try {
            await deleteDoc(doc(firestore, "users", user.uid));
            toast({
                title: 'User Profile Deleted',
                description: `The profile for "${user.name || user.email}" has been deleted.`,
            });
        } catch (error: any) {
            console.error("Error deleting user:", error);
            toast({
                variant: "destructive",
                title: "Error Deleting User",
                description: error.message || 'Could not delete user profile. Please try again.',
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.uid)}>
          Copy User ID
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSendResetLink}>
            <Mail className="mr-2 h-4 w-4" />
            Send Reset Link
        </DropdownMenuItem>

        {!isCurrentUser && (
            <>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Delete User
                </DropdownMenuItem>
            </>
        )}
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
        <div className="flex items-center gap-2 max-w-[250px]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL} alt={name} />
            <AvatarFallback>
              {(user.firstName?.charAt(0).toUpperCase() || '') + (user.lastName?.charAt(0).toUpperCase() || '')}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate" title={name}>{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
        const email = row.original.email;
        return <div className="truncate max-w-[250px]" title={email}>{email}</div>
    }
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
        <span title={jsDate.toLocaleString()}>
          {format(jsDate, 'PP')}
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
        <span title={jsDate.toLocaleString()}>
          {format(jsDate, 'PP')}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
  },
];
