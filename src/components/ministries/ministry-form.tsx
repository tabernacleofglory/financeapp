
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFirestore } from "@/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
})

export function MinistryForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!firestore) return;
    try {
        await addDoc(collection(firestore, "ministries"), {
            ...values,
            createdAt: serverTimestamp(),
        });

        toast({
            title: "Ministry Added",
            description: `The ministry "${values.name}" has been successfully added.`,
        })
        form.reset();
        onSuccess?.();
    } catch (error) {
        console.error("Error adding ministry:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add ministry. Please try again.",
        })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ministry Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Worship Team" {...field} />
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
                <Textarea placeholder="e.g., Leads worship during services." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit</Button>
      </form>
    </Form>
  )
}

    