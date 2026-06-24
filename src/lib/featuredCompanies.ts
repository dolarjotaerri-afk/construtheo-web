export type FeaturedCompany = {
  name: string;
  category: string;
  location: string;
  cities: string[];
  state: string;
  badge: string;
  logo: string;
  whatsapp: string;
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
    location: "São José dos Campos/SP e Região",
    cities: ["São José dos Campos", "Jacareí", "Igaratá", "Santa Isabel"],
    state: "SP",
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
    location: "São Paulo/SP e Região",
    cities: ["São Paulo", "Guarulhos", "Arujá", "Santa Isabel"],
    state: "SP",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/vidracaria-alvarenga.png",
    whatsapp: "5511982081051",
  },
];

export function getFeaturedCompaniesByLocation(cidade?: string, estado?: string) {
  if (!cidade && !estado) {
    return featuredCompanies;
  }

  const cidadeTratada = cidade?.trim().toLowerCase();
  const estadoTratado = estado?.trim().toUpperCase();

  const empresasFiltradas = featuredCompanies.filter((empresa) => {
    const atendeEstado = estadoTratado ? empresa.state === estadoTratado : true;

    const atendeCidade = cidadeTratada
      ? empresa.cities.some(
          (city) => city.trim().toLowerCase() === cidadeTratada
        )
      : true;

    return atendeEstado && atendeCidade;
  });

  return empresasFiltradas.length > 0 ? empresasFiltradas : featuredCompanies;
}