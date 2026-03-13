export interface LeadFormData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
}

export const createLeadFlow = async (form: LeadFormData) => {
  const response = await fetch("/api/create-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Erro ao criar lead.");
  }

  return data;
};
