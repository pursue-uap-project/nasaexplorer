import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import HomeHero from "@/components/HomeHero";
import HomeLaunchBoard from "@/components/HomeLaunchBoard";
import HomeMissionGrid from "@/components/HomeMissionGrid";
import HomeExoplanets from "@/components/HomeExoplanets";
import HomeApodCard from "@/components/HomeApodCard";
import HomeIndex from "@/components/HomeIndex";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return buildMetadata({ locale, title: t("meta_title"), description: t("meta_description") });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="w-full">
      <HomeHero />
      <HomeLaunchBoard />
      <HomeMissionGrid />
      <HomeExoplanets />
      <HomeApodCard />
      <HomeIndex />
    </main>
  );
}
