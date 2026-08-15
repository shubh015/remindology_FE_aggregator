import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "block",   // prevent FOUT — block until loaded, no font swap flash
  preload: true,
});

const SITE_URL = "https://www.remindology.com";
const SITE_DESCRIPTION =
  "Accelerate your UPSC preparation with AI-powered summaries, topics, revision notes, and MCQs generated from your study materials.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Remindology | AI-Powered UPSC Learning Platform",
    template: "%s | Remindology",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "Remindology",
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "Remindology | AI-Powered UPSC Learning Platform",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Remindology | AI-Powered UPSC Learning Platform",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "o_j0sOHAG8hIlErQTAl5NteuO5VlFYIEJEYSIoK6jLs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* app-shell: single fade-in on first paint, masks all hydration flash */}
        <div className="app-shell min-h-full flex flex-col">
          <Providers>{children}</Providers>
        </div>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
