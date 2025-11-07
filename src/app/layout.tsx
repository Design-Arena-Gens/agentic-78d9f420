'use client';

import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}
