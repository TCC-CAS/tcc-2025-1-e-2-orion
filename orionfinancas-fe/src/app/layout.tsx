import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Footer } from "@/components/layout/footer/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Órion Finanças",
  description: "Sua jornada rumo à liberdade financeira começa aqui.",
};


import { Toaster } from 'react-hot-toast';
import { VLibrasWidget } from "@/components/common/VLibrasWidget";
import { UserProvider } from "@/contexts/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" toastOptions={{ className: 'custom-toast' }} />
        <VLibrasWidget />
        <UserProvider>
          <div className="app-root">
            <main>{children}</main>
            <Footer />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}


