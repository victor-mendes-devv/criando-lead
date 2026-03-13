export interface LeadFormData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
  vende_no_ml: string;
  user_agent: string;
  _fbc: string;
  _fbp: string;
}

export interface CreateLeadFlowResponse {
  success: boolean;
  companyId: number | string;
  contactId: number | string;
  leadId: number | string;
  accountResult?: unknown;
  contactResult?: unknown;
  leadResult?: unknown;
  error?: string;
}

export const createLeadFlow = async (
  form: LeadFormData,
): Promise<CreateLeadFlowResponse> => {
  const response = await fetch("/api/create-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  const data: CreateLeadFlowResponse = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Erro ao criar lead.");
  }

  return data;
};
