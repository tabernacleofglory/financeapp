'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DateRange } from 'react-day-picker';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  hpNumber: z.string().optional(),
  photoURL: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
});

export default function UserSettingsPage() {
    const { user } = useUser();
    const { userProfile, isUserProfileLoading } = useAuthContext();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>(undefined);

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            hpNumber: "",
            photoURL: "",
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName || "",
                lastName: userProfile.lastName || "",
                hpNumber: userProfile.hpNumber || "",
                photoURL: userProfile.photoURL || "",
            });
        }
    }, [userProfile, form]);

    async function onSubmit(values: z.infer<typeof profileFormSchema>) {
        if (!user || !firestore) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save profile. User or database not found.",
            });
            return;
        }
        try {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                ...values,
                name: `${values.firstName} ${values.lastName}`.trim(),
            });
            toast({
                title: "Profile updated",
                description: "Your profile information has been successfully updated.",
            });
            form.reset(values); // Re-set to new values to make form not dirty
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update your profile. Please try again.",
            });
        }
    }


    if (isUserProfileLoading) {
        return (
            <>
                <PageHeader title="User Settings" description="Manage your account settings." />
                <Card>
                    <CardHeader className='flex-row items-center gap-4'>
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </>
        )
    }

    return (
        <>
            <PageHeader title="User Settings" description="Manage your personal profile and preferences." />
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={form.watch('photoURL') || ''} alt={userProfile?.name} />
                                            <AvatarFallback>
                                                {(userProfile?.firstName?.charAt(0) || '') + (userProfile?.lastName?.charAt(0) || '')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <FormField
                                            control={form.control}
                                            name="photoURL"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                <FormLabel>Photo URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com/photo.jpg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="hpNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>HP Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        <Label>Campus</Label>
                                        <Input value={userProfile?.campus || ''} readOnly disabled />
                                    </div>
                                     <div>
                                        <Label>Ministry</Label>
                                        <Input value={userProfile?.ministry || ''} readOnly disabled />
                                     </div>
                                </CardContent>
                                <CardFooter className="justify-end">
                                    <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>Save Changes</Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </div>
                <div className="md:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label>Email</Label>
                                <Input value={userProfile?.email || ''} readOnly disabled />
                             </div>
                             <div>
                                <Label>Role</Label>
                                <Input value={userProfile?.role || ''} readOnly disabled />
                             </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Default Date Range</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const fromDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                                            setDate((prev) => ({ ...prev, from: fromDate }));
                                        }}
                                    />
                                    <span>-</span>
                                    <Input
                                        type="date"
                                        value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const toDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                                            setDate((prev) => ({ ...prev, to: toDate }));
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground pt-2">Set your default date range for the dashboard.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
