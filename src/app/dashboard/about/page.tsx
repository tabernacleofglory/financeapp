import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <>
            <PageHeader title="About" description="Information about the application." />
            <Card>
                <CardHeader>
                    <CardTitle>About TG Finance</CardTitle>
                    <CardDescription>Version 1.0.0</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This is a financial management application designed to help you track your finances efficiently.</p>
                </CardContent>
            </Card>
        </>
    )
}
