import type { Metadata } from "next";
import { Poppins, EB_Garamond } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-eb-garamond"
});

export const metadata: Metadata = {
  title: "HireLens — AI Interview Intelligence",
  description: "Identify top talent faster with AI-augmented interviews, resume parsing, and actionable signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen font-sans antialiased", poppins.variable, ebGaramond.variable)}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
