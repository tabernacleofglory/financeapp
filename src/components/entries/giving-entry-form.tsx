
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
import { CalendarIcon, Minus, Plus, Settings, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"
import React, { useState, useEffect } from "react"
import { Label } from "../ui/label"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { addDoc, collection, doc, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore"
import type { Campus } from "@/lib/types"
import { GroupedEntry } from "./entries-by-campus"

const formSchema = z.object({
  reporterFullName: z.string().min(2, "Full name is required."),
  campus: z.string().min(1, "Campus is required."),
  date: z.date(),
  serviceTime: z.string().min(1, "Service time is required."),
  serviceType: z.string().min(1, "Service type is required."),
  Offerings: z.coerce.number().min(0).default(0),
  Tithes: z.coerce.number().min(0).default(0),
  '365 Offerings': z.coerce.number().min(0).default(0),
  'First Fruit Offerings': z.coerce.number().min(0).default(0),
  'Salomon Offerings': z.coerce.number().min(0).default(0),
  Attendance: z.coerce.number().min(0).default(0),
  'First Foots': z.coerce.number().min(0).default(0),
})

const NumberInputWithSteppers = ({ field }: { field: any }) => {
    const isCurrency = !field.name.includes('Attendance');
    const [isEditing, setIsEditing] = useState(false);

    const handleValueChange = (newValue: number) => {
        const finalValue = Math.max(0, newValue);
        field.onChange(finalValue);
    }
    
    const displayValue = isEditing 
      ? field.value
      : isCurrency 
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(field.value || 0)
        : field.value;

    return (
        <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="icon" onClick={() => handleValueChange(field.value - 1)}>
                <Minus className="h-4 w-4" />
            </Button>
            <Input 
                type={isEditing ? "number" : "text"}
                value={displayValue}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                onChange={(e) => {
                    const numericValue = e.target.valueAsNumber;
                    if (!isNaN(numericValue)) {
                        field.onChange(numericValue);
                    } else if (e.target.value === '') {
                        field.onChange(0);
                    }
                }}
                className="flex-1 text-center"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => handleValueChange(field.value + 1)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
};

const GIVING_CATEGORIES = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings', 'First Foots'];
const ALL_CATEGORIES = [...GIVING_CATEGORIES, 'Attendance'];


interface GivingEntryFormProps {
    editingEntry?: GroupedEntry | null;
    onSuccess?: () => void;
}

export function GivingEntryForm({ editingEntry, onSuccess }: GivingEntryFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const [serviceTimes, setServiceTimes] = useState([
        { value: "6:00:00 AM", label: "6:00 AM" },
        { value: "8:00:00 AM", label: "8:00 AM" },
        { value: "9:00:00 AM", label: "9:00 AM" },
        { value: "11:00:00 AM", label: "11:00 AM" },
        { value: "5:00:00 PM", label: "5:00 PM" },
        { value: "6:00:00 PM", label: "6:00 PM" },
        { value: "7:00:00 PM", label: "7:00 PM" },
    ]);
    const [serviceTypes, setServiceTypes] = useState([
        { value: "SUNDAY_SERVICE", label: "Sunday Service" },
        { value: "MIDWEEK_SERVICE", label: "Midweek Service" },
        { value: "SPECIAL_EVENT", label: "Special Event" },
    ]);
    
    const campusesQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, "campuses"), orderBy("name", "asc")) : null,
      [firestore]
    );
    const { data: campuses } = useCollection<Campus>(campusesQuery);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          reporterFullName: user?.displayName || "",
          date: new Date(),
          campus: "",
          serviceTime: "",
          serviceType: "",
          Offerings: 0,
          Tithes: 0,
          '365 Offerings': 0,
          'First Fruit Offerings': 0,
          'Salomon Offerings': 0,
          'First Foots': 0,
          Attendance: 0,
        },
      })
    
      useEffect(() => {
        if (editingEntry) {
            const date = editingEntry.date?.seconds ? new Date(editingEntry.date.seconds * 1000) : new Date();
            form.reset({
                reporterFullName: editingEntry.reporterFullName,
                campus: editingEntry.campus,
                date: date,
                serviceTime: editingEntry.serviceTime,
                serviceType: editingEntry.serviceType,
                Offerings: (editingEntry.Offerings as number) || 0,
                Tithes: (editingEntry.Tithes as number) || 0,
                '365 Offerings': (editingEntry['365 Offerings'] as number) || 0,
                'First Fruit Offerings': (editingEntry['First Fruit Offerings'] as number) || 0,
                'Salomon Offerings': (editingEntry['Salomon Offerings'] as number) || 0,
                'First Foots': (editingEntry['First Foots'] as number) || 0,
                Attendance: (editingEntry.Attendance as number) || 0,
            });
        } else {
            form.reset({
                reporterFullName: user?.displayName || "",
                date: new Date(),
                campus: "",
                serviceTime: "",
                serviceType: "",
                Offerings: 0,
                Tithes: 0,
                '365 Offerings': 0,
                'First Fruit Offerings': 0,
                'Salomon Offerings': 0,
                'First Foots': 0,
                Attendance: 0,
            });
        }
    }, [editingEntry, form, user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit an entry.",
      });
      return;
    }

    try {
        const batch = writeBatch(firestore);
        const recordsCollection = collection(firestore, "financial_records");

        const commonData = {
            userId: user.uid,
            reporterFullName: values.reporterFullName,
            campus: values.campus,
            date: values.date,
            serviceTime: values.serviceTime,
            serviceType: values.serviceType,
            createdAt: serverTimestamp(),
        };

        for (const category of ALL_CATEGORIES) {
            const formAmount = values[category as keyof typeof values] as number;
            const docId = editingEntry?.docIds[category];

            if (formAmount > 0) {
                const recordData = { ...commonData, amount: formAmount, category };
                if (docId) {
                    // Update existing document
                    batch.set(doc(recordsCollection, docId), recordData, { merge: true });
                } else {
                    // Create new document
                    const newRecordRef = doc(recordsCollection);
                    batch.set(newRecordRef, recordData);
                }
            } else if (docId) {
                // Delete document if amount is zeroed out
                batch.delete(doc(recordsCollection, docId));
            }
        }
        
      await batch.commit();

      toast({
          title: editingEntry ? "Entry Updated" : "Entry Submitted",
          description: `The giving entry has been successfully ${editingEntry ? 'updated' : 'submitted'}.`,
      });
      form.reset();
      onSuccess?.();

    } catch (error) {
      console.error("Error submitting entry: ", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was an error submitting your entry. Please try again.",
      });
    }
  }

  const ManageOptionsDialog = ({ 
    title, 
    description,
    options,
    setOptions,
    noun
  }: { 
    title: string, 
    description: string,
    options: {value: string, label: string}[],
    setOptions: React.Dispatch<React.SetStateAction<{value: string, label: string}[]>>,
    noun: string
  }) => {
    const [newItem, setNewItem] = useState('');
    const handleAddItem = () => {
        if (newItem.trim() !== '' && !options.some(opt => opt.label === newItem.trim())) {
            const newValue = newItem.trim().toUpperCase().replace(/\s+/g, '_');
            setOptions([...options, { value: newValue, label: newItem.trim() }]);
            setNewItem('');
            toast({ title: `${noun} added`, description: `"${newItem.trim()}" has been added.`});
        }
    };
    
    const handleRemoveItem = (value: string) => {
        const itemToRemove = options.find(opt => opt.value === value);
        if (itemToRemove) {
            setOptions(options.filter(opt => opt.value !== value));
            toast({ title: `${noun} removed`, description: `"${itemToRemove.label}" has been removed.`});
        }
    };

    return (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label>Current {noun}s</Label>
                    <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                        {options.map(option => (
                            <div key={option.value} className="flex items-center justify-between">
                                <span>{option.label}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(option.value)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                         {options.length === 0 && <p className="text-muted-foreground text-sm text-center">No {noun}s found.</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="new-item">Add New {noun}</Label>
                    <div className="flex items-center space-x-2">
                        <Input 
                            id="new-item"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={`New ${noun}...`}
                        />
                        <Button onClick={handleAddItem}>Add</Button>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )};

  return (
    <Card className="border-0 shadow-none">
        <CardContent className="p-4 md:p-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormField
                  control={form.control}
                  name="reporterFullName"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Reporter Full Name*</FormLabel>
                      <FormControl>
                          <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />

                  <FormField
                  control={form.control}
                  name="campus"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>CAMPUS*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select a campus" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {campuses?.map(campus => (
                            <SelectItem key={campus.id} value={campus.name}>{campus.name}</SelectItem>
                          ))}
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
                      <FormItem>
                      <FormLabel>DATE*</FormLabel>
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
                              initialFocus
                          />
                          </PopoverContent>
                      </Popover>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  
                  <div />

                  <FormField
                  control={form.control}
                  name="serviceTime"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Time*</FormLabel>
                        <div className="flex items-center gap-2">
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a time" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {serviceTimes.map(time => <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <ManageOptionsDialog 
                                title="Manage Service Times" 
                                description="Add, edit, or delete service times."
                                options={serviceTimes}
                                setOptions={setServiceTimes}
                                noun="Time"
                            />
                        </div>
                        <FormMessage />
                      </FormItem>
                  )}
                  />

                  <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type*</FormLabel>
                        <div className="flex items-center gap-2">
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {serviceTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <ManageOptionsDialog 
                                title="Manage Service Types" 
                                description="Add, edit, or delete service types."
                                options={serviceTypes}
                                setOptions={setServiceTypes}
                                noun="Type"
                             />
                        </div>
                        <FormMessage />
                      </FormItem>
                  )}
                  />
                </CardContent>
              </Card>
                
              <Card>
                <CardHeader><CardTitle>Contributions & Attendance</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    {ALL_CATEGORIES.map(category => (
                        <FormField
                            key={category}
                            control={form.control}
                            name={category as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{category}</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </CardContent>
              </Card>

                <div className="flex justify-end space-x-2 pt-8">
                    <Button variant="outline" type="button" onClick={() => form.reset()}>Cancel</Button>
                    <Button type="submit">{editingEntry ? 'Update' : 'Submit'}</Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  )
}
