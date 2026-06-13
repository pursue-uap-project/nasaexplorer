import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ACTIVE_MISSIONS,
  getMissionImagesRich,
  findMissionVideoId,
  getMarsLatest,
} from "@/lib/nasa";
import ActiveMissions from "@/components/ActiveMissions";

type Props = { params: Promise<{ locale: string }> };

export default async function ActivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("active");

  const [imageEntries, videoEntries, mars] = await Promise.all([
    Promise.all(ACTIVE_MISSIONS.map(async (m) => [m.id, await getMissionImagesRich(m.imageQuery, 12)] as const)),
    Promise.all(ACTIVE_MISSIONS.map(async (m) => [m.id, await findMissionVideoId(`${m.name} ${m.program}`, m.youtubeId)] as const)),
    getMarsLatest("perseverance"),
  ]);

  const images = Object.fromEntries(imageEntries);
  const videoIds = Object.fromEntries(videoEntries);

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-[0.02em] text-white">{t("title")}</h1>
          <p className="mt-2 text-white/55">{t("subtitle")}</p>
        </div>

        <ActiveMissions missions={ACTIVE_MISSIONS} images={images} videoIds={videoIds} mars={mars} />
      </div>
    </main>
  );
}
