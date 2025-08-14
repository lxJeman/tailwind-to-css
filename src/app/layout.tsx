import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tailwind to CSS Converter",
    template: "%s | Tailwind to CSS Converter",
  },
  description:
    "Convert Tailwind CSS utility classes to their equivalent CSS code in real-time. Perfect for learning, debugging, and understanding what CSS is generated from your Tailwind classes.",
  keywords: [
    "Tailwind CSS",
    "CSS converter",
    "utility classes",
    "CSS generator",
    "web development",
    "frontend tools",
  ],
  authors: [{ name: "Tailwind to CSS Converter" }],
  creator: "Tailwind to CSS Converter",
  publisher: "Tailwind to CSS Converter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tailwind-to-css.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tailwind to CSS Converter",
    description:
      "Convert Tailwind CSS utility classes to their equivalent CSS code in real-time",
    url: "https://tailwind-to-css.vercel.app",
    siteName: "Tailwind to CSS Converter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tailwind to CSS Converter",
    description:
      "Convert Tailwind CSS utility classes to their equivalent CSS code in real-time",
    creator: "@tailwindcss",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
