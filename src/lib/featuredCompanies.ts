export type FeaturedCompany = {
  name: string;
  category: string;
  location: string;
  cities: string[];
  state: string;
  badge: string;
  logo: string;
  whatsapp: string;
  stateWide?: boolean;
};

export const featuredCompanies: FeaturedCompany[] = [
  {
    name: "Depósito Formigão",
    category: "Depósito",
    location: "Igaratá/SP e Região",
    cities: ["Igaratá", "Santa Isabel", "Jacareí", "São José dos Campos"],
    state: "SP",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/deposito.png",
    whatsapp: "5511944674658",
  },
  {
    name: "DSA Energia Solar",
    category: "Energia solar",
    location: "Atendimento em todo o estado de SP",
    cities: [],
    state: "SP",
    stateWide: true,
    badge: "★ 5.0 Qualidade",
    logo: "/logos/dsa-energia-solar.png",
    whatsapp: "5512997223060",
  },
  {
    name: "L.C Caçambas",
    category: "Caçamba",
    location: "Santa Isabel/SP e Região",
    cities: ["Santa Isabel", "Igaratá", "Arujá", "Guarulhos"],
    state: "SP",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/lc-cacambas.png",
    whatsapp: "5511998014113",
  },
  {
    name: "Vidraçaria Alvarenga",
    category: "Vidraçaria",
    location: "Atendimento em todo o estado de SP",
    cities: [],
    state: "SP",
    stateWide: true,
    badge: "★ 5.0 Qualidade",
    logo: "/logos/vidracaria-alvarenga.png",
    whatsapp: "5511982081051",
  },
];

export function getFeaturedCompaniesByLocation(
  cidade?: string,
  estado?: string
) {
  const cidadeTratada = cidade?.trim().toLowerCase() || "";
  const estadoTratado = estado?.trim().toUpperCase() || "";

  // Sem localização não exibimos parceiros fixos para evitar
  // mostrar empresas de São Paulo para usuários de qualquer região.
  if (!cidadeTratada && !estadoTratado) {
    return [];
  }

  return featuredCompanies.filter((empresa) => {
    // Se o estado do usuário estiver disponível, precisa ser o mesmo
    // estado atendido pela empresa.
    if (estadoTratado && empresa.state !== estadoTratado) {
      return false;
    }

    // Empresas marcadas como estaduais podem aparecer para qualquer
    // cidade daquele estado.
    if (empresa.stateWide && estadoTratado === empresa.state) {
      return true;
    }

    // Empresas regionais só aparecem nas cidades declaradas.
    if (!cidadeTratada) {
      return false;
    }

    return empresa.cities.some(
      (city) => city.trim().toLowerCase() === cidadeTratada
    );
  });
}