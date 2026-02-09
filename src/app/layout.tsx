import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Persona Studio - Create & Chat with Custom AI Personas",
  description: "A powerful PWA for creating customizable AI personas and generating artifacts. Chat with personalized AI assistants powered by free OpenRouter models.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Studio",
  },
  keywords: ["AI", "chatbot", "persona", "artifacts", "PWA", "OpenRouter", "free AI"],
  authors: [{ name: "AI Persona Studio" }],
  openGraph: {
    title: "AI Persona Studio",
    description: "Create & Chat with Custom AI Personas",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
