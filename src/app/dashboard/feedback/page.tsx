
'use client';

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

export default function FeedbackPage() {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      <PageHeader
        title="Submit Feedback"
        description="We value your input. Please share your thoughts with us."
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Feedback Form</CardTitle>
                <CardDescription>Let us know how we can improve.</CardDescription>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <FeedbackForm onSuccess={() => setIsOpen(false)} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card>
          <CardHeader>
            <CardTitle>Your Submissions & Replies</CardTitle>
            <CardDescription>
              Review your past feedback and the responses from our team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your feedback submissions will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
