/** Aktive politikere i Oslo — bystyret 2023–2027 + gjeldende byråd per juni 2026. */
export type OsloPoliticianSeed = {
  id: string;
  name: string;
  party: string;
  role: string;
};

export const OSLO_POLITICIANS: OsloPoliticianSeed[] = [
  // Ordfører og varaordfører
  { id: "anne-lindboe", name: "Anne Lindboe", party: "Høyre", role: "Ordfører" },
  { id: "julianne-ofstad", name: "Julianne Ofstad", party: "Fremskrittspartiet", role: "Varaordfører" },

  // Byrådet (H/V-koalisjonen)
  { id: "eirik-lae-solberg", name: "Eirik Lae Solberg", party: "Høyre", role: "Byrådsleder" },
  { id: "hallstein-bjercke", name: "Hallstein Bjercke", party: "Venstre", role: "Byråd for finans" },
  {
    id: "marit-kristine-vea",
    name: "Marit Kristine Vea",
    party: "Venstre",
    role: "Byråd for miljø og samferdsel",
  },
  { id: "oluf-ulseth", name: "Oluf Ulseth", party: "Høyre", role: "Byråd for helse" },
  {
    id: "julie-remen-midtgarden",
    name: "Julie Remen Midtgarden",
    party: "Høyre",
    role: "Byråd for utdanning",
  },
  {
    id: "anita-leirvik-north",
    name: "Anita Leirvik North",
    party: "Høyre",
    role: "Byråd for byutvikling",
  },
  {
    id: "julianne-ferskaug",
    name: "Julianne Ferskaug",
    party: "Venstre",
    role: "Byråd for sosiale tjenester",
  },
  {
    id: "mehmet-kaan-inan",
    name: "Mehmet Kaan Inan",
    party: "Høyre",
    role: "Byråd for kultur og næring",
  },

  // Høyre — bystyremedlemmer
  { id: "james-stove-lorentzen", name: "James Stove Lorentzen", party: "Høyre", role: "Bystyremedlem" },
  { id: "hassan-nawaz", name: "Hassan Nawaz", party: "Høyre", role: "Bystyremedlem" },
  { id: "merete-agerbak-jensen", name: "Merete Agerbak-Jensen", party: "Høyre", role: "Bystyremedlem" },
  { id: "hilde-helland", name: "Hilde Helland", party: "Høyre", role: "Bystyremedlem" },
  { id: "ingeborg-tennes", name: "Ingeborg Tennes", party: "Høyre", role: "Bystyremedlem" },
  { id: "saliba-andreas-korkunc", name: "Saliba Andreas Korkunc", party: "Høyre", role: "Bystyremedlem" },
  {
    id: "bjorgulv-vinje-borgundvaag",
    name: "Bjørgulv Vinje Borgundvaag",
    party: "Høyre",
    role: "Bystyremedlem",
  },
  { id: "fabian-stang", name: "Fabian Stang", party: "Høyre", role: "Bystyremedlem" },
  { id: "arve-juritzen", name: "Arve Juritzen", party: "Høyre", role: "Bystyremedlem" },
  { id: "carl-oscar-pedersen", name: "Carl Oscar Pedersen", party: "Høyre", role: "Bystyremedlem" },
  { id: "per-trygve-hoff", name: "Per Trygve Hoff", party: "Høyre", role: "Bystyremedlem" },
  { id: "elin-horn-galtung", name: "Elin Horn Galtung", party: "Høyre", role: "Bystyremedlem" },
  { id: "grete-horntvedt", name: "Grete Horntvedt", party: "Høyre", role: "Bystyremedlem" },
  { id: "arina-aamir-sheikh", name: "Arina Aamir Sheikh", party: "Høyre", role: "Bystyremedlem" },
  { id: "oscar-christopher-husebye", name: "Oscar Christopher Husebye", party: "Høyre", role: "Bystyremedlem" },
  { id: "jenny-helene-syse", name: "Jenny Helene Syse", party: "Høyre", role: "Bystyremedlem" },
  { id: "thea-kristine-schjerven", name: "Thea Kristine Schjerven", party: "Høyre", role: "Bystyremedlem" },

  // Arbeiderpartiet
  { id: "raymond-johansen", name: "Raymond Johansen", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "rina-mariann-hansen", name: "Rina Mariann Hansen", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "eivor-evenrud", name: "Eivor Evenrud", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "abdullah-alsabeehg", name: "Abdullah Alsabeehg", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "andreas-halse", name: "Andreas Halse", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "jon-reidar-oyan", name: "Jon Reidar Øyan", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "marthe-scharning-lund", name: "Marthe Scharning Lund", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  {
    id: "tamina-sheriffdeen-rauf",
    name: "Tamina Sheriffdeen Rauf",
    party: "Arbeiderpartiet",
    role: "Bystyremedlem",
  },
  {
    id: "shila-khayrollahzadeh",
    name: "Shila Khayrollahzadeh",
    party: "Arbeiderpartiet",
    role: "Bystyremedlem",
  },
  { id: "henrik-dahl-jacobsen", name: "Henrik Dahl Jacobsen", party: "Arbeiderpartiet", role: "Bystyremedlem" },
  { id: "gro-harlem-brundtland", name: "Gro Harlem Brundtland", party: "Arbeiderpartiet", role: "Bystyremedlem" },

  // Miljøpartiet De Grønne
  { id: "sirin-hellvin-stav", name: "Sirin Hellvin Stav", party: "Miljøpartiet De Grønne", role: "Bystyremedlem" },
  { id: "eivind-traedal", name: "Eivind Trædal", party: "Miljøpartiet De Grønne", role: "Bystyremedlem" },
  { id: "arild-hermstad", name: "Arild Hermstad", party: "Miljøpartiet De Grønne", role: "Bystyremedlem" },
  { id: "rauand-ismail", name: "Rauand Ismail", party: "Miljøpartiet De Grønne", role: "Bystyremedlem" },
  {
    id: "juni-romero-berg-nielsen",
    name: "Juni Romero y. C. Berg-Nielsen",
    party: "Miljøpartiet De Grønne",
    role: "Bystyremedlem",
  },
  { id: "sigrid-z-heiberg", name: "Sigrid Z. Heiberg", party: "Miljøpartiet De Grønne", role: "Bystyremedlem" },

  // SV
  { id: "sunniva-holmas-eidsvoll", name: "Sunniva Holmås Eidsvoll", party: "SV", role: "Bystyremedlem" },
  { id: "omar-samy-gamal", name: "Omar Samy Gamal", party: "SV", role: "Bystyremedlem" },
  { id: "sarah-safavifard", name: "Sarah Safavifard", party: "SV", role: "Bystyremedlem" },
  { id: "attia-mehmood", name: "Attia Mehmood", party: "SV", role: "Bystyremedlem" },
  { id: "sulaksana-sivapatham", name: "Sulaksana Sivapatham", party: "SV", role: "Bystyremedlem" },
  { id: "ola-wolff-elvevold", name: "Ola Wolff Elvevold", party: "SV", role: "Bystyremedlem" },

  // Venstre — bystyremedlemmer
  { id: "anna-dasnes", name: "Anna Dåsnes", party: "Venstre", role: "Bystyremedlem" },
  { id: "haakon-peter-riekeles", name: "Haakon Peter Riekeles", party: "Venstre", role: "Bystyremedlem" },
  { id: "tejn-rollland", name: "Tejn Rolland", party: "Venstre", role: "Bystyremedlem" },
  { id: "eili-vigestad-berge", name: "Eili Vigestad Berge", party: "Venstre", role: "Bystyremedlem" },

  // Fremskrittspartiet
  { id: "lars-petter-solas", name: "Lars Petter Solås", party: "Fremskrittspartiet", role: "Bystyremedlem" },
  { id: "magnus-birkelund", name: "Magnus Birkelund", party: "Fremskrittspartiet", role: "Bystyremedlem" },
  { id: "ingeborg-bjornevik", name: "Ingeborg Bjørnevik", party: "Fremskrittspartiet", role: "Bystyremedlem" },

  // Rødt
  { id: "sofia-rana", name: "Sofia Rana", party: "Rødt", role: "Bystyremedlem" },
  { id: "siavash-mobasheri", name: "Siavash Mobasheri", party: "Rødt", role: "Bystyremedlem" },
  { id: "mari-rise-knutsen", name: "Mari Rise Knutsen", party: "Rødt", role: "Bystyremedlem" },
  { id: "jorunn-folkvord", name: "Jorunn Folkvord", party: "Rødt", role: "Bystyremedlem" },

  // Kristelig Folkeparti
  { id: "oyvind-habrekke", name: "Øyvind Håbrekke", party: "Kristelig Folkeparti", role: "Bystyremedlem" },

  // Partiet Sentrum
  { id: "geir-lippestad", name: "Geir Lippestad", party: "Partiet Sentrum", role: "Bystyremedlem" },
];

export const OSLO_POLITICIAN_IDS = OSLO_POLITICIANS.map((p) => p.id);
