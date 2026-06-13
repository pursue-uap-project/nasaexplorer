import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import uapStoriesData from "@/data/uap-stories.json";
import SightingClient from "./SightingClient";

interface UapStory {
  id: string;
  meta: string;
  year: string;
  agency: string;
  region: string;
  tags: string[];
  title_es: string;
  title_en: string;
  body_es: string;
  body_en: string;
  image: string;
  images?: string[];
  video?: string;
  url: string;
}

type Props = { params: Promise<{ locale: string; id: string }> };

// Generate static params for all UAP sighting IDs to support output: export
export async function generateStaticParams() {
  return uapStoriesData.map((s) => ({
    id: s.id,
  }));
}

export default async function UapSightingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Cast JSON data safely
  const stories = uapStoriesData as UapStory[];
  const story = stories.find((s) => s.id === id);

  if (!story) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <SightingClient story={story} locale={locale} />
    </main>
  );
}
