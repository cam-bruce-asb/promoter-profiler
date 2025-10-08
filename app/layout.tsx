import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promoter Profiler",
  description: "Assessment tool for in-store promoter candidates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
