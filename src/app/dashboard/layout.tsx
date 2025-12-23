

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
import { LayoutDashboard, HandHeart, Percent, Heart, Wheat, Pencil, PlusCircle, Target, Settings, Info, MessageSquare, AppWindow, LogOut, Building, Terminal, Users, Shield, Church } from "lucide-react";
import Link from 'next/link';
import { useAuth, useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import React from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { setOpen } = useSidebar();

    const devToolsPaths = ['/dashboard/dev-tools', '/dashboard/user-management', '/dashboard/permission-controls', '/dashboard/about'];
    const isDevToolsActive = devToolsPaths.some(path => pathname.startsWith(path));

    React.useEffect(() => {
        if (isDevToolsActive) {
            setOpen(false);
        }
    }, [pathname, isDevToolsActive, setOpen]);
    
    React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);


    const handleSignOut = async () => {
        if (auth) {
            await auth.signOut();
        }
        router.push('/');
    }

    if (isUserLoading || !user) {
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
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                                <Link href="/dashboard"><LayoutDashboard /> Dashboard</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/offerings'}>
                                <Link href="/dashboard/offerings"><HandHeart /> Offerings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/tithes'}>
                                <Link href="/dashboard/tithes"><Percent /> Tithes</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/365-offerings'}>
                                <Link href="/dashboard/365-offerings"><Heart /> 365 Offerings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/first-fruits'}>
                                <Link href="/dashboard/first-fruits"><Wheat /> First Fruits</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/salomon'}>
                                <Link href="/dashboard/salomon"><Pencil /> Salomon</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/entries'}>
                                <Link href="/dashboard/entries"><PlusCircle /> Entries</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/campuses'}>
                                <Link href="/dashboard/campuses"><Building /> Campuses</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/ministries'}>
                                <Link href="/dashboard/ministries"><Church /> Ministries</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/projection'}>
                                <Link href="/dashboard/projection"><Target /> Projection</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/user-settings'}>
                                <Link href="/dashboard/user-settings"><Settings /> User Settings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <Accordion type="single" collapsible defaultValue={isDevToolsActive ? "devtools" : ""} className="w-full">
                            <AccordionItem value="devtools" className="border-none">
                                <AccordionTrigger className="hover:no-underline p-0">
                                    <SidebarMenuButton asChild isActive={isDevToolsActive} className="w-full justify-start">
                                        <div><Terminal /> Dev Tools</div>
                                    </SidebarMenuButton>
                                </AccordionTrigger>
                                <AccordionContent className="p-0 pl-4">
                                    <SidebarMenu>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/user-management'}>
                                                <Link href="/dashboard/user-management"><Users className="h-4 w-4 mr-2" /> User Management</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/permission-controls'}>
                                                <Link href="/dashboard/permission-controls"><Shield className="h-4 w-4 mr-2" /> Permission Controls</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/about'}>
                                                <Link href="/dashboard/about"><Info className="h-4 w-4 mr-2" /> App Info</Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>


                        <SidebarSeparator />
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/feedback'}>
                                <Link href="/dashboard/feedback"><MessageSquare /> Feedback</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarSeparator />
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard/app-gallery'}>
                                <Link href="/dashboard/app-gallery"><AppWindow /> App Gallery</Link>
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
                <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
                    <SidebarTrigger />
                    <UserNav />
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
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
