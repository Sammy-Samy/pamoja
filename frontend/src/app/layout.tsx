import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pamoja — Group Payments on Stellar",
  description:
    "Automate group payment distribution using Stellar Soroban smart contracts. Built for Africa.",
  keywords: ["Stellar", "Soroban", "payments", "Africa", "DeFi", "smart contracts"],
  openGraph: {
    title: "Pamoja",
    description: "Revolutionizing group payments on Stellar 🌍",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
