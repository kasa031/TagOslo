import { PrismaClient, type Bydel, type PlaceCategory } from "@prisma/client";

const prisma = new PrismaClient();

const politicians = [
  { id: "anne-beate-hjerno", name: "Anne Beate Hjernø", party: "Arbeiderpartiet", role: "Byråd for byutvikling" },
  { id: "eirik-lae-solberg", name: "Eirik Lae Solberg", party: "Høyre", role: "Byrådsleder" },
  { id: "rasmus-reinvang", name: "Rasmus Reinvang", party: "MDG", role: "Byråd for miljø og transport" },
  { id: "inger-lise-hansen", name: "Inger Lise Hansen", party: "SV", role: "Byråd for eldre, helse og frivillighet" },
  { id: "aud-kvalbein", name: "Aud Kvalbein", party: "KrF", role: "Byråd for næring og eierskap" },
  { id: "kamzy-gunaratnam", name: "Kamzy Gunaratnam", party: "Arbeiderpartiet", role: "Varaordfører" },
  { id: "shaista-aziz", name: "Shaista Aziz", party: "SV", role: "Bystyremedlem" },
  { id: "sylvi-listhaug", name: "Sylvi Listhaug", party: "Fremskrittspartiet", role: "Bystyremedlem" },
  { id: "lan-marie-berg", name: "Lan Marie Berg", party: "MDG", role: "Bystyremedlem" },
  { id: "carl-i-hagen", name: "Carl I. Hagen", party: "Fremskrittspartiet", role: "Bystyremedlem" },
  { id: "marianne-marthinsen", name: "Marianne Marthinsen", party: "Arbeiderpartiet", role: "Bystyremedlem" },
];

type SeedPin = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  bydel: Bydel;
  category: PlaceCategory;
  terraceFacing?: string;
  hashtags: string[];
  contents?: Array<{ text: string; authorAlias?: string }>;
  reviews?: Array<{ rating: number; comment: string; authorAlias?: string }>;
};

const launchPins: SeedPin[] = [
  {
    id: "seed-vulkan",
    title: "Vulkan",
    description: "Industriområde ved Akerselva, nå mat, kultur og uteservering.",
    latitude: 59.9223,
    longitude: 10.751,
    address: "Vulkan 1, Oslo",
    bydel: "GRUNERLOKKA",
    category: "SPISESTED",
    terraceFacing: "SV",
    hashtags: ["#solservering", "#lokalhistorie", "#uteservering"],
    contents: [
      {
        text: "Vulkan var et industriområde fra 1800-tallet. I dag er det et av byens beste steder for mat og sol på terrassen.",
        authorAlias: "TagOslo",
      },
    ],
    reviews: [{ rating: 5, comment: "Flott område for lunsj i solen.", authorAlias: "Oslo-vandrer" }],
  },


  {
    id: "seed-operaen",
    title: "Operahuset",
    description: "Ikonisk bygg ved Bjørvika med tak du kan gå på.",
    latitude: 59.9075,
    longitude: 10.7528,
    address: "Kirsten Flagstads plass 1",
    bydel: "GAMLE_OSLO",
    category: "BYGNING",
    hashtags: ["#lokalhistorie", "#utsikt", "#skjultperle"],
    contents: [
      {
        text: "Operahuset åpnet i 2008 og har blitt et symbol på det nye Oslo ved fjorden.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-munchmuseet",
    title: "Munchmuseet",
    description: "Edvard Munchs kunstmuseum i Bjørvika – «Skrik» og mer.",
    latitude: 59.9052,
    longitude: 10.7565,
    address: "Edvard Munchs plass 1",
    bydel: "GAMLE_OSLO",
    category: "BYGNING",
    hashtags: ["#lokalhistorie", "#skjultperle"],
    contents: [
      {
        text: "Det nye Munchmuseet åpnet i 2021 og er et av Nordens største kunstmuseer.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-deichman",
    title: "Deichman Bjørvika",
    description: "Hovedbiblioteket i Bjørvika – arkitektur, utsikt og gratis tilgang.",
    latitude: 59.9086,
    longitude: 10.752,
    address: "Anne-Cath. Vestlys plass 1",
    bydel: "GAMLE_OSLO",
    category: "BYGNING",
    hashtags: ["#lokalhistorie", "#familievennlig"],
  },
  {
    id: "seed-akershus",
    title: "Akershus festning",
    description: "Medieval fort fra 1290-tallet – midt ved havna og Rådhuskaia.",
    latitude: 59.9076,
    longitude: 10.7371,
    address: "Akershus festning",
    bydel: "GAMLE_OSLO",
    category: "BYGNING",
    hashtags: ["#lokalhistorie", "#utsikt"],
    contents: [
      {
        text: "Festningen har voktet Oslo i over 700 år og er et av byens viktigste historiske landemerker.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-oslo-s",
    title: "Oslo S",
    description: "Hovedbanestasjonen – knutepunkt for tog, T-bane og buss.",
    latitude: 59.9111,
    longitude: 10.7522,
    address: "Jernbanetorget 1",
    bydel: "GAMLE_OSLO",
    category: "BYGNING",
    hashtags: ["#lokalhistorie"],
  },


  {
    id: "seed-sognsvann",
    title: "Sognsvann",
    description: "Populært turmål og badeplass nord i byen.",
    latitude: 59.987,
    longitude: 10.735,
    address: "Sognsvann",
    bydel: "NORDRE_AKER",
    category: "PARK",
    hashtags: ["#tursti", "#familievennlig"],
    reviews: [{ rating: 5, comment: "Perfekt for søndagstur hele året.", authorAlias: "Nordmarka-fan" }],
  },


  {
    id: "seed-ekeberg",
    title: "Ekebergparken",
    description: "Skulpturpark med utsikt over Oslo og fjorden.",
    latitude: 59.898,
    longitude: 10.759,
    address: "Ekebergveien 25",
    bydel: "NORDSTRAND",
    category: "PARK",
    terraceFacing: "S",
    hashtags: ["#utsikt", "#lokalhistorie"],
    contents: [
      {
        text: "Edvard Munch skal ha fått inspirasjon til Skriket herfra. Utsikten er spektakulær ved solnedgang.",
        authorAlias: "TagOslo",
      },
    ],
  },


  {
    id: "seed-aker-brygge",
    title: "Aker Brygge",
    description: "Havnepromenade med restauranter og utsikt mot fjorden.",
    latitude: 59.909,
    longitude: 10.726,
    address: "Aker Brygge",
    bydel: "FROGNER",
    category: "UTESTED",
    terraceFacing: "V",
    hashtags: ["#uteservering", "#utsikt", "#solservering"],
    reviews: [
      { rating: 4, comment: "Travelt om sommeren, men fin stemning.", authorAlias: "Fjordliv" },
      { rating: 3, comment: "Dyrt, men flott sol på uteservering.", authorAlias: "Anonym" },
    ],
  },
  {
    id: "seed-vigelandsparken",
    title: "Vigelandsparken",
    description: "Gustav Vigeland sin skulpturpark – Oslos mest besøkte attraksjon.",
    latitude: 59.927,
    longitude: 10.7005,
    address: "Vigelandsparken",
    bydel: "FROGNER",
    category: "PARK",
    hashtags: ["#lokalhistorie", "#familievennlig", "#tursti"],
    contents: [
      {
        text: "Over 200 skulpturer av Gustav Vigeland, gratis tilgjengelig hele året.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-nasjonalmuseet",
    title: "Nasjonalmuseet",
    description: "Norges største kunstmuseum – Munch, klassisk kunst og design.",
    latitude: 59.9069,
    longitude: 10.7307,
    address: "Brynjulf Bulls plass 1",
    bydel: "FROGNER",
    category: "BYGNING",
    hashtags: ["#lokalhistorie"],
    contents: [
      {
        text: "Nasjonalmuseet samler Norges viktigste kunstsamlinger under ett tak ved Vestbanen.",
        authorAlias: "TagOslo",
      },
    ],
  },


  {
    id: "seed-holmenkollen",
    title: "Holmenkollen",
    description: "Skihopp og utsiktspunkt over hele Oslo.",
    latitude: 59.9618,
    longitude: 10.668,
    address: "Kongeveien 5",
    bydel: "VESTRE_AKER",
    category: "BYGNING",
    hashtags: ["#utsikt", "#tursti", "#lokalhistorie"],
    contents: [
      {
        text: "Holmenkollbakken er et av Norges mest ikoniske landemerker, med spektakulær utsikt over byen.",
        authorAlias: "TagOslo",
      },
    ],
  },


  {
    id: "seed-st-hanshaugen-park",
    title: "St. Hanshaugen park",
    description: "Grønt løft midt i byen – utsikt, fontene og sommerkvelder.",
    latitude: 59.9268,
    longitude: 10.7395,
    address: "St. Hanshaugen",
    bydel: "ST_HANSHAUGEN",
    category: "PARK",
    hashtags: ["#tursti", "#familievennlig", "#solservering"],
  },
  {
    id: "seed-stortinget",
    title: "Stortingsbygningen",
    description: "Norges parlament på Karl Johans gate – midt i Sentrum.",
    latitude: 59.9139,
    longitude: 10.7394,
    address: "Karl Johans gate 22",
    bydel: "ST_HANSHAUGEN",
    category: "BYGNING",
    hashtags: ["#lokalhistorie"],
    contents: [
      {
        text: "Stortingsbygningen ble tatt i bruk i 1866.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-slottet",
    title: "Det kongelige slott",
    description: "Kongefamiliens residens ved enden av Karl Johans gate.",
    latitude: 59.917,
    longitude: 10.7276,
    address: "Slottsplassen 1",
    bydel: "ST_HANSHAUGEN",
    category: "BYGNING",
    hashtags: ["#lokalhistorie", "#utsikt"],
    contents: [
      {
        text: "Slottet ble bygget i første halvdel av 1800-tallet og er et av Oslos mest kjente landemerker.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-radhuset",
    title: "Oslo rådhus",
    description: "Rådhuset ved Rådhusplassen – Nobels fredspris og ikonisk arkitektur.",
    latitude: 59.9115,
    longitude: 10.7339,
    address: "Fridtjof Nansens plass 1",
    bydel: "ST_HANSHAUGEN",
    category: "BYGNING",
    hashtags: ["#lokalhistorie"],
    contents: [
      {
        text: "Rådhuset ble innviet i 1950 og er kjent for mursteinsfasaden og Nobels fredspris-seremonien.",
        authorAlias: "TagOslo",
      },
    ],
  },
  {
    id: "seed-domkirke",
    title: "Oslo domkirke",
    description: "Domkirken i Oslo sentrum – norsk kirke fra 1697.",
    latitude: 59.9125,
    longitude: 10.7469,
    address: "Karl Johans gate 11",
    bydel: "ST_HANSHAUGEN",
    category: "BYGNING",
    hashtags: ["#lokalhistorie"],
  },
  {
    id: "seed-nationaltheatret",
    title: "Nationaltheatret",
    description: "Norges nasjonalscene ved Studenterlunden.",
    latitude: 59.9142,
    longitude: 10.7342,
    address: "Johanne Dybwads plass 1",
    bydel: "ST_HANSHAUGEN",
    category: "BYGNING",
    hashtags: ["#lokalhistorie"],
  },
];

async function seedPoliticians() {
  for (const politician of politicians) {
    await prisma.politician.upsert({
      where: { id: politician.id },
      update: {
        name: politician.name,
        party: politician.party,
        role: politician.role,
        active: true,
      },
      create: politician,
    });
  }
  console.log(`✓ ${politicians.length} politikere`);
}

async function seedMapPins() {
  for (const pin of launchPins) {
    await prisma.mapPin.upsert({
      where: { id: pin.id },
      update: {
        title: pin.title,
        description: pin.description,
        latitude: pin.latitude,
        longitude: pin.longitude,
        address: pin.address,
        bydel: pin.bydel,
        category: pin.category,
        terraceFacing: pin.terraceFacing ?? null,
        hashtags: pin.hashtags,
        authorAlias: "TagOslo",
      },
      create: {
        id: pin.id,
        title: pin.title,
        description: pin.description,
        latitude: pin.latitude,
        longitude: pin.longitude,
        address: pin.address,
        bydel: pin.bydel,
        category: pin.category,
        terraceFacing: pin.terraceFacing ?? null,
        hashtags: pin.hashtags,
        authorAlias: "TagOslo",
      },
    });

    if (pin.contents?.length) {
      for (const [i, content] of pin.contents.entries()) {
        const contentId = `${pin.id}-content-${i}`;
        await prisma.pinContent.upsert({
          where: { id: contentId },
          update: {
            textContent: content.text,
            authorAlias: content.authorAlias ?? "TagOslo",
            moderationStatus: "APPROVED",
          },
          create: {
            id: contentId,
            pinId: pin.id,
            type: "TEXT",
            textContent: content.text,
            authorAlias: content.authorAlias ?? "TagOslo",
            moderationStatus: "APPROVED",
          },
        });
      }
    }

    if (pin.reviews?.length) {
      for (const [i, review] of pin.reviews.entries()) {
        const reviewId = `${pin.id}-review-${i}`;
        await prisma.placeReview.upsert({
          where: { id: reviewId },
          update: {
            rating: review.rating,
            comment: review.comment,
            authorAlias: review.authorAlias ?? null,
            moderationStatus: "APPROVED",
          },
          create: {
            id: reviewId,
            pinId: pin.id,
            rating: review.rating,
            comment: review.comment,
            authorAlias: review.authorAlias ?? null,
            moderationStatus: "APPROVED",
          },
        });
      }
    }
  }
  console.log(`✓ ${launchPins.length} kart-steder med innhold`);
}

async function seedStarterPoll() {
  const pollId = "seed-poll-solservering";
  await prisma.poll.upsert({
    where: { id: pollId },
    update: {
      question: "Hvor er den beste solserveringen i Oslo?",
      description: "Hvor er den beste solserveringen?",
      bydel: "GRUNERLOKKA",
      authorAlias: "TagOslo",
    },
    create: {
      id: pollId,
      question: "Hvor er den beste solserveringen i Oslo?",
      description: "Hvor er den beste solserveringen?",
      bydel: "GRUNERLOKKA",
      authorAlias: "TagOslo",
      options: {
        create: [
          { id: `${pollId}-opt-1`, label: "Grünerløkka / Vulkan" },
          { id: `${pollId}-opt-2`, label: "Aker Brygge / Tjuvholmen" },
          { id: `${pollId}-opt-3`, label: "Sagene / Akerselva" },
          { id: `${pollId}-opt-4`, label: "Ekeberg / Nordstrand" },
        ],
      },
      politicianTags: {
        create: [{ politicianId: "rasmus-reinvang" }],
      },
    },
  });
  console.log("✓ 1 startpoll");
}

async function main() {
  console.log("Seeder TagOslo …");
  await seedPoliticians();
  await seedMapPins();
  await seedStarterPoll();
  console.log("Ferdig!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
