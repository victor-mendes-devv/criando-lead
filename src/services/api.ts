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

const PIPELINE_ID = 23;
const PRODUCT_ACIMA_50K = 403;
const PRODUCT_MENOS_50K = 407;

const FATURAMENTO_ACIMA_50K = [
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
  "ACIMA DE 1 MILHAO",
];

const FATURAMENTO_MENOS_50K = ["- 50MIL", "NAO TEM"];

interface LeadFormData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
}

const getLeadAmount = (faturamento: string) => {
  return faturamento !== "NAO TEM" ? 1 : 2;
};

const getLeadProducts = (faturamento: string) => {
  if (FATURAMENTO_MENOS_50K.includes(faturamento)) {
    return [
      {
        id: PRODUCT_MENOS_50K,
        relationship: "Potentially interested",
        quantity: 1,
        price: {
          currency_shortname: "BRL",
          amount: "1",
        },
      },
    ];
  }

  if (FATURAMENTO_ACIMA_50K.includes(faturamento)) {
    return [
      {
        id: PRODUCT_ACIMA_50K,
        relationship: "Potentially interested",
        quantity: 1,
        price: {
          currency_shortname: "BRL",
          amount: "1",
        },
      },
    ];
  }

  return [];
};

const buildBasicAuthHeader = () => {
  const token = btoa(`${API_USERNAME}:${API_PASSWORD}`);
  return `Basic ${token}`;
};

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
        Authorization: buildBasicAuthHeader(),
      },
    },
  );

  if (response.data?.error) {
    throw response.data.error;
  }

  return response.data?.result;
};

const buildAccountParams = (form: LeadFormData) => {
  return {
    account: {
      name: form.empresa.trim(),
    },
  };
};

const buildContactParams = (form: LeadFormData, companyId: number) => {
  const contact: Record<string, any> = {
    firstName: form.nome.trim(),
    accounts: [
      {
        relationship: "Empresa relacionada",
        id: companyId,
      },
    ],
  };

  if (form.email.trim()) {
    contact.email = [form.email.trim()];
  }

  if (form.telefone.trim()) {
    contact.phone = [form.telefone.trim()];
  }

  return { contact };
};

const buildLeadParams = (
  form: LeadFormData,
  companyId: number,
  contactId: number,
) => {
  const products = getLeadProducts(form.faturamento);
  const amount = getLeadAmount(form.faturamento);

  const lead: Record<string, any> = {
    description: form.nome.trim(),
    stagesetId: PIPELINE_ID,
    primaryAccount: {
      id: companyId,
    },
    contacts: [
      {
        id: contactId,
      },
    ],
    value: {
      currency: "BRL",
      amount,
    },
  };

  if (products.length) {
    lead.products = products;
  }

  return { lead };
};

export const createLeadFlow = async (form: LeadFormData) => {
  try {
    // 1) Cria company
    const accountResult = await nutshellRequest(
      "newAccount",
      buildAccountParams(form),
    );

    const companyId = accountResult?.id;

    if (!companyId) {
      throw new Error("Nao foi possivel obter o id da company criada.");
    }

    // 2) Cria contact usando o id real da company
    const contactResult = await nutshellRequest(
      "newContact",
      buildContactParams(form, Number(companyId)),
    );

    const contactId = contactResult?.id;

    if (!contactId) {
      throw new Error("Nao foi possivel obter o id do contact criado.");
    }

    // 3) Cria lead usando os ids reais de company e contact
    const leadResult = await nutshellRequest(
      "newLead",
      buildLeadParams(form, Number(companyId), Number(contactId)),
    );

    const leadId = leadResult?.id;

    if (!leadId) {
      throw new Error("Nao foi possivel obter o id da lead criada.");
    }

    return {
      success: true,
      companyId,
      contactId,
      leadId,
      accountResult,
      contactResult,
      leadResult,
    };
  } catch (error: any) {
    console.error("Erro no fluxo de criacao da Nutshell:", error);

    if (error?.message) {
      throw new Error(error.message);
    }

    throw new Error("Erro ao executar o fluxo de criacao na Nutshell.");
  }
};
