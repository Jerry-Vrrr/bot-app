// src/app/layout.tsx
import type { Metadata } from "next";
// import localFont from "next/font/local";
import "../globals.css";

export const metadata: Metadata = {
  title: "AION",
  description: "AION",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
    >
      <div className="text-center min-h-screen bg-mintGreen flex justify-center items-center">
        <div className=" px-6 pt-14 pb-6 bg-white min-h-[300px] min-w-[350px] max-w-[450px] rounded-3xl flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  );
}