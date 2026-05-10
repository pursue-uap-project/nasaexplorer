import { useTranslations } from "next-intl";

// NASA main 24/7 live stream ID (update if the stream changes)
const NASA_STREAM_ID = "FuuC4dpSQ1M";
// NASA en Español 24/7 live stream — update to current live video ID from @NASAenEspanol
const NASA_ES_STREAM_ID = "21X5lGlDOfg";

export default function LiveStreams() {
  const t = useTranslations("live");

  const streams = [
    { id: NASA_STREAM_ID, label: t("nasa_channel"), flag: "🇺🇸" },
    { id: NASA_ES_STREAM_ID, label: t("nasa_es_channel"), flag: "🇪🇸" },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-primary mb-2">{t("live_title")}</h2>
      <p className="text-foreground/50 text-sm mb-6">
        NASA TV · 24/7
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {streams.map(({ id, label, flag }) => (
          <div key={id} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <iframe
              src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
              title={label}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="px-4 py-3 bg-white flex items-center gap-2">
              <span className="text-lg">{flag}</span>
              <span className="font-semibold text-sm text-foreground">{label}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-foreground/50 font-mono">LIVE</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
