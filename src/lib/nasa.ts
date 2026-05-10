export type MissionStatus = "active" | "completed" | "planned";

export type Mission = {
  id: string;
  name: string;
  program: string;
  launch_details: { date: string; status: MissionStatus };
  description: { es: string; en: string };
  multimedia?: { images?: string[] };
  stats?: { label: string; value: string }[];
};

export type ActiveMission = {
  id: string;
  name: string;
  tagline: { en: string; es: string };
  program: string;
  color: string;
  description: { en: string; es: string };
  imageQuery: string;
  hasTrajectory: boolean;
  youtubeId: string;
  stats: { label: string; value: string }[];
};

const IMAGES_API = "https://images-api.nasa.gov";

const PROGRAMS: { name: string; q: string }[] = [
  { name: "Mercury", q: "Project Mercury astronaut capsule" },
  { name: "Gemini", q: "Project Gemini spacecraft EVA" },
  { name: "Apollo", q: "Apollo lunar moon landing astronauts" },
  { name: "Skylab", q: "Skylab space station crew" },
  { name: "Space Shuttle", q: "Space Shuttle launch Columbia Discovery" },
  { name: "ISS", q: "International Space Station ISS crew" },
  { name: "Artemis", q: "Artemis SLS Orion moon mission" },
  { name: "Mars", q: "Mars Rover Perseverance Curiosity surface" },
  { name: "Hubble", q: "Hubble Space Telescope galaxy nebula" },
  { name: "JWST", q: "James Webb Space Telescope deep field infrared" },
];

export const PROGRAM_COLORS: Record<string, string> = {
  Mercury: "#64748b",
  Gemini: "#7c3aed",
  Apollo: "#b45309",
  Skylab: "#0f766e",
  "Space Shuttle": "#1d4ed8",
  ISS: "#0891b2",
  Artemis: "#dc2626",
  Mars: "#ea580c",
  Hubble: "#6d28d9",
  JWST: "#0B3D91",
};

export const ACTIVE_MISSIONS: ActiveMission[] = [
  {
    id: "artemis",
    name: "Artemis",
    tagline: { en: "Return to the Moon", es: "Regreso a la Luna" },
    program: "Artemis",
    color: "#dc2626",
    description: {
      en: "NASA's Artemis program is returning humans to the Moon for the first time since Apollo. Artemis III will land the first woman and first person of color near the lunar south pole, then establish a sustainable presence to prepare humanity for Mars.",
      es: "El programa Artemis de la NASA devuelve humanos a la Luna por primera vez desde el Apolo. Artemis III aterrizará a la primera mujer y primera persona de color cerca del polo sur lunar, estableciendo una presencia sostenible como paso previo hacia Marte.",
    },
    imageQuery: "Artemis SLS Orion moon NASA",
    hasTrajectory: true,
    youtubeId: "H5sLin9Hg_I",
    stats: [
      { label: "Target", value: "Lunar South Pole" },
      { label: "Vehicle", value: "SLS + Orion" },
      { label: "Artemis I", value: "Nov 2022 ✓" },
      { label: "Artemis II", value: "2025 · crewed flyby" },
      { label: "Artemis III", value: "2026 · landing" },
    ],
  },
  {
    id: "jwst",
    name: "James Webb",
    tagline: { en: "Seeing the Universe's First Light", es: "Viendo la primera luz del universo" },
    program: "JWST",
    color: "#7c3aed",
    description: {
      en: "Operating at the L2 Lagrange point 1.5 million km from Earth, the James Webb Space Telescope observes in infrared to reveal galaxies from 13.5 billion years ago, exoplanet atmospheres, and the chemistry of stellar nurseries.",
      es: "Desde el punto de Lagrange L2, a 1.5 millones de km de la Tierra, el JWST observa en infrarrojo revelando galaxias de hace 13.500 millones de años, atmósferas de exoplanetas y viveros estelares.",
    },
    imageQuery: "James Webb Space Telescope deep field galaxy infrared",
    hasTrajectory: false,
    youtubeId: "1dAtGSzLwK8",
    stats: [
      { label: "Location", value: "L2 · 1.5M km" },
      { label: "Mirror", value: "6.5 m · 18 segments" },
      { label: "Launched", value: "Dec 25, 2021" },
      { label: "First images", value: "Jul 12, 2022" },
    ],
  },
  {
    id: "perseverance",
    name: "Perseverance",
    tagline: { en: "Searching for Ancient Life on Mars", es: "Buscando vida antigua en Marte" },
    program: "Mars",
    color: "#ea580c",
    description: {
      en: "NASA's Perseverance rover explores Mars's Jezero Crater — an ancient lake bed. It has collected 23+ rock samples sealed for future return to Earth, deployed the Ingenuity helicopter, and is testing oxygen production from the Martian atmosphere.",
      es: "El rover Perseverance explora el Cráter Jezero de Marte — un antiguo lecho lacustre. Ha recogido más de 23 muestras selladas para su retorno a la Tierra y desplegó el helicóptero Ingenuity.",
    },
    imageQuery: "Perseverance rover Mars surface Jezero",
    hasTrajectory: false,
    youtubeId: "gm0b_ijaYMQ",
    stats: [
      { label: "Location", value: "Jezero Crater, Mars" },
      { label: "Landed", value: "Feb 18, 2021" },
      { label: "Samples", value: "23+ collected" },
      { label: "Ingenuity flights", value: "72+ flights" },
    ],
  },
  {
    id: "iss",
    name: "ISS Expedition",
    tagline: { en: "25 Years of Continuous Human Presence", es: "25 años de presencia humana continua" },
    program: "ISS",
    color: "#0891b2",
    description: {
      en: "The ISS has hosted humans without interruption since November 2, 2000. Scientists aboard conduct experiments impossible on Earth — in microgravity biology, materials science, and Earth observation — while testing systems for future deep-space missions.",
      es: "La ISS aloja humanos sin interrupción desde el 2 de noviembre de 2000. Los científicos a bordo realizan experimentos imposibles en la Tierra: biología en microgravedad, ciencia de materiales y observación terrestre.",
    },
    imageQuery: "International Space Station ISS orbit Earth crew",
    hasTrajectory: false,
    youtubeId: "jJ7Md2QGRh4",
    stats: [
      { label: "Altitude", value: "~408 km" },
      { label: "Speed", value: "7.66 km/s" },
      { label: "Crew", value: "7 members" },
      { label: "Orbits/day", value: "~15.5" },
    ],
  },
];

function inferStatus(dateStr: string): MissionStatus {
  if (!dateStr) return "planned";
  const year = new Date(dateStr).getFullYear();
  return year >= 2022 ? "active" : "completed";
}

export async function getMissions(): Promise<Mission[]> {
  const settled = await Promise.allSettled(
    PROGRAMS.map(({ name, q }) =>
      fetch(
        `${IMAGES_API}/search?q=${encodeURIComponent(q)}&media_type=image&page_size=6`,
        { next: { revalidate: 86400 } }
      )
        .then((r) => r.json())
        .then((data) => ({ program: name, items: (data.collection?.items ?? []) as any[] }))
    )
  );

  return settled
    .filter((r): r is PromiseFulfilledResult<{ program: string; items: any[] }> => r.status === "fulfilled")
    .flatMap(({ value: { program, items } }) =>
      items.slice(0, 6).map(
        (item: any): Mission => ({
          id: item.data[0].nasa_id,
          name: item.data[0].title,
          program,
          launch_details: {
            date: item.data[0].date_created?.slice(0, 10) ?? "",
            status: inferStatus(item.data[0].date_created ?? ""),
          },
          description: {
            en: (item.data[0].description ?? "").slice(0, 300),
            es: (item.data[0].description ?? "").slice(0, 300),
          },
          multimedia: {
            images: item.links?.map((l: any) => l.href).filter(Boolean) ?? [],
          },
          stats: [],
        })
      )
    );
}

export async function getMissionImages(query: string, count = 6): Promise<string[]> {
  try {
    const res = await fetch(
      `${IMAGES_API}/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${count}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.collection?.items ?? [])
      .flatMap((item: any) => item.links?.map((l: any) => l.href).filter(Boolean) ?? [])
      .slice(0, count);
  } catch {
    return [];
  }
}

export async function getApod(apiKey: string) {
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
    { next: { revalidate: 43200 } }
  );
  if (!res.ok) throw new Error("APOD API error");
  return res.json();
}
