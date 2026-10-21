import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppTemplate } from "../AppTemplate";
import { APPS, getApp } from "@/data/apps";

/**
 * /test-template/<slug> — a preview of the master app template for any app,
 * so the template can be checked against all of them before it replaces
 * /apps/[slug]. Not linked and not indexed.
 */

export function generateStaticParams() {
  return APPS.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const app = getApp((await params).slug);
  return { title: app ? `${app.title} | Template preview` : "Template preview", robots: { index: false } };
}

export default async function TemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  return <AppTemplate app={app} />;
}
