// app/(auth)/reset-password/ResetPassword.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/user";
import { Suspense } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Link from "next/link";
import AuthHeading from "./Heading";
import SubmitBtn from "./SubmitBtn";
import CustomAlert from "../common/CustomAlert";
import jwt, { JwtPayload } from "jsonwebtoken"; 
import useAutoResetError from "@/hooks/useAutoResetError";

function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState<boolean>(false)
  const [password, setPassword] = useState<string>("");
  const { error, setError } = useAutoResetError(3000);

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter()


  useEffect(() => {
    if (!token) {
      setError("Invalid token");
      return;
    }

    try {
      const decoded = jwt.decode(token) as JwtPayload; // Decode the token (don't verify yet)
      if (!decoded || !decoded.exp) {
        throw new Error("Invalid token");
      }

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        router.push("/token-expired?error=reset-password"); // Redirect to error page
      }
    } catch (err) {
      console.log(err)
      router.push("/token-expired?error=reset-password"); // Redirect if any error occurs
    }
  }, [token, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError("Invalid request");
    if (confirmPassword !== password) {
      setError("Passwords don't match")
      return
    }
    setLoading(true)

    try {
      const response = await resetPassword({ token, newPassword: password });
      if (response) {
        router.push('/password-reset-success')
      }
      setLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage)
    }
    setLoading(false)
  };

  return (
    <>
      <AuthHeading content={"Reset Password"} />

      <form onSubmit={handleSubmit} className="space-y-3 pb-6 text-start">
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
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border-2 border-black rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="email" className="block text-sm font-medium">
            Confirm Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full border-2 border-black rounded-xl"
          />
        </div>
        <SubmitBtn text={"Reset"} loading={loading} />
        <Link className="text-blue-600 font-semibold w-full text-center inline-block" href="/signin">Cancel</Link>

      </form>
    </>
  );
}


export default function ResetPasswordMain() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
