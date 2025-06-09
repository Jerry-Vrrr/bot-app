"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
// import { Signin } from "@/actions/user";
import { forgotPasswordEmailHandler } from "@/actions/user";
import AuthHeading from "./Heading";
import SubmitBtn from "./SubmitBtn";
import CustomAlert from "../common/CustomAlert";
import { validateEmail } from "@/utils/helper";
import useAutoResetError from "@/hooks/useAutoResetError";

export default function ForgetPassword() {
    const [loading, setLoading] = useState<boolean>(false)
    const { error, setError } = useAutoResetError(3000);
    const [email, setEmail] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null);
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true)

        try {
            await forgotPasswordEmailHandler({ email })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setError(errorMessage)
      
        }
        setLoading(false)
    };


    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 pb-6 text-start">
            <AuthHeading content={"Forget Password"} />
                <div>
                    <Label htmlFor="email" className="block text-sm font-medium">
                        Enter Your Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="hello@reallygreatsite.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full border-2 border-black rounded-xl"
                    />
                    {error && (
                        <CustomAlert
                            type="error"
                            title="Error"
                            message={error}
                            className="mt-1"
                        />
                    )}

                </div>

                <SubmitBtn text={"Send Reset Link"} loading={loading} />

                <div className="flex justify-center items-center">
                    <Link className="underline" href="/signup">Back to Login</Link>
                </div>
            </form>
        </>
    );
}
