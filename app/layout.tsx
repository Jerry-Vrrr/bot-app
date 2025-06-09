import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AION",
  description: "AION",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-mintGreen`}
      >
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <div className="w-full ">
              <Header />
              <div className="flex items-center justify-center mx-auto xl:mx-auto mt-5 md:mx-7 py-3 px-3 md:px-1 max-w-[1240px] min-h-screen">
                {children}
              </div>
              <Footer />
            </div>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
