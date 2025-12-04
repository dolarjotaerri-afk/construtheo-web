export type EnderecoCep = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export async function buscarEnderecoPorCep(
  cep: string
): Promise<EnderecoCep> {
  try {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return {
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        estado: "",
      };
    }

    // Usando AwesomeAPI (mais estável que ViaCEP no iPhone)
    const response = await fetch(
      `https://cep.awesomeapi.com.br/json/${cepLimpo}`
    );

    if (!response.ok) {
      console.warn("CEP API responded with status", response.status);
      return {
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        estado: "",
      };
    }

    const data = await response.json();

    if (data.status === 400 || data.message === "CEP não encontrado") {
      return {
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        estado: "",
      };
    }

    return {
      cep: data.cep ?? "",
      logradouro: data.address ?? "",
      bairro: data.district ?? "",
      cidade: data.city ?? "",
      estado: data.state ?? "",
    };
  } catch (err) {
    console.error("Erro ao buscar CEP:", err);

    // Nunca dar throw → Safari não quebra
    return {
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      estado: "",
    };
  }
}