"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupHandler } from "@/actions/user";
import AuthHeading from "./Heading";
import SubmitBtn from "./SubmitBtn";
import CustomAlert from "../common/CustomAlert";
import useAutoResetError from "@/hooks/useAutoResetError";

export default function SignupComp() {
    const [loading, setLoading] = useState<boolean>(false)
    const [username, setUsername] = useState<string>("");
    const [companyName, setCompanyName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { error, setError } = useAutoResetError(3000);

    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await signupHandler({ email, username, password, companyName })
            console.log("Signup submitted:", response);
            router.push('/signin')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setError(errorMessage)
            console.log(errorMessage, ' :errorMessage')

        }
        setLoading(false)
    };

    return (
        <>
            <AuthHeading content={"Sign Up"} />
            <div className="pb-6 text-start">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                        <CustomAlert
                            type="error"
                            title="Error"
                            message={error}
                            className="mt-1"
                        />
                    )}
                    
                    <div>
                        <Label htmlFor="email" className="block text-sm font-medium">
                            Company Name
                        </Label>
                        <Input
                            id="companyName"
                            type="text"
                            placeholder="e.g AION"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="mt-1 block w-full border-2 border-black rounded-xl"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="block text-sm font-medium">
                            Username
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="John Doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full border-2 border-black rounded-xl"
                        />
                    </div>
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
                    <SubmitBtn text={"Signup"} loading={loading} />
                </form>

                <span className="mt-1 flex justify-center gap-x-1">Already have an account? <Link className="underline" href={'/signin'}> Login</Link> </span>

            </div>
        </>
    );
}
