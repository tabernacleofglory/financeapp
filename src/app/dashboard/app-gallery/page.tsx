import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppGalleryPage() {
    return (
        <>
            <PageHeader title="App Gallery" description="Explore other applications." />
            <Card>
                <CardHeader>
                    <CardTitle>App Gallery</CardTitle>
                    <CardDescription>Discover more apps from our suite.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">App gallery content will be displayed here.</p>
                </CardContent>
            </Card>
        </>
    )
}
