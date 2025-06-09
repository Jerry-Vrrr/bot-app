'use client'

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-mintGreen text-white text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-2xl mt-4">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
            <button
        onClick={() => router.back()}
        className="mt-6 px-6 py-3 bg-white text-mintGreen rounded-lg font-semibold shadow-md hover:bg-gray-200 transition"
      >
        Go Back
      </button>
    </div>
  );
}
