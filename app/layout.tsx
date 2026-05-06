import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { SessionCleanup } from "@/components/SessionCleanup";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SafariWrap | Your Safari, Wrapped",
  description: "Create personalized safari memory wraps for your guests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col font-sans bg-parchment text-ink">
        <SessionCleanup />
        <QueryProvider>
          <AuthProvider>
            <React.Suspense fallback={
              <div className="min-h-screen bg-parchment flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-stone">Loading SafariWrap...</p>
                </div>
              </div>
            }>
              {children}
            </React.Suspense>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
