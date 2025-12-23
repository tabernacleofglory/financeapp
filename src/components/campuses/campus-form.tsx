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
import type { Campus } from "@/lib/types"
import React from "react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email.").optional().or(z.literal("")),
  address: z.string().optional(),
  latlong: z.string().optional(),
  country: z.string().optional(),
  areaCode: z.string().optional(),
  image: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
})

interface CampusFormProps {
  campus?: Campus | null;
  onSuccess?: () => void;
}

export function CampusForm({ campus, onSuccess }: CampusFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
          name: "",
          phone: "",
          email: "",
          address: "",
          latlong: "",
          country: "",
          areaCode: "",
          image: "",
      },
    })

    React.useEffect(() => {
      if (campus) {
        form.reset({
          name: campus.name || "",
          phone: campus.phone || "",
          email: campus.email || "",
          address: campus.address || "",
          latlong: campus.latlong || "",
          country: campus.country || "",
          areaCode: campus.areaCode || "",
          image: campus.image || "",
        })
      } else {
        form.reset({
          name: "",
          phone: "",
          email: "",
          address: "",
          latlong: "",
          country: "",
          areaCode: "",
          image: "",
        })
      }
    }, [campus, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!firestore) return;
    try {
        if (campus) {
            // Update existing campus
            const campusRef = doc(firestore, "campuses", campus.id);
            await updateDoc(campusRef, values);
            toast({
                title: "Campus Updated",
                description: `The campus "${values.name}" has been successfully updated.`,
            });
        } else {
            // Add new campus
            await addDoc(collection(firestore, "campuses"), {
                ...values,
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Campus Added",
                description: `The campus "${values.name}" has been successfully added.`,
            });
        }
        form.reset();
        onSuccess?.();
    } catch (error) {
        console.error("Error saving campus:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save campus. Please try again.",
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
              <FormLabel>Campus Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Campus" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="e.g., (123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g., contact@maincampus.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="latlong"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude, Longitude</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 40.7128, -74.0060" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="e.g., USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="areaCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="e.g., https://example.com/image.jpg" {...field} />
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
