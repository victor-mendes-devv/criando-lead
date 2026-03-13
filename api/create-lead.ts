import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_URL = process.env.NUTSHELL_API_URL;
const API_USERNAME = process.env.NUTSHELL_USERNAME;
const API_PASSWORD = process.env.NUTSHELL_PASSWORD;

const PIPELINE_ID = 23;
const PRODUCT_ACIMA_50K = 403;
const PRODUCT_MENOS_50K = 407;

const FATURAMENTO_ACIMA_50K = [
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
  "ACIMA DE 1 MILHAO",
];

const FATURAMENTO_MENOS_50K = ["- 50MIL", "NAO TEM"];

type LeadFormData = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
};

function getLeadAmount(faturamento: string) {
  return faturamento !== "NAO TEM" ? 1 : 2;
}

function getLeadProducts(faturamento: string) {
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
}

function buildBasicAuthHeader() {
  const token = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString(
    "base64",
  );
  return `Basic ${token}`;
}

async function nutshellRequest(
  method: string,
  params: Record<string, unknown>,
) {
  if (!API_URL || !API_USERNAME || !API_PASSWORD) {
    throw new Error("Variaveis de ambiente da Nutshell nao configuradas.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildBasicAuthHeader(),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      id: Date.now(),
      params,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Erro HTTP ${response.status}`);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Erro retornado pela Nutshell.");
  }

  return data?.result;
}

function buildAccountParams(form: LeadFormData) {
  return {
    account: {
      name: form.empresa.trim(),
    },
  };
}

function buildContactParams(form: LeadFormData, companyId: number) {
  const contact: Record<string, unknown> = {
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
}

function buildLeadParams(
  form: LeadFormData,
  companyId: number,
  contactId: number,
) {
  const products = getLeadProducts(form.faturamento);
  const amount = getLeadAmount(form.faturamento);

  const lead: Record<string, unknown> = {
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
}

function validateForm(form: Partial<LeadFormData>) {
  if (!form.nome?.trim()) return "Nome é obrigatório.";
  if (!form.email?.trim()) return "Email é obrigatório.";
  if (!form.telefone?.trim()) return "Telefone é obrigatório.";
  if (!form.empresa?.trim()) return "Empresa é obrigatória.";
  if (!form.faturamento?.trim()) return "Faturamento é obrigatório.";
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const form = req.body as LeadFormData;
    const validationError = validateForm(form);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const accountResult = await nutshellRequest(
      "newAccount",
      buildAccountParams(form),
    );
    const companyId = accountResult?.id;

    if (!companyId) {
      throw new Error("Nao foi possivel obter o id da company criada.");
    }

    const contactResult = await nutshellRequest(
      "newContact",
      buildContactParams(form, Number(companyId)),
    );
    const contactId = contactResult?.id;

    if (!contactId) {
      throw new Error("Nao foi possivel obter o id do contact criado.");
    }

    const leadResult = await nutshellRequest(
      "newLead",
      buildLeadParams(form, Number(companyId), Number(contactId)),
    );
    const leadId = leadResult?.id;

    if (!leadId) {
      throw new Error("Nao foi possivel obter o id da lead criada.");
    }

    return res.status(200).json({
      success: true,
      companyId,
      contactId,
      leadId,
      accountResult,
      contactResult,
      leadResult,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || "Erro ao executar fluxo de criação na Nutshell.",
    });
  }
}
