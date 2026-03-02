import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "@/components/providers";
import { CommandPalette } from "@/components/command-palette";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jessica Career OS",
  description: "Local-first job application intelligence dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
