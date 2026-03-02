
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { Resource } from "@/lib/types";
import React from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional(),
  type: z.enum(["Link", "Video", "Image", "Document", "Memo"]),
  url: z.string().optional(),
  content: z.string().optional(),
}).refine(data => {
    if (['Link', 'Video', 'Image', 'Document'].includes(data.type)) {
        return !!data.url && z.string().url().safeParse(data.url).success;
    }
    return true;
}, {
    message: "A valid URL is required for this resource type.",
    path: ["url"],
}).refine(data => {
    if (data.type === 'Memo') {
        return !!data.content && data.content.length > 0;
    }
    return true;
}, {
    message: "Content is required for memos.",
    path: ["content"],
});

type ResourceFormValues = z.infer<typeof formSchema>;

interface ResourceFormProps {
  resource?: Resource | null;
  onSuccess?: () => void;
}

export function ResourceForm({ resource, onSuccess }: ResourceFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || "",
      description: resource?.description || "",
      type: resource?.type || "Link",
      url: resource?.url || "",
      content: resource?.content || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      title: resource?.title || "",
      description: resource?.description || "",
      type: resource?.type || "Link",
      url: resource?.url || "",
      content: resource?.content || "",
    });
  }, [resource, form]);
  
  const watchedType = form.watch("type");

  async function onSubmit(values: ResourceFormValues) {
    if (!firestore || !user) return;
    try {
        const data = {
            ...values,
            userId: user.uid,
            createdAt: serverTimestamp(),
        };

        if(resource) {
            const resourceRef = doc(firestore, "resources", resource.id);
            await updateDoc(resourceRef, {
                 ...values,
                 userId: user.uid, // ensure userId is not lost
            });
            toast({ title: "Resource Updated", description: `"${values.title}" updated.`});
        } else {
            await addDoc(collection(firestore, "resources"), data);
            toast({ title: "Resource Added", description: `"${values.title}" added.`});
        }
        onSuccess?.();
    } catch (error) {
        console.error("Error saving resource:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save resource. Please try again.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Q1 Financial Report" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short summary of the resource." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resource type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Link">Link</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Memo">Memo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {['Link', 'Video', 'Image', 'Document'].includes(watchedType) && (
            <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                    <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        {watchedType === 'Memo' && (
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                    <Textarea placeholder="Write your memo content here..." rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        <Button type="submit" className="w-full">
          {resource ? "Save Changes" : "Add Resource"}
        </Button>
      </form>
    </Form>
  );
}
