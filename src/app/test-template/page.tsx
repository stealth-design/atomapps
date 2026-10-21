import type { Metadata } from "next";
import { AppTemplate } from "./AppTemplate";
import { getApp } from "@/data/apps";

export const metadata: Metadata = {
  title: "Test Template",
  robots: { index: false },
};

/**
 * /test-template — the master app template, shown with Find My Phone. Not
 * linked from anywhere and not indexed: the live app pages are still
 * /apps/[slug]. Any other app previews at /test-template/<slug>.
 */
export default function TestTemplatePage() {
  return <AppTemplate app={getApp("find-my-phone")!} />;
}
