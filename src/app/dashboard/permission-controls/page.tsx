

'use client';

import * as React from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import type { PermissionRow } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const initialPermissions: PermissionRow[] = [
    // Dashboard
    { feature: 'Dashboard', description: 'Main financial overview', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Dashboard > KPI Cards', description: 'View summary financial metrics', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Dashboard > Financial Charts', description: 'View detailed financial charts', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Dashboard > Add Record', description: 'Add a new giving entry from dashboard', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },

    // Core Features
    { feature: 'Offerings', description: 'Manage offerings', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Tithes', description: 'Manage tithes', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: '365 Offerings', description: 'Manage 365 offerings', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'First Fruits', description: 'Manage first fruits contributions', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Salomon', description: 'Manage Salomon contributions', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Entries', description: 'Submit new giving entries', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Campuses', description: 'Manage campus locations', permissions: { Guest: false, User: false, Volunteer: false, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Projection', description: 'View financial projections', permissions: { Guest: false, User: false, Volunteer: false, Team: false, TechSupport: false, Admin: true, Developer: true } },

    // Settings & Feedback
    { feature: 'User Settings', description: 'Manage personal user settings', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Feedback', description: 'Submit application feedback', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },

    // Dev Tools (Admin/Developer only)
    { feature: 'Dev Tools', description: 'Access developer and admin tools', permissions: { Guest: false, User: false, Volunteer: false, Team: false, TechSupport: true, Admin: true, Developer: true } },
    { feature: 'Dev Tools > User Management', description: 'Manage all application users', permissions: { Guest: false, User: false, Volunteer: false, Team: false, TechSupport: false, Admin: true, Developer: true } },
    { feature: 'Dev Tools > Permission Controls', description: 'Manage role-based permissions', permissions: { Guest: false, User: false, Volunteer: false, Team: false, TechSupport: false, Admin: true, Developer: true } },
    { feature: 'Dev Tools > App Info', description: 'View application information', permissions: { Guest: false, User: true, Volunteer: true, Team: true, TechSupport: true, Admin: true, Developer: true } },
];

const roles = ['Developer', 'Admin', 'Tech Support', 'Team', 'Volunteer', 'User', 'Guest'] as const;
type Role = typeof roles[number];


export default function PermissionControlsPage() {
    const [permissions, setPermissions] = React.useState<PermissionRow[]>(initialPermissions);
    const [isDirty, setIsDirty] = React.useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const permissionsDocRef = useMemoFirebase(
        () => firestore ? doc(firestore, 'permissions', 'matrix') : null,
        [firestore]
    );

    const { data: savedPermissionsData, isLoading } = useDoc<{rules: PermissionRow[]}>(permissionsDocRef);

    React.useEffect(() => {
        if (savedPermissionsData?.rules) {
            setPermissions(savedPermissionsData.rules);
        }
    }, [savedPermissionsData]);


    const handlePermissionChange = (feature: string, role: Role) => {
        setPermissions(prev =>
            prev.map(p =>
                p.feature === feature
                    ? { ...p, permissions: { ...p.permissions, [role]: !p.permissions[role] } }
                    : p
            )
        );
        setIsDirty(true);
    };

    const handleSaveChanges = async () => {
        if (!firestore) return;
        try {
            await setDoc(doc(firestore, 'permissions', 'matrix'), { 
                rules: permissions,
                lastUpdated: serverTimestamp()
            });
            toast({
                title: "Permissions Saved",
                description: "Your changes have been saved successfully.",
            });
            setIsDirty(false);
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save permissions. Please try again.",
            });
        }
    };


    const getRoleVariant = (role: Role) => {
        switch (role) {
            case 'Admin': return 'default';
            case 'Developer': return 'destructive';
            case 'Tech Support': return 'secondary';
            case 'Team': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <div>
            <PageHeader title="Permission Controls" description="Configure roles and access levels for all application features.">
                <Button onClick={handleSaveChanges} disabled={!isDirty || isLoading}>Save Changes</Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Roles & Permissions Matrix</CardTitle>
                    <CardDescription>Check a box to grant access for a role to a feature. Unchecked means public/guest access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="border rounded-lg whitespace-nowrap">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[300px] sticky left-0 bg-muted/50">Feature</TableHead>
                                    {roles.map(role => (
                                        <TableHead key={role} className="text-center">
                                            <Badge variant={getRoleVariant(role as any)}>{role}</Badge>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(10)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium sticky left-0 bg-card">
                                                <Skeleton className="h-5 w-48" />
                                                <Skeleton className="h-3 w-64 mt-1" />
                                            </TableCell>
                                            {roles.map(role => (
                                                <TableCell key={role} className="text-center">
                                                    <Skeleton className="h-4 w-4 mx-auto" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : permissions.map(row => (
                                    <TableRow key={row.feature}>
                                        <TableCell className="font-medium sticky left-0 bg-card whitespace-normal">
                                            {row.feature}
                                            <p className="text-xs text-muted-foreground font-normal">{row.description}</p>
                                        </TableCell>
                                        {roles.map(role => (
                                            <TableCell key={`${row.feature}-${role}`} className="text-center">
                                                <Checkbox
                                                    checked={row.permissions[role]}
                                                    onCheckedChange={() => handlePermissionChange(row.feature, role)}
                                                    aria-label={`Permission for ${role} on ${row.feature}`}
                                                    disabled={role === 'Developer'}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
