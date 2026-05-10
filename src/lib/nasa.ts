export type MissionStatus = "active" | "completed" | "planned";

export type Mission = {
  id: string;
  name: string;
  program: string;
  launch_details: { date: string; status: MissionStatus };
  description: { es: string; en: string };
  multimedia?: { images?: string[] };
  stats?: { label: string; value: string }[];
  youtubeId?: string;
  imageQuery?: string;
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

export const PROGRAM_COLORS: Record<string, string> = {
  Mercury:        "#64748b",
  Gemini:         "#7c3aed",
  Apollo:         "#b45309",
  Skylab:         "#0f766e",
  "Space Shuttle":"#1d4ed8",
  ISS:            "#0891b2",
  Artemis:        "#dc2626",
  Mars:           "#ea580c",
  Hubble:         "#6d28d9",
  JWST:           "#0B3D91",
  "Deep Space":   "#6366f1",
};

const MISSIONS: Mission[] = [
  // ── Mercury ─────────────────────────────────────────────────────────────
  {
    id: "freedom-7",
    name: "Freedom 7",
    program: "Mercury",
    launch_details: { date: "1961-05-05", status: "completed" },
    description: {
      en: "Alan Shepard became the first American in space aboard Freedom 7, completing a 15-minute suborbital flight to an altitude of 187 km. The mission proved the Mercury capsule's life support and attitude control systems.",
      es: "Alan Shepard se convirtió en el primer estadounidense en el espacio a bordo del Freedom 7, completando un vuelo suborbital de 15 minutos a 187 km de altitud, probando los sistemas del Mercury.",
    },
    imageQuery: "Alan Shepard Freedom 7 Mercury astronaut launch",
    stats: [
      { label: "Astronaut",  value: "Alan Shepard" },
      { label: "Duration",   value: "15 min 22 sec" },
      { label: "Altitude",   value: "187 km" },
      { label: "Vehicle",    value: "Mercury-Redstone 3" },
    ],
  },
  {
    id: "friendship-7",
    name: "Friendship 7",
    program: "Mercury",
    launch_details: { date: "1962-02-20", status: "completed" },
    description: {
      en: "John Glenn became the first American to orbit Earth, completing three orbits in 4 hours 55 minutes. The mission restored national confidence and was a turning point in the Space Race against the Soviet Union.",
      es: "John Glenn se convirtió en el primer estadounidense en orbitar la Tierra, completando tres órbitas en 4 horas 55 minutos. La misión restauró la confianza nacional en la carrera espacial.",
    },
    imageQuery: "John Glenn Friendship 7 Mercury orbit Earth",
    stats: [
      { label: "Astronaut",  value: "John Glenn" },
      { label: "Orbits",     value: "3" },
      { label: "Duration",   value: "4h 55m" },
      { label: "Vehicle",    value: "Mercury-Atlas 6" },
    ],
  },
  // ── Gemini ──────────────────────────────────────────────────────────────
  {
    id: "gemini-12",
    name: "Gemini XII",
    program: "Gemini",
    launch_details: { date: "1966-11-11", status: "completed" },
    description: {
      en: "The final Gemini mission, crewed by Jim Lovell and Buzz Aldrin, successfully demonstrated extravehicular activity techniques critical for Apollo. Aldrin performed over 5 hours of spacewalks.",
      es: "La última misión Gemini, tripulada por Jim Lovell y Buzz Aldrin, demostró las técnicas de actividad extravehicular cruciales para el Apolo. Aldrin realizó más de 5 horas de paseos espaciales.",
    },
    imageQuery: "Gemini XII Buzz Aldrin EVA spacewalk orbit",
    stats: [
      { label: "Crew",       value: "Lovell · Aldrin" },
      { label: "Duration",   value: "3d 22h 34m" },
      { label: "EVA time",   value: "5h 30m" },
      { label: "Orbits",     value: "59" },
    ],
  },
  // ── Apollo ──────────────────────────────────────────────────────────────
  {
    id: "apollo-11",
    name: "Apollo 11",
    program: "Apollo",
    launch_details: { date: "1969-07-16", status: "completed" },
    description: {
      en: "The first crewed lunar landing. Neil Armstrong and Buzz Aldrin touched down in the Sea of Tranquility on July 20, 1969, while Michael Collins orbited above. Armstrong's first steps were watched by 600 million people worldwide.",
      es: "El primer alunizaje tripulado. Neil Armstrong y Buzz Aldrin aterrizaron en el Mar de la Tranquilidad el 20 de julio de 1969. Los primeros pasos de Armstrong fueron seguidos por 600 millones de personas.",
    },
    imageQuery: "Apollo 11 Moon landing Neil Armstrong Buzz Aldrin lunar surface",
    youtubeId: "hZNB5ASBV1k",
    stats: [
      { label: "Crew",       value: "Armstrong · Collins · Aldrin" },
      { label: "Landing",    value: "Sea of Tranquility" },
      { label: "Moonwalk",   value: "2h 31m" },
      { label: "Samples",    value: "21.5 kg" },
    ],
  },
  {
    id: "apollo-13",
    name: "Apollo 13",
    program: "Apollo",
    launch_details: { date: "1970-04-11", status: "completed" },
    description: {
      en: "A planned Moon landing was aborted after an oxygen tank exploded en route. The crew — Lovell, Swigert, and Haise — used the Lunar Module as a lifeboat to return safely to Earth in one of NASA's greatest survival stories.",
      es: "El alunizaje fue abortado tras la explosión de un tanque de oxígeno. La tripulación usó el Módulo Lunar como bote salvavidas para regresar a la Tierra en una de las mayores historias de supervivencia de la NASA.",
    },
    imageQuery: "Apollo 13 oxygen tank explosion Jim Lovell lifeboat rescue",
    stats: [
      { label: "Crew",       value: "Lovell · Swigert · Haise" },
      { label: "Failure",    value: "O₂ tank 2 explosion" },
      { label: "Duration",   value: "5d 22h 54m" },
      { label: "Result",     value: "Crew returned safely" },
    ],
  },
  {
    id: "apollo-17",
    name: "Apollo 17",
    program: "Apollo",
    launch_details: { date: "1972-12-07", status: "completed" },
    description: {
      en: "The final Apollo Moon landing and the last time humans walked on the Moon. Commander Gene Cernan and geologist Harrison Schmitt — the only scientist to walk on the Moon — collected 110.5 kg of samples from Taurus-Littrow valley.",
      es: "El último alunizaje Apolo y la última vez que humanos caminaron en la Luna. Gene Cernan y Harrison Schmitt — el único científico en pisar la Luna — recogieron 110.5 kg de muestras en Taurus-Littrow.",
    },
    imageQuery: "Apollo 17 Gene Cernan Harrison Schmitt lunar rover Taurus-Littrow",
    stats: [
      { label: "Crew",         value: "Cernan · Evans · Schmitt" },
      { label: "Landing site", value: "Taurus-Littrow" },
      { label: "Surface time", value: "74h 59m" },
      { label: "Samples",      value: "110.5 kg" },
    ],
  },
  // ── Skylab ───────────────────────────────────────────────────────────────
  {
    id: "skylab",
    name: "Skylab",
    program: "Skylab",
    launch_details: { date: "1973-05-14", status: "completed" },
    description: {
      en: "America's first space station hosted three crews between 1973 and 1974. Astronauts conducted landmark solar observations, Earth resources experiments, and pioneered long-duration spaceflight techniques that shaped every station program that followed.",
      es: "La primera estación espacial estadounidense alojó tres tripulaciones entre 1973 y 1974. Los astronautas realizaron observaciones solares pioneras y experimentos de recursos terrestres que marcaron el futuro de las estaciones espaciales.",
    },
    imageQuery: "Skylab space station crew solar telescope Earth orbit",
    stats: [
      { label: "Crews",        value: "3 missions" },
      { label: "Total time",   value: "171 crew-days" },
      { label: "Altitude",     value: "~435 km" },
      { label: "Re-entry",     value: "Jul 11, 1979" },
    ],
  },
  // ── Space Shuttle ────────────────────────────────────────────────────────
  {
    id: "sts-1",
    name: "STS-1 Columbia",
    program: "Space Shuttle",
    launch_details: { date: "1981-04-12", status: "completed" },
    description: {
      en: "The first Space Shuttle mission launched Columbia exactly 20 years after Gagarin's flight. Crewed by John Young and Robert Crippen, this two-day orbital test validated the orbiter design that would fly 135 missions over 30 years.",
      es: "La primera misión del Transbordador Espacial lanzó Columbia exactamente 20 años después del vuelo de Gagarin. Tripulada por John Young y Robert Crippen, validó el diseño del orbitador durante 2 días en órbita.",
    },
    imageQuery: "Space Shuttle Columbia STS-1 launch John Young Robert Crippen",
    stats: [
      { label: "Crew",       value: "Young · Crippen" },
      { label: "Duration",   value: "2d 6h 20m" },
      { label: "Orbits",     value: "36" },
      { label: "Vehicle",    value: "OV-102 Columbia" },
    ],
  },
  // ── Hubble ───────────────────────────────────────────────────────────────
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    program: "Hubble",
    launch_details: { date: "1990-04-24", status: "active" },
    description: {
      en: "Deployed from Space Shuttle Discovery in 1990, Hubble has made over 1.5 million observations of 50,000+ astronomical targets. Its images have transformed cosmology — pinning down the age of the universe, revealing dark energy, and mapping star formation.",
      es: "Desplegado desde el Discovery en 1990, Hubble ha realizado más de 1.5 millones de observaciones. Sus imágenes transformaron la cosmología: determinaron la edad del universo, revelaron la energía oscura y mapearon la formación estelar.",
    },
    imageQuery: "Hubble Space Telescope galaxy nebula deep field stars",
    stats: [
      { label: "Altitude",       value: "~547 km" },
      { label: "Mirror",         value: "2.4 m" },
      { label: "Observations",   value: "1.5M+" },
      { label: "Science papers", value: "21,000+" },
    ],
  },
  // ── ISS ──────────────────────────────────────────────────────────────────
  {
    id: "iss",
    name: "International Space Station",
    program: "ISS",
    launch_details: { date: "1998-11-20", status: "active" },
    description: {
      en: "The ISS has been continuously inhabited since November 2, 2000 — over 25 years of unbroken human presence in space. A joint project of NASA, Roscosmos, ESA, JAXA, and CSA, it serves as a world-class microgravity research laboratory.",
      es: "La ISS ha estado habitada de forma continua desde el 2 de noviembre de 2000, más de 25 años de presencia humana ininterrumpida. Proyecto conjunto de NASA, Roscosmos, ESA, JAXA y CSA, es el laboratorio de microgravedad más avanzado del mundo.",
    },
    imageQuery: "International Space Station ISS orbit Earth crew cupola",
    youtubeId: "jJ7Md2QGRh4",
    stats: [
      { label: "Altitude",      value: "~408 km" },
      { label: "Speed",         value: "7.66 km/s" },
      { label: "Crew",          value: "7 members" },
      { label: "Inhabited since", value: "Nov 2, 2000" },
    ],
  },
  // ── Deep Space ───────────────────────────────────────────────────────────
  {
    id: "voyager-1",
    name: "Voyager 1",
    program: "Deep Space",
    launch_details: { date: "1977-09-05", status: "active" },
    description: {
      en: "The most distant human-made object ever built, Voyager 1 crossed into interstellar space in August 2012. Launched in 1977, it conducted historic flybys of Jupiter and Saturn before heading toward the constellation Ophiuchus at 17 km/s.",
      es: "El objeto creado por humanos más lejano jamás construido, Voyager 1 cruzó al espacio interestelar en agosto de 2012. Lanzado en 1977, realizó históricos sobrevuelos de Júpiter y Saturno antes de dirigirse a la constelación de Ofiuco.",
    },
    imageQuery: "Voyager 1 spacecraft interstellar space NASA probe Jupiter Saturn",
    stats: [
      { label: "Distance",           value: "~165 AU (2025)" },
      { label: "Speed",              value: "17 km/s" },
      { label: "Signal delay",       value: "~23 hours" },
      { label: "Crossed heliosphere", value: "Aug 2012" },
    ],
  },
  {
    id: "voyager-2",
    name: "Voyager 2",
    program: "Deep Space",
    launch_details: { date: "1977-08-20", status: "active" },
    description: {
      en: "The only spacecraft to have visited all four outer planets — Jupiter, Saturn, Uranus, and Neptune — Voyager 2 entered interstellar space in November 2018. It remains the only craft to have performed flybys of Uranus and Neptune.",
      es: "La única nave que ha visitado los cuatro planetas exteriores — Júpiter, Saturno, Urano y Neptuno — Voyager 2 entró al espacio interestelar en noviembre de 2018. Es la única sonda que ha sobrevolado Urano y Neptuno.",
    },
    imageQuery: "Voyager 2 spacecraft outer planets Uranus Neptune NASA probe",
    stats: [
      { label: "Distance",           value: "~137 AU (2025)" },
      { label: "Speed",              value: "15.4 km/s" },
      { label: "Signal delay",       value: "~19 hours" },
      { label: "Crossed heliosphere", value: "Nov 2018" },
    ],
  },
  {
    id: "new-horizons",
    name: "New Horizons",
    program: "Deep Space",
    launch_details: { date: "2006-01-19", status: "active" },
    description: {
      en: "New Horizons became the first spacecraft to explore Pluto up close, revealing its iconic heart-shaped nitrogen ice plain (Tombaugh Regio) during the historic flyby on July 14, 2015. It is now exploring the Kuiper Belt beyond Pluto.",
      es: "New Horizons fue la primera nave en explorar Plutón de cerca, revelando su icónica llanura de hielo de nitrógeno en forma de corazón (Regio Tombaugh) en el histórico sobrevuelo del 14 de julio de 2015. Ahora explora el Cinturón de Kuiper.",
    },
    imageQuery: "New Horizons Pluto flyby heart Tombaugh Regio Kuiper Belt",
    stats: [
      { label: "Distance",    value: "~57 AU (2025)" },
      { label: "Pluto flyby", value: "Jul 14, 2015" },
      { label: "Speed",       value: "14.5 km/s" },
      { label: "Current zone", value: "Kuiper Belt" },
    ],
  },
  {
    id: "juno",
    name: "Juno",
    program: "Deep Space",
    launch_details: { date: "2011-08-05", status: "active" },
    description: {
      en: "NASA's Juno has been orbiting Jupiter since July 4, 2016, studying the gas giant's origins, interior structure, atmosphere, and magnetosphere. Its extended mission now includes dramatic close flybys of the Galilean moons Ganymede, Europa, and Io.",
      es: "Juno orbita Júpiter desde el 4 de julio de 2016, estudiando los orígenes del gigante gaseoso, su estructura interior, atmósfera y magnetosfera. Su misión extendida incluye espectaculares sobrevuelos de las lunas Ganímedes, Europa e Io.",
    },
    imageQuery: "Juno spacecraft Jupiter orbit polar vortex storms NASA",
    stats: [
      { label: "Target",          value: "Jupiter system" },
      { label: "Orbital period",  value: "~38 days" },
      { label: "Jupiter arrival", value: "Jul 4, 2016" },
      { label: "Mission end",     value: "Sep 2025 (est.)" },
    ],
  },
  // ── Mars ─────────────────────────────────────────────────────────────────
  {
    id: "curiosity",
    name: "Curiosity",
    program: "Mars",
    launch_details: { date: "2011-11-26", status: "active" },
    description: {
      en: "NASA's Curiosity rover has explored Gale Crater since August 6, 2012, confirming that ancient Mars had conditions suitable for microbial life — liquid water, organic molecules, and the right chemistry. It has driven over 32 km across the Martian surface.",
      es: "El rover Curiosity explora el Cráter Gale desde el 6 de agosto de 2012, confirmando que el Marte antiguo tuvo condiciones habitables — agua líquida, moléculas orgánicas y la química correcta. Ha recorrido más de 32 km.",
    },
    imageQuery: "Curiosity rover Mars Gale Crater Mount Sharp science",
    stats: [
      { label: "Location",    value: "Gale Crater, Mars" },
      { label: "Landed",      value: "Aug 6, 2012" },
      { label: "Distance",    value: "32+ km driven" },
      { label: "Key find",    value: "Ancient habitable env." },
    ],
  },
  {
    id: "perseverance",
    name: "Perseverance",
    program: "Mars",
    launch_details: { date: "2020-07-30", status: "active" },
    description: {
      en: "NASA's Perseverance rover explores Mars's Jezero Crater — an ancient lake bed. It has collected 23+ sealed rock samples for future return to Earth, deployed the Ingenuity helicopter, and is testing MOXIE technology to produce oxygen from the Martian atmosphere.",
      es: "El rover Perseverance explora el Cráter Jezero de Marte. Ha recogido más de 23 muestras selladas para retornar a la Tierra, desplegó el helicóptero Ingenuity y está probando MOXIE para producir oxígeno de la atmósfera marciana.",
    },
    imageQuery: "Perseverance rover Mars Jezero Crater Ingenuity helicopter rocks",
    youtubeId: "gm0b_ijaYMQ",
    stats: [
      { label: "Location",    value: "Jezero Crater, Mars" },
      { label: "Landed",      value: "Feb 18, 2021" },
      { label: "Samples",     value: "23+ collected" },
      { label: "Ingenuity flights", value: "72+" },
    ],
  },
  // ── JWST ─────────────────────────────────────────────────────────────────
  {
    id: "jwst",
    name: "James Webb Space Telescope",
    program: "JWST",
    launch_details: { date: "2021-12-25", status: "active" },
    description: {
      en: "Operating at the L2 Lagrange point 1.5 million km from Earth, Webb observes in infrared to reveal galaxies from 13.5 billion years ago, exoplanet atmospheres, and stellar nurseries invisible to Hubble.",
      es: "Desde el punto L2 a 1.5 millones de km de la Tierra, Webb observa en infrarrojo revelando galaxias de hace 13.500 millones de años, atmósferas de exoplanetas y viveros estelares invisibles para el Hubble.",
    },
    imageQuery: "James Webb Space Telescope deep field galaxy infrared nebula",
    youtubeId: "1dAtGSzLwK8",
    stats: [
      { label: "Location",      value: "L2 · 1.5M km" },
      { label: "Mirror",        value: "6.5 m · 18 segments" },
      { label: "Launched",      value: "Dec 25, 2021" },
      { label: "First images",  value: "Jul 12, 2022" },
    ],
  },
  // ── Artemis ──────────────────────────────────────────────────────────────
  {
    id: "artemis-i",
    name: "Artemis I",
    program: "Artemis",
    launch_details: { date: "2022-11-16", status: "completed" },
    description: {
      en: "The first integrated test of NASA's Space Launch System and Orion spacecraft. The uncrewed mission traveled 450,000 km beyond the Moon, demonstrating all systems required to carry astronauts on future Artemis missions.",
      es: "La primera prueba integrada del SLS y la nave Orion. La misión no tripulada viajó 450.000 km más allá de la Luna, demostrando todos los sistemas necesarios para las futuras misiones tripuladas Artemis.",
    },
    imageQuery: "Artemis I SLS launch Orion Moon uncrewed test NASA Kennedy",
    youtubeId: "H5sLin9Hg_I",
    stats: [
      { label: "Vehicle",       value: "SLS Block 1 + Orion" },
      { label: "Duration",      value: "25d 10h 53m" },
      { label: "Max distance",  value: "432,210 km from Earth" },
      { label: "Splashdown",    value: "Dec 11, 2022" },
    ],
  },
  {
    id: "artemis-ii",
    name: "Artemis II",
    program: "Artemis",
    launch_details: { date: "2026-04-01", status: "planned" },
    description: {
      en: "The first crewed Artemis mission will carry Reid Wiseman, Victor Glover, Christina Hammock Koch, and Canadian Jeremy Hansen on a 10-day free-return trajectory around the Moon — the first humans to reach lunar distance since Apollo 17 in 1972.",
      es: "La primera misión Artemis tripulada llevará a Reid Wiseman, Victor Glover, Christina Koch y el canadiense Jeremy Hansen en una trayectoria libre de 10 días alrededor de la Luna, los primeros humanos en alcanzar distancia lunar desde el Apolo 17.",
    },
    imageQuery: "Artemis II crew Reid Wiseman Victor Glover Christina Koch Moon mission",
    stats: [
      { label: "Crew",     value: "Wiseman · Glover · Koch · Hansen" },
      { label: "Duration", value: "~10 days" },
      { label: "Target",   value: "Lunar free-return" },
      { label: "Status",   value: "Planned 2026" },
    ],
  },
];

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export async function getMissions(): Promise<Mission[]> {
  return MISSIONS;
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
      { label: "Target",    value: "Lunar South Pole" },
      { label: "Vehicle",   value: "SLS + Orion" },
      { label: "Artemis I", value: "Nov 2022 ✓" },
      { label: "Artemis II", value: "2026 · crewed flyby" },
      { label: "Artemis III", value: "2027 · landing" },
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
      { label: "Location",      value: "L2 · 1.5M km" },
      { label: "Mirror",        value: "6.5 m · 18 segments" },
      { label: "Launched",      value: "Dec 25, 2021" },
      { label: "First images",  value: "Jul 12, 2022" },
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
      { label: "Location",  value: "Jezero Crater, Mars" },
      { label: "Landed",    value: "Feb 18, 2021" },
      { label: "Samples",   value: "23+ collected" },
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
      { label: "Altitude",  value: "~408 km" },
      { label: "Speed",     value: "7.66 km/s" },
      { label: "Crew",      value: "7 members" },
      { label: "Orbits/day", value: "~15.5" },
    ],
  },
];

export async function getApod(apiKey: string) {
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
    { next: { revalidate: 43200 } }
  );
  if (!res.ok) throw new Error("APOD API error");
  return res.json();
}
