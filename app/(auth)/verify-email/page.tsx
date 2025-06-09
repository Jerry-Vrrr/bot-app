// app/verify-email/page.tsx
import { verifyEmailAction } from "@/actions/user";
import AuthHeading from "@/components/authentication/Heading";
import Link from "next/link";

interface VerifyResultSuccess {
  message: string;
}

interface VerifyResultError {
  error: string;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  let result: VerifyResultSuccess | VerifyResultError;
  const parameters = await searchParams
  try {
    result = await verifyEmailAction(parameters.token || "");
} catch (error: unknown) {
    result = { error: error instanceof Error ? error.message : "Verification failed" };
  }
  // Narrow the type: if result contains an error, show the expired token UI.
  if ("error" in result) {
    return (
      < >
        <AuthHeading content={"Token Expired!"} />
        <p className="text-2xl mx-auto text-center">
          Your Token has expired. Please try the operation again!
        </p>
        <div className="space-y-6 pb-6 text-start">
          <div>
            <div className="flex justify-between items-center flex-col gap-x-5 mt-3">
              <Link
                href="/signin"
                className="text-black flex font-bold px-6 rounded-3xl text-md bg-redOrange hover:bg-[#f9301a]"
              >
                Login
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <Link className="underline" href="/signup">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If verification was successful, show a success UI (you can customize this as needed)
  return (
    < >
      <AuthHeading content={"Verification Successful!"} />
      <p className="text-2xl  mx-auto text-center">
        Your email has been verified successfully.
      </p>
      <div className="space-y-6 pb-6 text-start">
        <div>
          <div className="flex justify-between items-center flex-col gap-x-5 mt-3">
            <Link
              href="/signin"
              className="text-black flex font-bold px-6 rounded-3xl text-md bg-redOrange hover:bg-[#f9301a]"
            >
              Login
            </Link>
          </div>
          <div className="flex justify-center items-center">
            <Link className="underline" href="/signup">
              Back to Signup
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
