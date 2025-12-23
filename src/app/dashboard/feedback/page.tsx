import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        title="Submit Feedback"
        description="We value your input. Please share your thoughts with us."
      />
      <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Feedback Form</CardTitle>
                <CardDescription>Let us know how we can improve.</CardDescription>
            </CardHeader>
            <CardContent>
                <FeedbackForm />
            </CardContent>
        </Card>
      </div>
    </>
  );
}
