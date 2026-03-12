import axios from "axios";

const API_URL = import.meta.env.VITE_NUTSHELL_API_URL;
const API_USERNAME = import.meta.env.VITE_NUTSHELL_USERNAME;
const API_PASSWORD = import.meta.env.VITE_NUTSHELL_PASSWORD;

if (!API_URL) {
  throw new Error("VITE_NUTSHELL_API_URL nao foi definida no .env");
}

if (!API_USERNAME) {
  throw new Error("VITE_NUTSHELL_USERNAME nao foi definida no .env");
}

if (!API_PASSWORD) {
  throw new Error("VITE_NUTSHELL_PASSWORD nao foi definida no .env");
}

const basicAuth = btoa(`${API_USERNAME}:${API_PASSWORD}`);

const nutshellRequest = async (method: string, params: Record<string, any>) => {
  const response = await axios.post(
    API_URL,
    {
      jsonrpc: "2.0",
      method,
      id: Date.now(),
      params,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
    },
  );

  if (response.data?.error) {
    throw response.data.error;
  }

  return response.data?.result;
};

interface CreateLeadFlowPayload {
  accountRequest: Record<string, any>;
  contactRequest: Record<string, any>;
  leadRequest: Record<string, any>;
}

export const createLeadFlow = async ({
  accountRequest,
  contactRequest,
  leadRequest,
}: CreateLeadFlowPayload) => {
  try {
    // 1) Cria a company
    const accountResult = await nutshellRequest(
      accountRequest.method,
      accountRequest.params,
    );

    const companyId = accountResult?.id;

    if (!companyId) {
      throw new Error("Nao foi possivel obter o id da company criada");
    }

    // 2) Injeta o id da company no contact
    const contactParams = structuredClone(contactRequest.params);
    contactParams.contact.accounts = [
      {
        relationship: "Empresa relacionada",
        id: Number(companyId),
      },
    ];

    const contactResult = await nutshellRequest(
      contactRequest.method,
      contactParams,
    );

    const contactId = contactResult?.id;

    if (!contactId) {
      throw new Error("Nao foi possivel obter o id do contact criado");
    }

    // 3) Injeta ids reais no lead
    const leadParams = structuredClone(leadRequest.params);
    leadParams.lead.primaryAccount = { id: Number(companyId) };
    leadParams.lead.contacts = [{ id: Number(contactId) }];

    const leadResult = await nutshellRequest(leadRequest.method, leadParams);

    return {
      success: true,
      companyId,
      contactId,
      leadId: leadResult?.id ?? null,
      accountResult,
      contactResult,
      leadResult,
    };
  } catch (error: any) {
    console.error("Erro no fluxo Nutshell:", error);

    if (error?.response?.data) {
      throw error.response.data;
    }

    if (error?.message) {
      throw new Error(error.message);
    }

    throw new Error("Erro ao executar fluxo de criacao na Nutshell");
  }
};
