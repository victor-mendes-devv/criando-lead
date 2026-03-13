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
  assigneeId?: number;
  originConfig?: unknown;
  accountResult?: unknown;
  contactResult?: unknown;
  leadResult?: unknown;
  error?: string;
}

function buildCreateLeadUrl() {
  const currentParams = new URLSearchParams(window.location.search);

  const sourceId = currentParams.get("sourceId");
  const campaign = currentParams.get("campaign");

  const apiParams = new URLSearchParams();

  if (sourceId) {
    apiParams.set("sourceId", sourceId);
  }

  if (campaign) {
    apiParams.set("campaign", campaign);
  }

  const queryString = apiParams.toString();

  return queryString ? `/api/create-lead?${queryString}` : "/api/create-lead";
}

export const createLeadFlow = async (
  form: LeadFormData,
): Promise<CreateLeadFlowResponse> => {
  const url = buildCreateLeadUrl();

  const response = await fetch(url, {
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
