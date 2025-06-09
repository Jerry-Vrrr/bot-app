// app/auth/error/page.jsx
"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error") || "An unknown error occurred.";
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
    <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
      <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
      <p className="text-gray-600 mb-4">{errorMessage}</p>
      <Link href="/signin" className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">Go Back</Link>
    </div>
  </div>

  );
}

export default function Error() {
  return (
    <Suspense fallback={<div>Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
