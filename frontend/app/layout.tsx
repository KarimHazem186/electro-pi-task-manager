import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Task Manager",
  description:
    "Full-stack task management system with real-time collaboration and team workflows.",
  icons: { 
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ]
  },
};

/**
 * Root layout: This must return the html/body tags.
 * The locale-specific attributes are handled by the [locale] layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
