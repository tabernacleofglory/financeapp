'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Landmark, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, getAdditionalUserInfo, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { saveUserData } from "@/lib/user-actions";

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
    const [password, setPassword] = useState('');
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    useEffect(() => {
        if (!isUserLoading && auth && isSignInWithEmailLink(auth, window.location.href)) {
            let emailFromStorage = window.localStorage.getItem('emailForSignIn');
            if (!emailFromStorage) {
                emailFromStorage = window.prompt('Please provide your email for confirmation');
            }
            if (emailFromStorage && firestore) {
                signInWithEmailLink(auth, emailFromStorage, window.location.href)
                    .then(async (result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        const additionalUserInfo = getAdditionalUserInfo(result);
                        if (additionalUserInfo?.isNewUser) {
                           await saveUserData(firestore, result.user);
                        }
                        toast({
                            title: "Signed In",
                            description: "You have successfully signed in.",
                        });
                        router.push('/dashboard');
                    })
                    .catch((error) => {
                         console.error("Email link sign-in error", error);
                        toast({
                            variant: "destructive",
                            title: "Sign-in failed",
                            description: "The sign-in link is invalid or has expired.",
                        });
                    });
            }
        }
    }, [auth, firestore, toast, router, isUserLoading]);


    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    const handleGoogleSignIn = async () => {
        if (!auth || !firestore) {
             toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "Firebase service is not available. Please try again later.",
            });
            return;
        };
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const additionalUserInfo = getAdditionalUserInfo(result);
            if (additionalUserInfo?.isNewUser) {
                await saveUserData(firestore, result.user);
            }
            toast({
                title: "Signed in with Google",
                description: "You have successfully signed in.",
            });
            router.push('/dashboard');
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                console.error("Google sign-in error", error);
                toast({
                    variant: "destructive",
                    title: "Google sign-in failed",
                    description: error.message || "Could not sign in with Google. Please try again.",
                });
            } else {
                 console.log('Google sign-in popup closed by user.');
            }
        }
    }

    const handleEmailLinkSignIn = () => {
        if (!auth) return;
        if (!email) {
            toast({
                variant: "destructive",
                title: "Email required",
                description: "Please enter your email address to sign in with a link.",
            });
            return;
        }
        const actionCodeSettings = {
            url: `${window.location.origin}/dashboard`,
            handleCodeInApp: true,
        };
        sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email);
                toast({
                    title: "Check your email",
                    description: `A sign-in link has been sent to ${email}.`,
                });
                setShowEmailLogin(false);
            })
            .catch((error) => {
                console.error("Email link error", error);
                toast({
                    variant: "destructive",
                    title: "Could not send sign-in link",
                    description: "Please try again.",
                });
            });
    }

    const handlePasswordSignIn = async () => {
        if (!auth) return;
        if (!email || !password) {
            toast({
                variant: "destructive",
                title: "Email and password required",
                description: "Please enter your email and password.",
            });
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
             toast({
                title: "Signed In",
                description: "You have successfully signed in.",
            });
            router.push('/dashboard');
        } catch (error) {
            console.error("Password sign-in error", error);
            toast({
                variant: "destructive",
                title: "Sign-in failed",
                description: "Incorrect email or password.",
            });
        }
    }
    
    const handlePasswordReset = () => {
        if (!auth) return;
        if (!email) {
            toast({
                variant: "destructive",
                title: "Email required",
                description: "Please enter your email address to reset your password.",
            });
            return;
        }
        const actionCodeSettings = {
            url: `${window.location.origin}/login`,
            handleCodeInApp: true,
        };
        sendPasswordResetEmail(auth, email, actionCodeSettings)
            .then(() => {
                toast({
                    title: "Password reset email sent",
                    description: `A password reset link has been sent to ${email}.`,
                });
            })
            .catch((error) => {
                console.error("Password reset error", error);
                toast({
                    variant: "destructive",
                    title: "Could not send reset email",
                    description: "Please try again.",
                });
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
                    <CardDescription>Sign in to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button className="w-full" onClick={handleGoogleSignIn} disabled={isUserLoading}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Sign in with Google
                    </Button>
                    
                    {!showEmailLogin ? (
                        <Button variant="link" onClick={() => setShowEmailLogin(true)} disabled={isUserLoading}>
                            Sign in with Email instead
                        </Button>
                    ) : (
                         <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        Or
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
                                    disabled={isUserLoading}
                                />
                            </div>
                             <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Button variant="link" size="sm" className="px-0" onClick={handlePasswordReset} disabled={isUserLoading}>
                                        Forgot Password?
                                    </Button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isUserLoading}
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Button className="w-full" onClick={handlePasswordSignIn} disabled={isUserLoading}>
                                    Login
                                </Button>
                                <Button variant="secondary" className="w-full" onClick={handleEmailLinkSignIn} disabled={isUserLoading}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Sign in with Email Link
                                </Button>
                            </div>
                             <Button variant="link" size="sm" onClick={() => setShowEmailLogin(false)} disabled={isUserLoading}>
                                Back to main login
                            </Button>
                        </>
                    )}
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
