
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { collection, orderBy, query } from 'firebase/firestore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { UserEditForm } from '@/components/user-management/user-edit-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { UserDetailDialog } from '@/components/user-management/user-detail-dialog';

export default function UserManagementPage() {
  const firestore = useFirestore();
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [viewingUser, setViewingUser] = React.useState<UserProfile | null>(null);
  const isMobile = useIsMobile();

  const usersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleEditUser = (user: UserProfile) => {
    setViewingUser(null);
    setEditingUser(user);
    setIsSheetOpen(true);
  };
  
  const handleAddUser = () => {
    setEditingUser(null);
    setIsSheetOpen(true);
  };


  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingUser(null);
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setViewingUser(user);
  };

  const EditComponent = isMobile ? Drawer : Sheet;
  const EditContentComponent = isMobile ? DrawerContent : SheetContent;

  return (
    <>
      <PageHeader
        title="User Management"
        description="View and manage application users."
      >
        <Button onClick={handleAddUser}>Add User</Button>
      </PageHeader>
      <DataTable
        columns={columns(handleEditUser)}
        data={users || []}
        isLoading={isLoading}
        onRowClick={handleViewUser}
      />
      <EditComponent open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <EditContentComponent className={isMobile ? 'p-4 h-[90vh]' : 'flex flex-col'}>
          <DrawerHeader>
            <DrawerTitle>{editingUser ? 'Edit User Profile' : 'Add New User'}</DrawerTitle>
            <DrawerDescription>
              {editingUser ? `Update the details for ${editingUser?.name || editingUser?.email}.` : 'Fill in the details for the new user.'}
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className={isMobile ? 'overflow-y-auto' : 'flex-grow pr-6 -mr-6'}>
            <UserEditForm
              user={editingUser}
              onSuccess={() => handleSheetOpenChange(false)}
            />
          </ScrollArea>
        </EditContentComponent>
      </EditComponent>
      <UserDetailDialog
        user={viewingUser}
        open={!!viewingUser}
        onOpenChange={(open) => {
          if (!open) {
            setViewingUser(null);
          }
        }}
      />
    </>
  );
}
