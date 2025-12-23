
'use client';

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/shared/date-range-picker";

export default function UserSettingsPage() {
    return (
        <>
            <PageHeader title="User Settings" description="Manage your account settings." />
            <Card>
                <CardHeader>
                    <CardTitle>User Settings</CardTitle>
                    <CardDescription>Update your profile and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Date Range</label>
                        <DateRangePicker />
                    </div>
                    <p className="text-muted-foreground pt-4">Other user settings will be displayed here.</p>
                </CardContent>
            </Card>
        </>
    )
}
