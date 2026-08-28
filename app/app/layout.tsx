import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import ActivityTracker from "@/app/components/ActivityTracker";

export const metadata: Metadata = {
  title: "ZYKA Access Control - Earth Tone RBAC System",
  description: "Next.js + MongoDB Login & Permission Control System with Earth Tone Green theme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen flex flex-col selection:bg-[#588b67] selection:text-[#f3efe6]">
        <ActivityTracker />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
