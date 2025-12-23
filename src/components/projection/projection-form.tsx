
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser } from "@/firebase"
import React, { useEffect, useMemo, useState } from "react"
import { addDoc, collection, getDocs, query, serverTimestamp, where, Timestamp, updateDoc, doc } from "firebase/firestore"
import type { FinancialRecord, Projection } from "@/lib/types"

const formSchema = z.object({
  year: z.coerce.number().min(new Date().getFullYear(), "Year cannot be in the past."),
  projection: z.coerce.number().min(0, "Projection percentage must be positive."),
})

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

interface ProjectionFormProps {
  projection?: Projection | null;
  onSuccess?: () => void;
}

export function ProjectionForm({ projection, onSuccess }: ProjectionFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [previousYearIncome, setPreviousYearIncome] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        year: new Date().getFullYear() + 1,
        projection: 0,
      },
    })

    const watchedYear = form.watch("year");
    const watchedProjection = form.watch("projection");

    React.useEffect(() => {
        if (projection) {
          form.reset({
            year: projection.year,
            projection: projection.projection,
          });
        } else {
            form.reset({
                year: new Date().getFullYear() + 1,
                projection: 0,
            });
        }
      }, [projection, form]);


    useEffect(() => {
        const fetchPreviousYearIncome = async () => {
            if (!firestore || !watchedYear) return;
            
            setIsLoading(true);
            const previousYear = watchedYear - 1;
            const startDate = new Date(previousYear, 0, 1);
            const endDate = new Date(previousYear, 11, 31, 23, 59, 59, 999);

            const givingCategories = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'First Foots'];

            const q = query(collection(firestore, "financial_records"),
                where("date", ">=", Timestamp.fromDate(startDate)),
                where("date", "<=", Timestamp.fromDate(endDate)),
                where("category", "in", givingCategories)
            );

            try {
                const querySnapshot = await getDocs(q);
                const income = querySnapshot.docs.reduce((sum, doc) => sum + (doc.data() as FinancialRecord).amount, 0);
                setPreviousYearIncome(income);
            } catch (error) {
                console.error("Error fetching previous year income:", error);
                setPreviousYearIncome(0);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch income data for the previous year.",
                })
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreviousYearIncome();
    }, [watchedYear, firestore, toast]);

    const projectedState = useMemo(() => {
        return previousYearIncome * (1 + (watchedProjection / 100));
    }, [previousYearIncome, watchedProjection]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to manage projections.",
        });
        return;
    }

    try {
        const data = {
            ...values,
            userId: user.uid,
            previousYearIncome,
            projectedState,
            createdAt: serverTimestamp() // will be updated on edit but that is fine
        };

        if (projection) {
            const projectionRef = doc(firestore, "projections", projection.id);
            await updateDoc(projectionRef, data);
            toast({
                title: "Projection Updated",
                description: `The projection for ${values.year} has been updated.`,
            });
        } else {
            await addDoc(collection(firestore, "projections"), data);
            toast({
                title: "Projection Added",
                description: `A new projection for ${values.year} has been added.`,
            });
        }
        onSuccess?.();
    } catch (error) {
        console.error("Error saving projection:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save projection. Please try again.",
        })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projection (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
            <FormLabel>Projected State ($)</FormLabel>
            <Input 
                value={formatCurrency(projectedState)} 
                readOnly 
                disabled
                className="font-medium bg-muted"
            />
            <FormDescription>
                {isLoading ? "Calculating..." : 
                `Based on ${formatCurrency(previousYearIncome)} income in ${watchedYear - 1}.`
                }
            </FormDescription>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>Submit</Button>
      </form>
    </Form>
  )
}
