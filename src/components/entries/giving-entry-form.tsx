
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
import { Minus, Plus, Settings, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import React, { useState, useEffect, useMemo } from "react"
import { Label } from "../ui/label"
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { addDoc, collection, doc, getDoc, orderBy, query, serverTimestamp, setDoc, writeBatch } from "firebase/firestore"
import type { Campus, PermissionRow, UserProfile, FormOptions } from "@/lib/types"
import { GroupedEntry } from "./entries-by-campus"
import { initialPermissions } from "@/lib/permissions"
import { ManageFormOptionsDialog } from "../shared/manage-form-options-dialog"

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

const GIVING_CATEGORIES = ['Offerings', 'Tithes', '365 Offerings', 'First Fruit Offerings', 'Salomon Offerings'];
const ALL_CATEGORIES = [...GIVING_CATEGORIES, 'Attendance'];


interface GivingEntryFormProps {
    editingEntry?: GroupedEntry | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function GivingEntryForm({ editingEntry, onSuccess, onCancel }: GivingEntryFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [isManageServiceTimesOpen, setIsManageServiceTimesOpen] = useState(false);
    const [isManageServiceTypesOpen, setIsManageServiceTypesOpen] = useState(false);
    
    const campusesQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, "campuses"), orderBy("name", "asc")) : null,
      [firestore]
    );
    const { data: campuses } = useCollection<Campus>(campusesQuery);

    const userDocRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const permissionsDocRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'permissions', 'matrix') : null, [firestore, user]);
    const { data: permissionsData } = useDoc<{rules: PermissionRow[]}>(permissionsDocRef);

    const serviceTypesRef = useMemoFirebase(() => firestore ? doc(firestore, 'form_options', 'serviceTypes') : null, [firestore]);
    const { data: serviceTypesDoc, isLoading: isLoadingServiceTypes } = useDoc<FormOptions>(serviceTypesRef);

    const serviceTimesRef = useMemoFirebase(() => firestore ? doc(firestore, 'form_options', 'serviceTimes') : null, [firestore]);
    const { data: serviceTimesDoc, isLoading: isLoadingServiceTimes } = useDoc<FormOptions>(serviceTimesRef);

    useEffect(() => {
        if (!firestore) return;

        const seedOptions = async (docRef: any, initialOptions: any) => {
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await setDoc(docRef, { options: initialOptions });
            }
        };

        if (serviceTypesRef) {
            seedOptions(serviceTypesRef, [
                { value: "SUNDAY_SERVICE", label: "Sunday Service" },
                { value: "MIDWEEK_SERVICE", label: "Midweek Service" },
                { value: "SPECIAL_EVENT", label: "Special Event" },
            ]);
        }

        if (serviceTimesRef) {
            seedOptions(serviceTimesRef, [
                { value: "6:00:00 AM", label: "6:00 AM" },
                { value: "8:00:00 AM", label: "8:00 AM" },
                { value: "9:00:00 AM", label: "9:00 AM" },
                { value: "11:00:00 AM", label: "11:00 AM" },
                { value: "5:00:00 PM", label: "5:00 PM" },
                { value: "6:00:00 PM", label: "6:00 PM" },
                { value: "7:00:00 PM", label: "7:00 PM" },
            ]);
        }
    }, [firestore, serviceTimesRef, serviceTypesRef]);

    const serviceTypes = serviceTypesDoc?.options || [];
    const serviceTimes = serviceTimesDoc?.options || [];


    const userPermissions = useMemo(() => {
        if (!userProfile) return {};

        const rules = permissionsData?.rules || initialPermissions;

        if (userProfile.access && Array.isArray(userProfile.access) && userProfile.access.length > 0) {
            const userAccessPermissions: Record<string, boolean> = {};
            rules.forEach(rule => {
                userAccessPermissions[rule.feature] = userProfile.access!.includes(rule.feature);
            });
            return userAccessPermissions;
        }

        // Fallback to role-based permissions
        const role = userProfile.role || 'Guest';
        const permissions: Record<string, boolean> = {};
        rules.forEach(rule => {
            const roleKey = role as keyof typeof rule.permissions;
            permissions[rule.feature] = rule.permissions[roleKey] || false;
        });
        return permissions;
    }, [userProfile, permissionsData]);


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

  return (
    <>
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
                        <FormControl>
                            <Input
                                type="date"
                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const dateString = e.target.value;
                                    if (dateString) {
                                        field.onChange(new Date(dateString + 'T00:00:00'));
                                    } else {
                                        field.onChange(null);
                                    }
                                }}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                name={field.name}
                                disabled={field.disabled}
                            />
                        </FormControl>
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingServiceTimes}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingServiceTimes ? "Loading..." : "Select a time"} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {serviceTimes.map(time => <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsManageServiceTimesOpen(true)}>
                                <Settings className="h-4 w-4" />
                            </Button>
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
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingServiceTypes}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingServiceTypes ? "Loading..." : "Select a type"} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {serviceTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsManageServiceTypesOpen(true)}>
                                <Settings className="h-4 w-4" />
                            </Button>
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
                    {userPermissions['Entries > Edit Offerings'] && (
                        <FormField
                            key="Offerings"
                            control={form.control}
                            name="Offerings"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Offerings</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {userPermissions['Entries > Edit Tithes'] && (
                        <FormField
                            key="Tithes"
                            control={form.control}
                            name="Tithes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tithes</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {userPermissions['Entries > Edit 365 Offerings'] && (
                        <FormField
                            key="365 Offerings"
                            control={form.control}
                            name="365 Offerings"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>365 Offerings</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {userPermissions['Entries > Edit First Fruit Offerings'] && (
                        <FormField
                            key="First Fruit Offerings"
                            control={form.control}
                            name="First Fruit Offerings"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Fruit Offerings</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {userPermissions['Entries > Edit Salomon Offerings'] && (
                        <FormField
                            key="Salomon Offerings"
                            control={form.control}
                            name="Salomon Offerings"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salomon Offerings</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {userPermissions['Entries > Edit Attendance'] && (
                        <FormField
                            key="Attendance"
                            control={form.control}
                            name="Attendance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Attendance</FormLabel>
                                    <FormControl>
                                        <NumberInputWithSteppers field={field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </CardContent>
              </Card>

                <div className="flex justify-end space-x-2 pt-8">
                    <Button variant="outline" type="button" onClick={() => { form.reset(); onCancel?.(); }}>Cancel</Button>
                    <Button type="submit">{editingEntry ? 'Update' : 'Submit'}</Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
    <ManageFormOptionsDialog 
        open={isManageServiceTimesOpen} 
        onOpenChange={setIsManageServiceTimesOpen}
        optionId="serviceTimes"
        title="Manage Service Times"
        description="Add, edit, or delete service times."
        noun="Time"
    />
    <ManageFormOptionsDialog
        open={isManageServiceTypesOpen}
        onOpenChange={setIsManageServiceTypesOpen}
        optionId="serviceTypes"
        title="Manage Service Types"
        description="Add, edit, or delete service types."
        noun="Type"
    />
    </>
  )
}
