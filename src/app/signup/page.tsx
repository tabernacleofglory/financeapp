'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M15.09 10.32a4.34 4.34 0 0 0-3.09-3.09" />
        <path d="M12 14.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
        <path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z" />
        <path d="M8.91 10.32a4.34 4.34 0 0 1 3.09-3.09" />
      </svg>
    )
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const { toast } = useToast();

    const handleEmailLinkSignIn = () => {
        if (!email) {
            toast({
                variant: "destructive",
                title: "Email required",
                description: "Please enter your email address to sign in with a link.",
            });
            return;
        }
        // This is a simulated action.
        console.log(`Sending sign-in link to ${email}`);
        toast({
            title: "Check your email",
            description: `A sign-in link has been sent to ${email}.`,
        });
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Landmark className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
                    <CardDescription>Log in to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button variant="outline" className="w-full">
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Login with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="m@example.com" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <Button className="w-full" onClick={handleEmailLinkSignIn}>
                        <Mail className="mr-2 h-4 w-4" />
                        Sign in with Email Link
                    </Button>
                    
                    <div className="grid gap-2 mt-4">
                         <Label htmlFor="password">Password</Label>
                         <Input id="password" type="password" required />
                     </div>
                     <Button asChild className="w-full">
                         <Link href="/dashboard">Login</Link>
                     </Button>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">
                        This is a private application. Access is by invitation only.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
