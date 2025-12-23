

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
import { useToast } from "@/hooks/use-toast"
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, doc, orderBy, query, updateDoc, setDoc, serverTimestamp } from "firebase/firestore"
import type { Campus, Ministry, UserProfile } from "@/lib/types"
import { useMemo, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useAuth } from "@/firebase/provider"

const generateFormSchema = (isEditing: boolean) => {
    return z.object({
        firstName: z.string().min(1, "First name is required."),
        lastName: z.string().min(1, "Last name is required."),
        email: z.string().email("Please enter a valid email address."),
        password: isEditing 
            ? z.string().optional() 
            : z.string().min(6, "Password must be at least 6 characters."),
        photoURL: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
        role: z.enum(["Developer", "Admin", "Tech Support", "Team", "Volunteer", "User", "Guest"]),
        campus: z.string().optional(),
        ministry: z.string().optional(),
        hpNumber: z.string().optional(),
    });
}

const allRoles: UserProfile['role'][] = ["Developer", "Admin", "Tech Support", "Team", "Volunteer", "User", "Guest"];
const roleHierarchy: Record<UserProfile['role'], number> = {
    'Developer': 0,
    'Admin': 1,
    'Tech Support': 2,
    'Team': 3,
    'Volunteer': 4,
    'User': 5,
    'Guest': 6,
};


interface UserEditFormProps {
    user: UserProfile | null;
    onSuccess?: () => void;
}

export function UserEditForm({ user: userToEdit, onSuccess }: UserEditFormProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user: currentUser } = useUser();
    const isEditing = !!userToEdit;

    const formSchema = useMemo(() => generateFormSchema(isEditing), [isEditing]);


    const campusesQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, "campuses"), orderBy("name", "asc")) : null,
        [firestore]
    );
    const { data: campuses, isLoading: isLoadingCampuses } = useCollection<Campus>(campusesQuery);

    const ministriesQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, "ministries"), orderBy("name", "asc")) : null,
        [firestore]
    );
    const { data: ministries, isLoading: isLoadingMinistries } = useCollection<Ministry>(ministriesQuery);

    const currentUserDocRef = useMemoFirebase(
      () => (firestore && currentUser) ? doc(firestore, 'users', currentUser.uid) : null,
      [firestore, currentUser]
    );
    const { data: currentUserProfile } = useDoc<UserProfile>(currentUserDocRef);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            photoURL: "",
            role: "User",
            campus: "",
            ministry: "",
            hpNumber: "",
            password: "",
        },
    });

    useEffect(() => {
        if (userToEdit) {
            form.reset({
                firstName: userToEdit.firstName || "",
                lastName: userToEdit.lastName || "",
                email: userToEdit.email || "",
                photoURL: userToEdit.photoURL || "",
                role: userToEdit.role,
                campus: userToEdit.campus || "",
                ministry: userToEdit.ministry || "",
                hpNumber: userToEdit.hpNumber || "",
                password: "",
            });
        } else {
            form.reset({
                firstName: "",
                lastName: "",
                email: "",
                photoURL: "",
                role: "User",
                campus: "",
                ministry: "",
                hpNumber: "",
                password: "",
            });
        }
    }, [userToEdit, form]);

    const isRoleEditable = useMemo(() => {
        if (!currentUserProfile) return false;
        if (currentUserProfile.role === 'Developer') return true;
        if (isEditing && currentUserProfile.uid === userToEdit?.uid) return false;
        const currentUserLevel = roleHierarchy[currentUserProfile.role];
        const targetUserLevel = isEditing ? roleHierarchy[userToEdit.role] : Infinity; // New users are assignable
        return currentUserLevel < targetUserLevel;
    }, [currentUserProfile, userToEdit, isEditing]);


    const availableRoles = useMemo(() => {
        if (!currentUserProfile) return [];
        const currentUserLevel = roleHierarchy[currentUserProfile.role];
        return allRoles.filter(role => roleHierarchy[role] >= currentUserLevel);
    }, [currentUserProfile]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) return;

        if (isEditing && userToEdit) {
             try {
                const userRef = doc(firestore, "users", userToEdit.uid);
                const updatedValues = {
                    ...values,
                    name: `${values.firstName} ${values.lastName}`.trim(),
                };
                delete (updatedValues as any).password;
                
                await updateDoc(userRef, updatedValues);

                toast({
                    title: "User Updated",
                    description: `The profile for "${updatedValues.name}" has been successfully updated.`,
                });
                onSuccess?.();
            } catch (error) {
                console.error("Error updating user:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not update user profile. Please try again.",
                });
            }
        } else {
            // Create new user
            if (!values.password) {
                form.setError("password", { type: "manual", message: "Password is required for new users."});
                return;
            }
             if (!auth) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Auth service not available.",
                });
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const newUser = userCredential.user;
                
                const displayName = `${values.firstName} ${values.lastName}`.trim();

                const userRef = doc(firestore, 'users', newUser.uid);
                const userData = {
                    uid: newUser.uid,
                    email: values.email,
                    name: displayName,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    photoURL: values.photoURL || '',
                    role: values.role,
                    campus: values.campus || '',
                    ministry: values.ministry || '',
                    hpNumber: values.hpNumber || '',
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp(),
                };

                await setDoc(userRef, userData);

                toast({
                    title: "User Created",
                    description: `User ${displayName} has been created successfully.`,
                });
                onSuccess?.();

            } catch (error: any) {
                console.error("Error creating user:", error);
                 toast({
                    variant: "destructive",
                    title: "Error Creating User",
                    description: error.message || "Could not create user. Please try again.",
                });
            }
        }
    }

    const derivedFullName = `${form.watch('firstName') || ''} ${form.watch('lastName') || ''}`.trim();
    const photoUrl = form.watch('photoURL');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={photoUrl || userToEdit?.photoURL} alt={userToEdit?.name} />
                        <AvatarFallback>
                            {(form.watch('firstName')?.charAt(0) || '') + (form.watch('lastName')?.charAt(0) || '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                        <Input value={derivedFullName || "User Profile"} readOnly disabled className="text-lg font-bold bg-muted border-none"/>
                        {isEditing && <p className="text-sm text-muted-foreground -mt-2">{userToEdit?.email}</p>}
                    </div>
                </div>

                 <FormField
                    control={form.control}
                    name="photoURL"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/photo.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John" {...field} />
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
                                    <Input placeholder="e.g., Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., john.doe@example.com" {...field} disabled={isEditing} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 {!isEditing && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Set a password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="hpNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>HP Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., +1234567890" {...field} />
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
                            <FormLabel>Campus</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCampuses}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingCampuses ? "Loading campuses..." : "Select a campus"} />
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
                    name="ministry"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ministry</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingMinistries}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingMinistries ? "Loading ministries..." : "Select a ministry"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ministries?.map(ministry => (
                                        <SelectItem key={ministry.id} value={ministry.name}>{ministry.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isRoleEditable}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableRoles.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">{isEditing ? 'Save Changes' : 'Create User'}</Button>
            </form>
        </Form>
    )
}
