/** Root layout — wraps all pages with HTML structure, fonts, and global styles. */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PeduliStunting.id",
    template: "%s | PeduliStunting.id",
  },
  description:
    "Platform edukasi stunting dan simulasi kebijakan berbasis model GTWENOLR untuk Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
