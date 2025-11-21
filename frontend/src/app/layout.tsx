import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Navigation } from "@/components/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WorthWise - College ROI Planner",
  description: "Compare college options with total cost, debt, earnings, ROI, and financial metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <div className="min-h-screen bg-zinc-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8 overflow-visible">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
