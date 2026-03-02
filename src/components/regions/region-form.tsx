
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
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import type { Region } from "@/lib/types"
import React from "react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
})

interface RegionFormProps {
    region?: Region | null;
    onSuccess?: () => void;
}

export function RegionForm({ region, onSuccess }: RegionFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    React.useEffect(() => {
        if (region) {
            form.reset({
                name: region.name || "",
            })
        } else {
            form.reset({
                name: "",
            })
        }
    }, [region, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!firestore) return;
    try {
        if (region) {
            const regionRef = doc(firestore, "regions", region.id);
            await updateDoc(regionRef, values);
            toast({
                title: "Region Updated",
                description: `The region "${values.name}" has been successfully updated.`,
            });
        } else {
            await addDoc(collection(firestore, "regions"), {
                ...values,
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Region Added",
                description: `The region "${values.name}" has been successfully added.`,
            })
        }
        form.reset();
        onSuccess?.();
    } catch (error) {
        console.error("Error saving region:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save region. Please try again.",
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
              <FormLabel>Region Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., North America" {...field} />
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
