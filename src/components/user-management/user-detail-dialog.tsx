
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserProfile } from "@/lib/types";
import { format } from "date-fns";

interface UserDetailDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value || 'N/A'}</dd>
    </div>
);


export function UserDetailDialog({ user, open, onOpenChange }: UserDetailDialogProps) {
  if (!user) return null;

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "PPpp");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center pt-6">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={user.photoURL} alt={name} />
            <AvatarFallback className="text-2xl">
              {(user.firstName?.charAt(0).toUpperCase() || '') + (user.lastName?.charAt(0).toUpperCase() || '')}
            </AvatarFallback>
          </Avatar>
          <DialogTitle className="text-2xl">{name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
          <Badge variant={user.role === 'Admin' || user.role === 'Developer' ? 'default' : 'secondary'} className="w-fit">{user.role}</Badge>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4">
            <dl className="p-1">
                <DetailItem label="First Name" value={user.firstName} />
                <DetailItem label="Last Name" value={user.lastName} />
                <DetailItem label="User ID" value={<span className="text-xs font-mono break-all">{user.uid}</span>} />
                <DetailItem label="Campus" value={user.campus} />
                <DetailItem label="Ministry" value={user.ministry} />
                <DetailItem label="HP Number" value={user.hpNumber} />
                <DetailItem label="Last Login" value={formatDate(user.lastLoginAt)} />
                <DetailItem label="Created At" value={formatDate(user.createdAt)} />
                <div className="py-2">
                    <dt className="text-sm font-medium text-muted-foreground mb-2">Assigned Permissions</dt>
                    <dd className="text-sm">
                        {user.access && user.access.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {user.access.map(permission => (
                                    <Badge key={permission} variant="outline">{permission}</Badge>
                                ))}
                            </div>
                        ) : (
                            'None (Role-based)'
                        )}
                    </dd>
                </div>
            </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
