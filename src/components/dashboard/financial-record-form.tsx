
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser } from "@/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import React from "react"

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be positive."),
  category: z.enum(["Income", "Expenses", "Investments", "Savings", "First Foots", "Tithes", "365 Offerings", "First Fruit Offerings", "Salomon Offerings"]),
  date: z.date(),
  notes: z.string().optional(),
})

export function FinancialRecordForm({ category, onSuccess } : { category?: z.infer<typeof formSchema>['category'], onSuccess?: () => void}) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        notes: "",
        date: new Date(),
        category: category,
    },
  })

  React.useEffect(() => {
    form.reset({
        notes: "",
        date: new Date(),
        category: category,
    })
  }, [category, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add a record.",
      });
      return;
    }

    try {
        const collectionRef = collection(firestore, 'financial_records');
        await addDoc(collectionRef, {
            ...values,
            userId: user.uid,
            createdAt: serverTimestamp()
        });

        toast({
            title: "Record Added",
            description: "Your financial record has been successfully added.",
        });
        form.reset();
        onSuccess?.();

    } catch (error) {
        console.error("Error adding financial record:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add financial record. Please try again.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expenses">Expenses</SelectItem>
                  <SelectItem value="Investments">Investments</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                   <SelectItem value="First Foots">First Foots</SelectItem>
                   <SelectItem value="Tithes">Tithes</SelectItem>
                    <SelectItem value="365 Offerings">365 Offerings</SelectItem>
                    <SelectItem value="First Fruit Offerings">First Fruit Offerings</SelectItem>
                    <SelectItem value="Salomon Offerings">Salomon Offerings</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes..." {...field} />
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
