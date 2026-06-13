import { searchNASAVideos } from "./youtube";

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
  image?: string;
  crewed?: boolean;
  rocketId?: string;
  audioClip?: {
    url: string;
    transcripts: { time: number; es: string; en: string }[];
  };
  countdownTarget?: string;
};

export type Bilingual = { en: string; es: string };

export type MissionImage = {
  url: string;
  hd: string;
  title: string;
  date: string | null;
  center: string | null;
  description: string | null;
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
  // ── Enriched detail (optional) ──
  agency?: string;
  since?: string; // operational since / launch date label
  status?: Bilingual;
  objectives?: Bilingual[];
  timeline?: { date: string; en: string; es: string }[];
  instruments?: { name: string; en: string; es: string }[];
  links?: { label: string; url: string }[];
  live?: "iss" | "mars-rover";
  rover?: "perseverance" | "curiosity";
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
    image: "assets/missions/freedom-7.jpg",
    stats: [
      { label: "Astronaut",  value: "Alan Shepard" },
      { label: "Duration",   value: "15 min 22 sec" },
      { label: "Altitude",   value: "187 km" },
      { label: "Vehicle",    value: "Mercury-Redstone 3" },
    ],
    crewed: true,
    rocketId: "redstone",
    audioClip: {
      url: "https://www.nasa.gov/wp-content/uploads/2015/01/590327main_ringtone_shepard_candle.mp3",
      transcripts: [
        { time: 0, es: "Alan Shepard: Entendido, recibido.", en: "Alan Shepard: Roger, liftoff." },
        { time: 2, es: "El temporizador ha comenzado.", en: "The spacecraft timer is started." },
        { time: 4, es: "¡De acuerdo, encended esta vela!", en: "All right, light this candle!" }
      ]
    }
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
    image: "assets/missions/friendship-7.jpg",
    stats: [
      { label: "Astronaut",  value: "John Glenn" },
      { label: "Orbits",     value: "3" },
      { label: "Duration",   value: "4h 55m" },
      { label: "Vehicle",    value: "Mercury-Atlas 6" },
    ],
    crewed: true,
    rocketId: "atlas"
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
    image: "assets/missions/gemini-12.jpg",
    stats: [
      { label: "Crew",       value: "Lovell · Aldrin" },
      { label: "Duration",   value: "3d 22h 34m" },
      { label: "EVA time",   value: "5h 30m" },
      { label: "Orbits",     value: "59" },
    ],
    crewed: true,
    rocketId: "titan"
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
    image: "assets/missions/apollo-11.jpg",
    youtubeId: "hZNB5ASBV1k",
    stats: [
      { label: "Crew",       value: "Armstrong · Collins · Aldrin" },
      { label: "Landing",    value: "Sea of Tranquility" },
      { label: "Moonwalk",   value: "2h 31m" },
      { label: "Samples",    value: "21.5 kg" },
    ],
    crewed: true,
    rocketId: "saturn-v",
    audioClip: {
      url: "https://www.nasa.gov/wp-content/uploads/2015/01/590331main_ringtone_smallStep.mp3",
      transcripts: [
        { time: 0, es: "[Estática de radio y pitido Quindar]", en: "[Radio static and Quindar beep]" },
        { time: 2, es: "Neil Armstrong: Estoy al pie de la escalera.", en: "Neil Armstrong: I'm at the foot of the ladder." },
        { time: 5, es: "Los soportes del módulo lunar se hunden en la superficie unas 1 o 2 pulgadas...", en: "The LM footpads are only depressed in the surface about 1 or 2 inches..." },
        { time: 10, es: "Voy a descender de la plataforma del módulo ahora.", en: "I'm going to step off the LM now." },
        { time: 13, es: "Este es un pequeño paso para el hombre...", en: "That's one small step for man..." },
        { time: 18, es: "...un gran salto para la humanidad.", en: "...one giant leap for mankind." }
      ]
    }
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
    image: "assets/missions/apollo-13.jpg",
    stats: [
      { label: "Crew",       value: "Lovell · Swigert · Haise" },
      { label: "Failure",    value: "O₂ tank 2 explosion" },
      { label: "Duration",   value: "5d 22h 54m" },
      { label: "Result",     value: "Crew returned safely" },
    ],
    crewed: true,
    rocketId: "saturn-v",
    audioClip: {
      url: "https://www.nasa.gov/wp-content/uploads/2015/01/617935main_apollo13_problem.mp3",
      transcripts: [
        { time: 0, es: "Jack Swigert: Bien, Houston, hemos tenido un problema aquí.", en: "Jack Swigert: Okay, Houston, we've had a problem here." },
        { time: 3, es: "CAPCOM (Jack Lousma): Aquí Houston. Repita, por favor.", en: "CAPCOM (Jack Lousma): This is Houston. Say again, please." },
        { time: 6, es: "Jim Lovell: Houston, hemos tenido un problema.", en: "Jim Lovell: Houston, we've had a problem." },
        { time: 9, es: "Hemos tenido una bajada de tensión en el Bus Principal B.", en: "We've had a Main B Bus undervolt." }
      ]
    }
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
    image: "assets/missions/apollo-17.jpg",
    stats: [
      { label: "Crew",         value: "Cernan · Evans · Schmitt" },
      { label: "Landing site", value: "Taurus-Littrow" },
      { label: "Surface time", value: "74h 59m" },
      { label: "Samples",      value: "110.5 kg" },
    ],
    crewed: true,
    rocketId: "saturn-v"
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
    image: "assets/missions/skylab.jpg",
    stats: [
      { label: "Crews",        value: "3 missions" },
      { label: "Total time",   value: "171 crew-days" },
      { label: "Altitude",     value: "~435 km" },
      { label: "Re-entry",     value: "Jul 11, 1979" },
    ],
    crewed: true,
    rocketId: "saturn-v"
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
    image: "assets/missions/sts-1.jpg",
    stats: [
      { label: "Crew",       value: "Young · Crippen" },
      { label: "Duration",   value: "2d 6h 20m" },
      { label: "Orbits",     value: "36" },
      { label: "Vehicle",    value: "OV-102 Columbia" },
    ],
    crewed: true,
    rocketId: "shuttle"
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
    image: "assets/missions/hubble.jpg",
    stats: [
      { label: "Altitude",       value: "~547 km" },
      { label: "Mirror",         value: "2.4 m" },
      { label: "Observations",   value: "1.5M+" },
      { label: "Science papers", value: "21,000+" },
    ],
    crewed: false,
    rocketId: "shuttle"
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
    image: "assets/missions/iss.jpg",
    youtubeId: "jJ7Md2QGRh4",
    stats: [
      { label: "Altitude",      value: "~408 km" },
      { label: "Speed",         value: "7.66 km/s" },
      { label: "Crew",          value: "7 members" },
      { label: "Inhabited since", value: "Nov 2, 2000" },
    ],
    crewed: true,
    rocketId: "proton"
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
    image: "assets/missions/voyager-1.jpg",
    stats: [
      { label: "Distance",           value: "~165 AU (2025)" },
      { label: "Speed",              value: "17 km/s" },
      { label: "Signal delay",       value: "~23 hours" },
      { label: "Crossed heliosphere", value: "Aug 2012" },
    ],
    crewed: false,
    rocketId: "titan-iii"
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
    image: "assets/missions/voyager-2.jpg",
    stats: [
      { label: "Distance",           value: "~137 AU (2025)" },
      { label: "Speed",              value: "15.4 km/s" },
      { label: "Signal delay",       value: "~19 hours" },
      { label: "Crossed heliosphere", value: "Nov 2018" },
    ],
    crewed: false,
    rocketId: "titan-iii"
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
    image: "assets/missions/new-horizons.jpg",
    stats: [
      { label: "Distance",    value: "~57 AU (2025)" },
      { label: "Pluto flyby", value: "Jul 14, 2015" },
      { label: "Speed",       value: "14.5 km/s" },
      { label: "Current zone", value: "Kuiper Belt" },
    ],
    crewed: false,
    rocketId: "atlas-v"
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
    image: "assets/missions/juno.jpg",
    stats: [
      { label: "Target",          value: "Jupiter system" },
      { label: "Orbital period",  value: "~38 days" },
      { label: "Jupiter arrival", value: "Jul 4, 2016" },
      { label: "Mission end",     value: "Sep 2025 (est.)" },
    ],
    crewed: false,
    rocketId: "atlas-v"
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
    image: "assets/missions/curiosity.jpg",
    stats: [
      { label: "Location",    value: "Gale Crater, Mars" },
      { label: "Landed",      value: "Aug 6, 2012" },
      { label: "Distance",    value: "32+ km driven" },
      { label: "Key find",    value: "Ancient habitable env." },
    ],
    crewed: false,
    rocketId: "atlas-v"
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
    image: "assets/missions/perseverance.jpg",
    youtubeId: "gm0b_ijaYMQ",
    stats: [
      { label: "Location",    value: "Jezero Crater, Mars" },
      { label: "Landed",      value: "Feb 18, 2021" },
      { label: "Samples",     value: "23+ collected" },
      { label: "Ingenuity flights", value: "72+" },
    ],
    crewed: false,
    rocketId: "atlas-v"
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
    image: "assets/missions/jwst.jpg",
    youtubeId: "1dAtGSzLwK8",
    stats: [
      { label: "Location",      value: "L2 · 1.5M km" },
      { label: "Mirror",        value: "6.5 m · 18 segments" },
      { label: "Launched",      value: "Dec 25, 2021" },
      { label: "First images",  value: "Jul 12, 2022" },
    ],
    crewed: false,
    rocketId: "ariane-5"
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
    image: "assets/missions/artemis-i.jpg",
    youtubeId: "H5sLin9Hg_I",
    stats: [
      { label: "Vehicle",       value: "SLS Block 1 + Orion" },
      { label: "Duration",      value: "25d 10h 53m" },
      { label: "Max distance",  value: "432,210 km from Earth" },
      { label: "Splashdown",    value: "Dec 11, 2022" },
    ],
    crewed: false,
    rocketId: "sls"
  },
  {
    id: "artemis-ii",
    name: "Artemis II",
    program: "Artemis",
    launch_details: { date: "2026-09-30", status: "planned" }, // Updated to September 2026 for a long countdown
    description: {
      en: "The first crewed Artemis mission will carry Reid Wiseman, Victor Glover, Christina Hammock Koch, and Canadian Jeremy Hansen on a 10-day free-return trajectory around the Moon — the first humans to reach lunar distance since Apollo 17 in 1972.",
      es: "La primera misión Artemis tripulada llevará a Reid Wiseman, Victor Glover, Christina Koch y el canadiense Jeremy Hansen en una trayectoria libre de 10 días alrededor de la Luna, los primeros humanos en alcanzar distancia lunar desde el Apolo 17.",
    },
    imageQuery: "Artemis II crew Reid Wiseman Victor Glover Christina Koch Moon mission",
    image: "assets/missions/artemis-ii.jpg",
    stats: [
      { label: "Crew",     value: "Wiseman · Glover · Koch · Hansen" },
      { label: "Duration", value: "~10 days" },
      { label: "Target",   value: "Lunar free-return" },
      { label: "Status",   value: "Planned 2026" },
    ],
    crewed: true,
    countdownTarget: "2026-09-30T12:00:00Z"
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
      .map((url: string) => url.replace(/~orig/g, "~medium").replace(/~large/g, "~medium"))
      .slice(0, count);
  } catch {
    return [];
  }
}

// Rich image search: returns metadata (title/date/center/description), HD url,
// de-duplicated by nasa_id. Used by the Active Missions gallery + lightbox.
export async function getMissionImagesRich(query: string, count = 14): Promise<MissionImage[]> {
  try {
    const res = await fetch(
      `${IMAGES_API}/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${count * 2}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const seen = new Set<string>();
    const out: MissionImage[] = [];
    for (const item of data.collection?.items ?? []) {
      const meta = item.data?.[0] ?? {};
      const id: string = meta.nasa_id ?? "";
      const link: string | undefined = item.links?.[0]?.href;
      if (!link || (id && seen.has(id))) continue;
      if (id) seen.add(id);
      out.push({
        url: link.replace(/~orig|~large/g, "~medium"),
        hd: link.replace(/~thumb|~small|~medium/g, "~large"),
        title: meta.title ?? "NASA",
        date: meta.date_created ?? null,
        center: meta.center ?? meta.photographer ?? null,
        description: meta.description ?? null,
      });
      if (out.length >= count) break;
    }
    return out;
  } catch {
    return [];
  }
}

// Resolve a working, embeddable official video id for a mission. Searches the
// NASA YouTube channel first (fresh + valid), falling back to a known id.
export async function findMissionVideoId(query: string, fallback: string): Promise<string> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return fallback;
  try {
    const vids = await searchNASAVideos(query, key, 1);
    return vids[0]?.id ?? fallback;
  } catch {
    return fallback;
  }
}

export type MarsLatest = {
  sol: number;
  earthDate: string;
  total: number;
  photo: string | null;
  camera: string | null;
} | null;

// Latest photos from a Mars rover (drives the "live" Mars widget).
export async function getMarsLatest(rover: string): Promise<MarsLatest> {
  const key = process.env.NASA_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${key}`,
      { next: { revalidate: 21600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data.latest_photos ?? [];
    if (photos.length === 0) return null;
    const p = photos[0];
    return {
      sol: p.sol,
      earthDate: p.earth_date,
      total: photos.length,
      photo: p.img_src ?? null,
      camera: p.camera?.full_name ?? p.camera?.name ?? null,
    };
  } catch {
    return null;
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
    agency: "NASA",
    since: "Program · since 2017",
    status: { en: "In progress", es: "En curso" },
    objectives: [
      { en: "Return humans to the Moon for the first time since Apollo 17 (1972).", es: "Devolver humanos a la Luna por primera vez desde el Apolo 17 (1972)." },
      { en: "Land the first woman and first person of color near the lunar South Pole.", es: "Posar a la primera mujer y a la primera persona de color cerca del polo sur lunar." },
      { en: "Build a sustainable presence with the Gateway station and a base camp.", es: "Construir una presencia sostenible con la estación Gateway y un campamento base." },
      { en: "Prove the deep-space systems needed for the first crewed mission to Mars.", es: "Probar los sistemas de espacio profundo necesarios para la primera misión tripulada a Marte." },
    ],
    timeline: [
      { date: "2022-11", en: "Artemis I — uncrewed SLS + Orion test flight around the Moon.", es: "Artemis I — vuelo de prueba no tripulado de SLS + Orion alrededor de la Luna." },
      { date: "2026-04", en: "Artemis II — first crew on a lunar free-return flyby.", es: "Artemis II — primera tripulación en un sobrevuelo lunar de retorno libre." },
      { date: "2027", en: "Artemis III — first crewed lunar landing of the program.", es: "Artemis III — primer alunizaje tripulado del programa." },
    ],
    instruments: [
      { name: "SLS", en: "Space Launch System — the most powerful NASA rocket.", es: "Space Launch System — el cohete más potente de la NASA." },
      { name: "Orion", en: "Crew spacecraft built for deep-space travel.", es: "Nave de tripulación para viajes al espacio profundo." },
      { name: "HLS", en: "Human Landing System (Starship) for the surface.", es: "Sistema de aterrizaje humano (Starship) para la superficie." },
      { name: "Gateway", en: "Lunar-orbit station for staging missions.", es: "Estación en órbita lunar para escalonar misiones." },
    ],
    links: [{ label: "NASA · Artemis", url: "https://www.nasa.gov/humans-in-space/artemis/" }],
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
    agency: "NASA · ESA · CSA",
    since: "Operational since 2022",
    status: { en: "Operational", es: "Operativo" },
    objectives: [
      { en: "Observe the first galaxies that formed after the Big Bang.", es: "Observar las primeras galaxias que se formaron tras el Big Bang." },
      { en: "Study the atmospheres of exoplanets for signs of habitability.", es: "Estudiar las atmósferas de exoplanetas en busca de habitabilidad." },
      { en: "Watch stars and planetary systems being born inside dust clouds.", es: "Observar el nacimiento de estrellas y sistemas planetarios dentro de nubes de polvo." },
      { en: "See through cosmic dust in infrared, where Hubble cannot.", es: "Ver a través del polvo cósmico en infrarrojo, donde el Hubble no llega." },
    ],
    timeline: [
      { date: "2021-12-25", en: "Launched aboard an Ariane 5 from French Guiana.", es: "Lanzado en un Ariane 5 desde la Guayana Francesa." },
      { date: "2022-01", en: "Arrived and inserted into orbit around the L2 point.", es: "Llegó e ingresó en órbita alrededor del punto L2." },
      { date: "2022-07-12", en: "Released its first full-color science images.", es: "Publicó sus primeras imágenes científicas a todo color." },
    ],
    instruments: [
      { name: "NIRCam", en: "Near-infrared camera — the main imager.", es: "Cámara de infrarrojo cercano — el generador de imágenes principal." },
      { name: "NIRSpec", en: "Near-infrared spectrograph.", es: "Espectrógrafo de infrarrojo cercano." },
      { name: "MIRI", en: "Mid-infrared camera and spectrograph.", es: "Cámara y espectrógrafo de infrarrojo medio." },
      { name: "FGS/NIRISS", en: "Fine guidance + near-infrared imaging.", es: "Guiado fino + imagen en infrarrojo cercano." },
    ],
    links: [{ label: "NASA · Webb", url: "https://science.nasa.gov/mission/webb/" }],
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
    agency: "NASA · JPL",
    since: "On Mars since 2021",
    status: { en: "Roving Jezero Crater", es: "Explorando el Cráter Jezero" },
    live: "mars-rover",
    rover: "perseverance",
    objectives: [
      { en: "Seek signs of ancient microbial life in an ancient lake bed.", es: "Buscar señales de vida microbiana antigua en un antiguo lecho lacustre." },
      { en: "Collect and seal rock cores for a future Mars Sample Return.", es: "Recoger y sellar muestras de roca para un futuro retorno de muestras de Marte." },
      { en: "Characterize Jezero's geology and past climate.", es: "Caracterizar la geología y el clima pasado de Jezero." },
      { en: "Demonstrate new tech: MOXIE oxygen and the Ingenuity helicopter.", es: "Demostrar nueva tecnología: oxígeno MOXIE y el helicóptero Ingenuity." },
    ],
    timeline: [
      { date: "2020-07-30", en: "Launched from Cape Canaveral.", es: "Lanzado desde Cabo Cañaveral." },
      { date: "2021-02-18", en: "Landed in Jezero Crater after 'seven minutes of terror'.", es: "Aterrizó en el Cráter Jezero tras los 'siete minutos de terror'." },
      { date: "2021-04-19", en: "Ingenuity made the first powered flight on another world.", es: "Ingenuity realizó el primer vuelo propulsado en otro mundo." },
    ],
    instruments: [
      { name: "Mastcam-Z", en: "Zoomable stereo panoramic cameras.", es: "Cámaras panorámicas estéreo con zoom." },
      { name: "SuperCam", en: "Laser spectroscopy of rocks at a distance.", es: "Espectroscopía láser de rocas a distancia." },
      { name: "PIXL", en: "X-ray chemistry mapping of surfaces.", es: "Mapeo químico de superficies por rayos X." },
      { name: "MOXIE", en: "Produces oxygen from the CO₂ atmosphere.", es: "Produce oxígeno a partir de la atmósfera de CO₂." },
    ],
    links: [{ label: "NASA · Mars 2020", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }],
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
    agency: "NASA · Roscosmos · ESA · JAXA · CSA",
    since: "Crewed since Nov 2000",
    status: { en: "Continuously inhabited", es: "Habitada de forma continua" },
    live: "iss",
    objectives: [
      { en: "Run microgravity science that is impossible to do on Earth.", es: "Realizar ciencia en microgravedad imposible de hacer en la Tierra." },
      { en: "Test life-support and systems for future deep-space missions.", es: "Probar soporte vital y sistemas para futuras misiones de espacio profundo." },
      { en: "Observe Earth's climate, oceans and natural disasters from orbit.", es: "Observar el clima, los océanos y los desastres naturales de la Tierra desde la órbita." },
      { en: "Sustain international cooperation in human spaceflight.", es: "Sostener la cooperación internacional en los vuelos espaciales tripulados." },
    ],
    timeline: [
      { date: "1998-11-20", en: "First module, Zarya, launched to orbit.", es: "Se lanzó a órbita el primer módulo, Zarya." },
      { date: "2000-11-02", en: "Expedition 1 began continuous human presence.", es: "La Expedición 1 inició la presencia humana continua." },
      { date: "2011", en: "Assembly completed after 13 years of construction.", es: "Se completó el ensamblaje tras 13 años de construcción." },
    ],
    instruments: [
      { name: "Destiny", en: "US laboratory module.", es: "Módulo laboratorio de EE. UU." },
      { name: "Columbus", en: "ESA research laboratory.", es: "Laboratorio de investigación de la ESA." },
      { name: "Kibō", en: "JAXA's large experiment module.", es: "Gran módulo de experimentos de JAXA." },
      { name: "Cupola", en: "Seven-window dome for Earth observation.", es: "Cúpula de siete ventanas para observar la Tierra." },
    ],
    links: [{ label: "NASA · ISS", url: "https://www.nasa.gov/international-space-station/" }],
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
