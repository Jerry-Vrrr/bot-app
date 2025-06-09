// components/SigninComp.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import AuthHeading from "./Heading";
import SubmitBtn from "./SubmitBtn";
import CustomAlert from "../common/CustomAlert";
import { useRouter } from 'next/navigation';
import VerificationPopup from "./VerificationPopup";
import useAutoResetError from "@/hooks/useAutoResetError";

export default function SigninComp() {
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { error, setError } = useAutoResetError(3000);
    const { data: session, status } = useSession()
    const [loginSucces, setLoginSuccess] = useState(false)
    // Control when to show the verification popup
    const [showVerification, setShowVerification] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        router.refresh()
        try {
            const response = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl: "/chatbots/",
            });
            if (response?.error) {
                // Check for a specific error message from your backend
                if (response.error === "Email not verified") {
                    setShowVerification(true);
                } else {
                    setError(response.error);
                }
            } else if (response?.ok) {
                
                setLoginSuccess(true)
                // Assume the response contains a flag indicating verification.
                // console.log(session)
                // const userIsVerified = session?.user.verificationStatus;
                // console.log(userIsVerified, ' :userIsVerified')
                // if (!userIsVerified) {
                //   setShowVerification(true);
                // } else {
                //   router.push("/chatbots/");
                // }
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "An unexpected error occurred";
            setError(errorMessage);
        }
        setLoading(false);
    };

    useEffect(() => {

        if(loginSucces) {
            const userIsVerified = session?.user.verificationStatus;
            if (!userIsVerified) {
                setShowVerification(true);
            } else {
                
                router.replace("/chatbots/");
            }
            setLoginSuccess(false)
        }
        
    }, [session?.user, status, loginSucces])

    return (
        <>
            <AuthHeading content={"Login"} />
            <div className="pb-6 text-start">
                <form onSubmit={handleSubmit} className="">
                    {error && (
                        <CustomAlert
                            type="error"
                            title="Error"
                            message={error}
                            className="mt-1"
                        />
                    )}
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="email" className="block text-sm font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full border-2 border-black rounded-xl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="block text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full border-2 border-black rounded-xl"
                            />
                        </div>
                        <SubmitBtn text={"Login"} loading={loading} />
                    </div>
                </form>
                <div className="flex justify-between items-center flex-col gap-x-5 mt-3">
                    <Link className="underline" href="/forget-password">
                        Forget Password
                    </Link>
                    <span>
                        Don&apos;t have an account?{" "}
                        <Link className="underline" href="/signup">
                            Sign up
                        </Link>
                    </span>
                </div>
            </div>

            {/* Render the verification popup if the user is not verified */}
            {showVerification  && session?.user && (
                <VerificationPopup
                user={session.user}
                    onClose={() => setShowVerification(false)}
                />
            )}
        </>
    );
}
