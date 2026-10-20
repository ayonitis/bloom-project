import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom — Grow Better Habits, Watch Your Garden Bloom",
  description:
    "Complete small daily habits and transform an empty garden into a beautiful world you'll actually want to come back to.",
  metadataBase: new URL("https://bloom.app"),
  openGraph: {
    title: "Bloom — Grow Better Habits, Watch Your Garden Bloom",
    description:
      "A gamified habit tracker where every completed habit helps grow a beautiful virtual garden.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
