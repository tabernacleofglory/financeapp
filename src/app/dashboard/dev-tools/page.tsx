import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Info } from "lucide-react";
import Link from "next/link";

export default function DevToolsPage() {
    return (
        <>
            <PageHeader title="Developer Tools" description="Manage application settings, users, and permissions." />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                    <Link href="/dashboard/user-management">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Users className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>View and manage application users.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Modify user roles, reset passwords, and view user data.</p>
                        </CardContent>
                    </Link>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <Link href="/dashboard/permission-controls">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Shield className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>Permission Controls</CardTitle>
                                <CardDescription>Configure roles and access levels.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Define what different user roles can see and do within the app.</p>
                        </CardContent>
                    </Link>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                     <Link href="/dashboard/about">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Info className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle>App Information</CardTitle>
                                <CardDescription>View application details and version.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Check dependencies, environment variables, and other relevant info.</p>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </>
    )
}
