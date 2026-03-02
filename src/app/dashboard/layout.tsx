
'use client';

import { Logo } from "@/components/shared/logo";
import { UserNav } from "@/components/shared/user-nav";
import {
    Sidebar,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarSeparator,
    useSidebar
} from "@/components/ui/sidebar";
import { LayoutDashboard, HandHeart, Percent, Heart, Wheat, Pencil, PlusCircle, Target, Settings, Info, MessageSquare, BookOpen, LogOut, Building, Terminal, Users, Shield, Church, HelpCircle, Globe } from "lucide-react";
import Link from 'next/link';
import { useAuth, useDoc, useFirestore, useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import React, { useMemo } from "react";
import { doc } from "firebase/firestore";
import type { PermissionRow, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeProvider } from "@/context/DateRangeContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const { setOpen } = useSidebar();

    const devToolsPaths = ['/dashboard/dev-tools', '/dashboard/user-management', '/dashboard/permission-controls', '/dashboard/about'];
    const isDevToolsActive = devToolsPaths.some(path => pathname.startsWith(path));

    const userDocRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: userProfile, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userDocRef);

    const permissionsDocRef = useMemo(() => (firestore && user) ? doc(firestore, 'permissions', 'matrix') : null, [firestore, user]);
    const { data: permissionsData, isLoading: isPermissionsLoading } = useDoc<{rules: PermissionRow[]}>(permissionsDocRef);

    const userPermissions = useMemo(() => {
        if (!userProfile || !permissionsData?.rules) return {};

        if (userProfile.access && Array.isArray(userProfile.access)) {
            const userAccessPermissions: Record<string, boolean> = {};
            permissionsData.rules.forEach(rule => {
                userAccessPermissions[rule.feature] = userProfile.access!.includes(rule.feature);
            });
            return userAccessPermissions;
        }

        // Fallback to role-based permissions
        const role = userProfile.role || 'Guest';
        const permissions: Record<string, boolean> = {};
        permissionsData.rules.forEach(rule => {
            permissions[rule.feature] = rule.permissions[role] || false;
        });
        return permissions;
    }, [userProfile, permissionsData]);


    React.useEffect(() => {
        if (isDevToolsActive) {
            setOpen(false);
        }
    }, [pathname, isDevToolsActive, setOpen]);
    
    const handleSignOut = async () => {
        if (auth) {
            await auth.signOut();
        }
        router.push('/');
    }

    React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);


    const isLoading = isUserLoading || isUserProfileLoading || isPermissionsLoading;

    if (!isLoading && userProfile?.role === 'Guest') {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription>
                            You do not have access to this platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Please contact your campus administrator for follow-up.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSignOut} className="w-full">
                            Logout
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen">
                <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-12 w-1/3 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    return (
        <>
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {userPermissions['Dashboard'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                                <Link href="/dashboard"><LayoutDashboard /> Dashboard</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Offerings'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/offerings'}>
                                <Link href="/dashboard/offerings"><HandHeart /> Offerings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Tithes'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/tithes'}>
                                <Link href="/dashboard/tithes"><Percent /> Tithes</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['365 Offerings'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/365-offerings'}>
                                <Link href="/dashboard/365-offerings"><Heart /> 365 Offerings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['First Fruits'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/first-fruits'}>
                                <Link href="/dashboard/first-fruits"><Wheat /> First Fruits</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Salomon'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/salomon'}>
                                <Link href="/dashboard/salomon"><Pencil /> Salomon</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                         {userPermissions['Entries'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/entries'}>
                                <Link href="/dashboard/entries"><PlusCircle /> Entries</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         )}
                        {userPermissions['Campuses'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/campuses'}>
                                <Link href="/dashboard/campuses"><Building /> Campuses</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Ministries'] && (
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/ministries'}>
                                <Link href="/dashboard/ministries"><Church /> Ministries</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Regions'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/regions'}>
                                <Link href="/dashboard/regions"><Globe /> Regions</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Projection'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/projection'}>
                                <Link href="/dashboard/projection"><Target /> Projection</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['User Settings'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/user-settings'}>
                                <Link href="/dashboard/user-settings"><Settings /> User Settings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        
                        {userPermissions['Dev Tools'] && (
                        <Accordion type="single" collapsible defaultValue={isDevToolsActive ? "devtools" : ""} className="w-full">
                            <AccordionItem value="devtools" className="border-none">
                                <AccordionTrigger className="hover:no-underline p-0">
                                    <SidebarMenuButton asChild isActive={isDevToolsActive} className="w-full justify-start">
                                        <div><Terminal /> Dev Tools</div>
                                    </SidebarMenuButton>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 pl-4">
                                    <SidebarMenu>
                                        {userPermissions['Dev Tools > User Management'] && (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/user-management'}>
                                                <Link href="/dashboard/user-management"><Users className="h-4 w-4 mr-2" /> User Management</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        )}
                                        {userPermissions['Dev Tools > Permission Controls'] && (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/permission-controls'}>
                                                <Link href="/dashboard/permission-controls"><Shield className="h-4 w-4 mr-2" /> Permission Controls</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        )}
                                        {userPermissions['Dev Tools > App Info'] && (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/about'}>
                                                <Link href="/dashboard/about"><Info className="h-4 w-4 mr-2" /> App Info</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        )}
                                    </SidebarMenu>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        )}

                        <SidebarSeparator />
                        {userPermissions['Inquiries'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/inquiries'}>
                                <Link href="/dashboard/inquiries"><HelpCircle /> Inquiries</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        {userPermissions['Feedback'] && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/feedback'}>
                                <Link href="/dashboard/feedback"><MessageSquare /> Feedback</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        )}
                        <SidebarSeparator />
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/resources'}>
                                <Link href="/dashboard/resources"><BookOpen /> Resources</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleSignOut}>
                                <LogOut /> Logout
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center justify-between gap-4 bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
                    <SidebarTrigger />
                    <UserNav />
                </header>
                <main className="flex-1 p-4 md:p-6">
                    <DateRangeProvider>
                        {children}
                    </DateRangeProvider>
                </main>
            </SidebarInset>
        </>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
    )
}
