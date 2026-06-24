export type FeaturedProfessional = {
  title: string;
  subtitle: string;
  tag: string;
  cities: string[];
  state: string;
};

export const featuredProfessionals: FeaturedProfessional[] = [
  {
    title: "Indique um pedreiro",
    subtitle: "Profissional de confiança para obras, reformas e acabamentos.",
    tag: "Pedreiro",
    cities: ["Igaratá", "Santa Isabel", "Jacareí", "São José dos Campos"],
    state: "SP",
  },
  {
    title: "Indique um pintor",
    subtitle: "Serviço de pintura residencial, comercial e acabamento fino.",
    tag: "Pintura",
    cities: ["Igaratá", "Santa Isabel", "Jacareí", "São José dos Campos"],
    state: "SP",
  },
  {
    title: "Indique um eletricista",
    subtitle: "Instalações, manutenção elétrica e pequenos reparos.",
    tag: "Elétrica",
    cities: ["Igaratá", "Santa Isabel", "Jacareí", "São José dos Campos"],
    state: "SP",
  },
  {
    title: "Indique um encanador",
    subtitle: "Hidráulica, vazamentos, reparos e instalações.",
    tag: "Hidráulica",
    cities: ["Igaratá", "Santa Isabel", "Jacareí", "São José dos Campos"],
    state: "SP",
  },
  {
    title: "Indique um gesseiro",
    subtitle: "Forro, drywall, sancas e acabamento em gesso.",
    tag: "Gesso",
    cities: ["Igaratá", "Santa Isabel", "Jacareí", "São José dos Campos"],
    state: "SP",
  },
];

export function getFeaturedProfessionalsByLocation(
  cidade?: string,
  estado?: string
) {
  if (!cidade && !estado) {
    return featuredProfessionals;
  }

  const cidadeTratada = cidade?.trim().toLowerCase();
  const estadoTratado = estado?.trim().toUpperCase();

  const profissionaisFiltrados = featuredProfessionals.filter((item) => {
    const atendeEstado = estadoTratado ? item.state === estadoTratado : true;

    const atendeCidade = cidadeTratada
      ? item.cities.some(
          (city) => city.trim().toLowerCase() === cidadeTratada
        )
      : true;

    return atendeEstado && atendeCidade;
  });

  return profissionaisFiltrados.length > 0
    ? profissionaisFiltrados
    : featuredProfessionals;
}