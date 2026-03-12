import React, { useMemo, useState } from "react";

interface LeadFormProps {
  onSubmit?: (data: {
    accountRequest: Record<string, any>;
    contactRequest: Record<string, any>;
    leadRequest: Record<string, any>;
  }) => void;
}

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
}

const PIPELINE_ID = 23;
const PRODUCT_ACIMA_50K = 403;
const PRODUCT_MENOS_50K = 407;

const FATURAMENTO_OPTIONS = [
  "- 50MIL",
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
  "ACIMA DE 1 MILHAO",
  "NAO TEM",
];

const FATURAMENTO_ACIMA_50K = [
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
  "ACIMA DE 1 MILHAO",
];

const FATURAMENTO_MENOS_50K = ["- 50MIL", "NAO TEM"];

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    faturamento: "",
  });

  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getLeadAmount = () => {
    return form.faturamento !== "NAO TEM" ? 1 : 2;
  };

  const getLeadProducts = () => {
    if (FATURAMENTO_MENOS_50K.includes(form.faturamento)) {
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

    if (FATURAMENTO_ACIMA_50K.includes(form.faturamento)) {
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

  const buildAccountRequest = () => {
    const payload: Record<string, any> = {
      method: "newAccount",
      params: {
        account: {
          name: form.empresa,
        },
      },
    };

    if (!form.empresa.trim()) {
      delete payload.params.account.name;
    }

    return payload;
  };

  const buildContactRequest = () => {
    const payload: Record<string, any> = {
      method: "newContact",
      params: {
        contact: {
          firstName: form.nome,
          email: form.email.trim() ? [form.email.trim()] : undefined,
          phone: form.telefone.trim() ? [form.telefone.trim()] : undefined,
          accounts: [
            {
              relationship: "Empresa relacionada",
              id: "ID_DA_COMPANY", // Placeholder, deve ser substituído pelo ID real da company criada
            },
          ],
        },
      },
    };

    if (!form.nome.trim()) {
      delete payload.params.contact.firstName;
    }

    if (!form.email.trim()) {
      delete payload.params.contact.email;
    }

    if (!form.telefone.trim()) {
      delete payload.params.contact.phone;
    }

    return payload;
  };

  const buildLeadRequest = () => {
    const products = getLeadProducts();
    const amount = getLeadAmount();

    const payload: Record<string, any> = {
      method: "newLead",
      params: {
        lead: {
          description: form.nome,

          // MOCK: pipeline fixa para estudo
          stagesetId: PIPELINE_ID,

          // MOCK: este campo sera preenchido com o id real da company apos o newAccount
          primaryAccount: {
            id: "ID MOCADO",
          },

          // MOCK: este campo sera preenchido com o id real do contact apos o newContact
          contacts: [
            {
              id: "ID MOCADO",
            },
          ],

          value: {
            currency: "BRL",
            amount,
          },

          products,
        },
      },
    };

    if (!form.nome.trim()) {
      delete payload.params.lead.description;
    }

    if (!products.length) {
      delete payload.params.lead.products;
    }

    return payload;
  };

  const previewPayload = useMemo(
    () => ({
      accountRequest: buildAccountRequest(),
      contactRequest: buildContactRequest(),
      leadRequest: buildLeadRequest(),
    }),
    [form],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payloads = {
      accountRequest: buildAccountRequest(),
      contactRequest: buildContactRequest(),
      leadRequest: buildLeadRequest(),
    };

    if (onSubmit) {
      onSubmit(payloads);
    }

    setStatusMessage(
      "Payloads preparados com sucesso. Os ids reais de company e contact devem ser inseridos na etapa da API, apos a criacao.",
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">
          Formulário de Treino - Fluxo Real Nutshell
        </h2>

        <p className="text-sm text-purple-300 mb-4">
          Este formulário prepara os payloads necessários para criar Company,
          Contact e Lead.
        </p>

        <label className="text-yellow-400">Nome</label>
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Digite o nome do contato"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Digite o email"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Telefone</label>
        <input
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          placeholder="Digite o telefone"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Empresa</label>
        <input
          name="empresa"
          value={form.empresa}
          onChange={handleChange}
          placeholder="Digite o nome da empresa"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Faturamento</label>
        <select
          name="faturamento"
          value={form.faturamento}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        >
          <option value="">Selecione o faturamento</option>
          {FATURAMENTO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="mt-6 bg-purple-700 hover:bg-yellow-400 hover:text-gray-900 hover:cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition mx-auto w-1/2"
        >
          Preparar payloads
        </button>
      </form>

      {statusMessage && (
        <div className="mt-6 border border-green-700 bg-green-900/20 rounded-lg p-4 text-green-300">
          {statusMessage}
        </div>
      )}

      <div className="mt-10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            Preview - newAccount
          </h3>
          <pre className="bg-black/40 border border-purple-700 rounded-lg p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(previewPayload.accountRequest, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            Preview - newContact
          </h3>
          <pre className="bg-black/40 border border-purple-700 rounded-lg p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(previewPayload.contactRequest, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-xl font-bold text-yellow-400 mb-3">
            Preview - newLead
          </h3>
          <pre className="bg-black/40 border border-purple-700 rounded-lg p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(previewPayload.leadRequest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
