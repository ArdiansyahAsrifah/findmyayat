import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // ← tambah ini

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindMyAyat — Every situation has its verse",
  description:
    "Temukan ayat Quran yang relevan dengan situasi hidupmu. Powered by Quran Foundation API.",
  keywords: ["Quran", "ayat", "Islam", "doa", "tafsir", "muslim"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="layout">        {/* ← wrapper flex */}
          <Navbar />                    {/* ← sidebar */}
          <main className="layout__main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}