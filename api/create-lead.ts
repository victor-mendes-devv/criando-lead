import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "node:crypto";

const API_URL = process.env.NUTSHELL_API_URL;
const API_USERNAME = process.env.NUTSHELL_USERNAME;
const API_PASSWORD = process.env.NUTSHELL_PASSWORD;

const PIPELINE_ID = 23;
const PRODUCT_ACIMA_50K = 403;
const PRODUCT_MENOS_50K = 407;

// Lógica de aprendizado:
// se não houver sourceId e campaign na rota, consideramos que veio da home
const DEFAULT_PAGINA = "home";

const FATURAMENTO_VALIDOS = [
  "- 50MIL",
  "ACIMA DE 1 MILHAO",
  "NAO TEM",
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
];

const VENDE_VALIDOS = ["SIM", "NAO"];

const FATURAMENTO_ACIMA_50K = [
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
  "ACIMA DE 1 MILHAO",
];

const FATURAMENTO_MENOS_50K = ["- 50MIL", "NAO TEM"];

// Round Robin:
// ordem de distribuição da lead
const ROUND_ROBIN_ASSIGNEES = [
  { id: 127, nome: "Sales Ops" },
  { id: 203, nome: "Atendimento Mamba" },
  { id: 27, nome: "Rafael Henriques" },
];

// ATENCAO:
// isso é apenas uma implementação simples em memória.
// Em produção/serverless na Vercel, isso pode resetar.
// O próximo passo ideal é persistir esse índice em KV/Redis/banco.
let roundRobinIndex = 0;

type LeadFormData = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
  vende_no_ml: string;
  user_agent: string;
  _fbc: string;
  _fbp: string;
};

type OriginConfig = {
  useSourceAndCampaign: boolean;
  sourceId: number | null;
  campaign: string | null;
  pagina: string | null;
};

type RoundRobinAssignee = {
  id: number;
  nome: string;
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

function getNextRoundRobinAssignee(): RoundRobinAssignee {
  const currentAssignee = ROUND_ROBIN_ASSIGNEES[roundRobinIndex];

  roundRobinIndex = (roundRobinIndex + 1) % ROUND_ROBIN_ASSIGNEES.length;

  return currentAssignee;
}

function getClientIp(req: VercelRequest) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket?.remoteAddress || "";
}

function hashUserAgent(userAgent: string) {
  if (!userAgent) return "";
  return createHash("sha256").update(userAgent).digest("hex");
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

  const rawText = await response.text();

  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    throw new Error(
      `Resposta inválida da Nutshell. HTTP ${response.status}. Body: ${rawText}`,
    );
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Erro HTTP ${response.status}`);
  }

  if (data?.error) {
    throw new Error(data.error.message || "Erro retornado pela Nutshell.");
  }

  return data?.result;
}

function getSingleQueryParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && value.length > 0 && value[0]?.trim()) {
    return value[0].trim();
  }

  return null;
}

function getOriginConfig(req: VercelRequest): OriginConfig {
  const sourceIdParam = getSingleQueryParam(req.query.sourceId);
  const campaignParam = getSingleQueryParam(req.query.campaign);

  const parsedSourceId = sourceIdParam ? Number(sourceIdParam) : null;
  const hasValidSourceId =
    parsedSourceId !== null && !Number.isNaN(parsedSourceId);
  const hasCampaign = Boolean(campaignParam);

  const useSourceAndCampaign = hasValidSourceId && hasCampaign;

  return {
    useSourceAndCampaign,
    sourceId: useSourceAndCampaign ? parsedSourceId : null,
    campaign: useSourceAndCampaign ? campaignParam : null,
    pagina: useSourceAndCampaign ? null : DEFAULT_PAGINA,
  };
}

function buildAccountParams(
  form: LeadFormData,
  req: VercelRequest,
  originConfig: OriginConfig,
) {
  const clientIp = getClientIp(req);
  const userAgentHash = hashUserAgent(form.user_agent);

  const customFields: Record<string, unknown> = {
    FATURAMENTO2: form.faturamento,
    "JA VENDE NO ML?": form.vende_no_ml,
    "IP do Cliente": clientIp,
    "User Agent": userAgentHash,
    _fbc: form._fbc || "",
    _fbp: form._fbp || "",
  };

  if (originConfig.pagina) {
    customFields.PAGINA = originConfig.pagina;
  }

  return {
    account: {
      name: form.empresa.trim(),
      customFields,
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
  originConfig: OriginConfig,
  assignee: RoundRobinAssignee,
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
    assignee: {
      entityType: "Users",
      id: assignee.id,
    },
    value: {
      currency: "BRL",
      amount,
    },
  };

  if (products.length) {
    lead.products = products;
  }

  if (originConfig.useSourceAndCampaign) {
    lead.sources = [
      {
        id: originConfig.sourceId,
      },
    ];

    lead.customFields = {
      Campaign: originConfig.campaign,
    };
  }

  if (originConfig.pagina) {
    lead.note = [
      `Origem sem source/campaign. Considerado como pagina: ${originConfig.pagina}`,
    ];
  }

  return { lead };
}

function validateForm(form: Partial<LeadFormData>) {
  if (!form.nome?.trim()) return "Nome é obrigatório.";
  if (!form.email?.trim()) return "Email é obrigatório.";
  if (!form.telefone?.trim()) return "Telefone é obrigatório.";
  if (!form.empresa?.trim()) return "Empresa é obrigatória.";
  if (!form.faturamento?.trim()) return "Faturamento é obrigatório.";
  if (!form.vende_no_ml?.trim()) {
    return "O campo 'Já vende no ML?' é obrigatório.";
  }

  if (!FATURAMENTO_VALIDOS.includes(form.faturamento)) {
    return `Valor inválido para FATURAMENTO2: '${form.faturamento}'`;
  }

  if (!VENDE_VALIDOS.includes(form.vende_no_ml)) {
    return `Valor inválido para VENDE2: '${form.vende_no_ml}'`;
  }

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

    const originConfig = getOriginConfig(req);
    const assignee = getNextRoundRobinAssignee();

    const accountResult = await nutshellRequest(
      "newAccount",
      buildAccountParams(form, req, originConfig),
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
      buildLeadParams(
        form,
        Number(companyId),
        Number(contactId),
        originConfig,
        assignee,
      ),
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
      assigneeId: assignee.id,
      assigneeNome: assignee.nome,
      nextRoundRobinIndex: roundRobinIndex,
      originConfig,
      accountResult,
      contactResult,
      leadResult,
    });
  } catch (error: any) {
    console.error("Erro na Vercel Function /api/create-lead:", error);

    return res.status(500).json({
      error: error?.message || "Erro ao executar fluxo de criação na Nutshell.",
    });
  }
}
