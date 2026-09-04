import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { GlobalParallax } from "@/components/layout/GlobalParallax";
import { siteConfig } from "@/data/site";
import "./globals.css";

/** DM Sans is the only page-level typeface in the design (weights 400–800). */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SmoothScroll>
          <GlobalParallax />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
