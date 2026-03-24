import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Distributed Monitor — Real-Time Uptime Monitoring",
  description:
    "A production-grade, microservices-based uptime monitoring system. Track URL status, latency, SSL certificates, and receive email alerts — all in real time.",
  keywords: [
    "uptime monitor",
    "distributed systems",
    "microservices",
    "URL monitoring",
    "status checker",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#0a0f1e" />
      </head>
      <body className="min-h-screen antialiased bg-[#0a0f1e] text-[#f1f5f9]">
        {children}
      </body>
    </html>
  );
}
