import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppTemplate } from "../AppTemplate";
import { ComingSoonTemplate } from "../ComingSoonTemplate";
import { APPS, COMING_SOON, getApp, getComingSoon } from "@/data/apps";

/**
 * /test-template/<slug> — a preview of the master app template for any app,
 * so the template can be checked against all of them before it replaces
 * /apps/[slug]. The unreleased apps preview its coming-soon version
 * (ComingSoonTemplate). Not linked and not indexed.
 */

export function generateStaticParams() {
  return [...APPS, ...COMING_SOON].map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug) ?? getComingSoon(slug);
  return { title: app ? `${app.title} | Template preview` : "Template preview", robots: { index: false } };
}

export default async function TemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = getApp(slug);
  if (app) return <AppTemplate app={app} />;

  const soon = getComingSoon(slug);
  if (!soon) notFound();
  return <ComingSoonTemplate app={soon} />;
}
