import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/components/SettingsProvider";
import NetworkStatus from "@/components/NetworkStatus";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chico Water Limited | Inspire Natural Mineral Water, Delivered",
  description:
    "Ghana's premium water supplier — bottled water, sachet water, and packaging delivered to your door.",
  keywords:
    "water delivery Ghana, bottled water Accra, sachet water wholesale, Chico Water, mineral water Ghana",
  openGraph: {
    title: "Chico Water Limited",
    description: "Inspire natural mineral water, delivered across Ghana.",
    type: "website",
  },
  icons: {
    icon: "https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png",
    shortcut: "https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png",
    apple: "https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${playfair.variable} ${cormorant.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <SettingsProvider>
          <NetworkStatus />
          {children}
        </SettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid rgba(15, 23, 42, 0.06)",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
            },
            success: { iconTheme: { primary: "#0077B6", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
