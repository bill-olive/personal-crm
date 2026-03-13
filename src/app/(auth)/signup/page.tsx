"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getClientAuth, getClientDb } from "@/lib/firebase/client";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Heart, Chrome } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("1stUp Health");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const createUserProfile = async (
    uid: string,
    email: string,
    displayName: string,
    orgName: string
  ) => {
    // Create organization
    const fireDb = getClientDb();
    const orgRef = doc(fireDb, "organizations", uid + "_org");
    await setDoc(orgRef, {
      name: orgName,
      domain: email.split("@")[1] || "",
      plan: "pro",
      settings: {
        defaultCurrency: "USD",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fiscalYearStart: 1,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create user profile
    const userRef = doc(fireDb, "users", uid);
    await setDoc(userRef, {
      email,
      displayName,
      orgId: orgRef.id,
      role: "admin",
      preferences: {
        theme: "system",
        notifications: true,
        emailDigest: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fireAuth = getClientAuth();
      const credential = await createUserWithEmailAndPassword(fireAuth, email, password);
      await updateProfile(credential.user, { displayName: fullName });
      await createUserProfile(credential.user.uid, email, fullName, orgName);
      toast.success("Account created! Welcome to 1stUp Health CRM.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const fireAuth = getClientAuth();
      const credential = await signInWithPopup(fireAuth, provider);
      const user = credential.user;
      await createUserProfile(
        user.uid,
        user.email || "",
        user.displayName || "User",
        orgName
      );
      toast.success("Account created! Welcome to 1stUp Health CRM.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            1stUp Health CRM
          </span>
        </div>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Start managing your healthcare sales pipeline with AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization</Label>
            <Input
              id="orgName"
              placeholder="1stUp Health"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@1up.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
