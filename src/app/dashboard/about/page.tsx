import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export default function AboutPage() {
    return (
        <>
            <PageHeader title="About TG Finance" description="A comprehensive financial management and reporting tool." />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to TG Finance</CardTitle>
                        <CardDescription>Version 1.0.0</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground max-w-3xl">
                            The TG Finance application is a powerful, integrated platform designed to provide real-time insights into your organization's financial health. It offers a centralized dashboard for tracking key performance indicators, managing financial records, and analyzing giving trends across various campuses and regions.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Core Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <FeatureListItem>
                                <strong>Interactive Dashboard:</strong> Get a comprehensive, at-a-glance view of your organization's finances. The dashboard includes KPI cards for total giving, attendance, and various offering categories, all filterable by a custom date range.
                            </FeatureListItem>
                             <FeatureListItem>
                                <strong>Detailed Financial Analysis:</strong> Dive deep into your data with detailed charts showing giving over time, breakdowns by category, and percentage-based distribution of funds.
                            </FeatureListItem>
                            <FeatureListItem>
                                <strong>Campus & Regional Summaries:</strong> Monitor performance across all locations with summary tables that group giving data by region, providing insights into attendance, reported amounts, and week-over-week changes.
                            </FeatureListItem>
                            <FeatureListItem>
                                <strong>Centralized Data Entry:</strong> A unified form allows for the submission of all financial records, including offerings, tithes, attendance, and other giving categories for specific service times and types.
                            </FeatureListItem>
                             <FeatureListItem>
                                <strong>Financial Projections:</strong> Plan for the future by creating and managing financial projections based on historical income data and projected growth percentages.
                            </FeatureListItem>
                            <FeatureListItem>
                                <strong>User & Access Management:</strong> A suite of developer tools allows for comprehensive user management and fine-grained permission controls, ensuring that users only have access to the features relevant to their role.
                            </FeatureListItem>
                             <FeatureListItem>
                                <strong>Master Data Management:</strong> Easily manage core application data such as Campuses, Ministries, and Regions through dedicated management pages.
                            </FeatureListItem>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
