import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { GlobalParallax } from "@/components/layout/GlobalParallax";
import { CommentMode } from "@/components/review/CommentMode";
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

        {/* Pre-launch review comments — TEMPORARY, see lib/review/store.
            On by default so the client needs nothing set up, and invisible
            until asked for by `Alt`+`C` or `?comments`. Set
            NEXT_PUBLIC_REVIEW_COMMENTS=0 to switch it off without a deploy of
            its own; at launch, delete this and the three `review` folders. */}
        {process.env.NEXT_PUBLIC_REVIEW_COMMENTS !== "0" && <CommentMode />}
      </body>
    </html>
  );
}
