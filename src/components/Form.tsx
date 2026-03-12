import React, { useMemo, useState } from "react";

interface LeadFormProps {
  onSubmit?: (data: any) => void;
}

// em um projeto real, esses tipos seriam mais detalhados e provavelmente importados de um arquivo de tipos específico para a API da Nutshell
interface ProductItem {
  id: number;
  label: string;
}
interface CompetitorItem {
  id: number;
  label: string;
}

interface LeadFormState {
  dueTime: string;
  tags: string;
  description: string;
  confidence: number;
  customTracking: string;
  customDiscountCurrency: string;
  customDiscountAmount: string;
  note: string;
  priority: number;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<LeadFormState>({
    dueTime: "",
    tags: "",
    description: "",
    confidence: 50,
    customTracking: "32ab",
    customDiscountCurrency: "BRL",
    customDiscountAmount: "",
    note: "",
    priority: 0,
  });

  const [productInput, setProductInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "confidence" || name === "priority") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addProduct = () => {
    const value = productInput.trim();

    if (!value) return;

    setProducts((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        label: value,
      },
    ]);

    setProductInput("");
  };

  const addCompetitor = () => {
    const value = competitorInput.trim();

    if (!value) return;

    setCompetitors((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        label: value,
      },
    ]);

    setCompetitorInput("");
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const removeCompetitor = (id: number) => {
    setCompetitors((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProductKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProduct();
    }
  };

  const handleCompetitorKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCompetitor();
    }
  };

  const formatDateOnlyToIsoMidnight = (value: string) => {
    if (!value) return "";

    return `${value}T00:00:00`;
  };

  const getTodayAtMidnight = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}T00:00:00`;
  };

  const buildLeadPayload = () => {
    const createdTime = getTodayAtMidnight();

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const notes = form.note
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: any = {
      // MOCK: conta principal fixa para simular uma account já existente na Nutshell
      primaryAccount: { id: 1001 },

      // createdTime gerado automaticamente com hora fixa 00:00:00
      createdTime,

      // dueTime vindo do formulário com hora fixa 00:00:00
      dueTime: form.dueTime
        ? formatDateOnlyToIsoMidnight(form.dueTime)
        : undefined,

      // MOCK: mercado fixo apenas para treino da estrutura esperada pela API
      market: { id: 1 },

      tags,
      description: form.description,

      // MOCK: contas relacionadas fixas para simular vínculos adicionais
      accounts: [{ id: 1001 }, { id: 1002 }],

      // MOCK: contatos fixos para simular contatos já existentes
      contacts: [{ id: 501 }, { id: 502 }],

      // Produtos montados a partir de uma UI simples, mas respeitando a estrutura da API
      products: products.map((product) => ({
        id: product.id,
        relationship: `Produto informado no formulário: ${product.label}`,
        quantity: 1,
        price: {
          currency_shortname: "BRL",
          amount: "100",
        },
      })),

      // Concorrentes montados a partir de uma UI simples, respeitando a estrutura da API
      competitors: competitors.map((competitor) => ({
        id: competitor.id,
        status: 0,
        relationship: `Concorrente informado no formulário: ${competitor.label}`,
      })),

      // MOCK: source fixa para demonstrar como a API espera esse campo
      sources: [{ id: 12 }],

      confidence: Number(form.confidence),

      // MOCK: assignee fixo para simular responsável vindo de regra de negócio
      assignee: {
        entityType: "Users",
        id: 12,
      },

      customFields: {
        "Tracking #": form.customTracking,
        Discount: {
          currency_shortname: form.customDiscountCurrency || "BRL",
          amount: form.customDiscountAmount || "0",
        },
      },

      note: notes,
      priority: Number(form.priority),

      // Fixos no código para simular entrada no começo do funil
      milestoneId: 1,
      stagesetId: 1,
    };

    if (!payload.dueTime) {
      delete payload.dueTime;
    }

    if (!payload.tags.length) {
      delete payload.tags;
    }

    if (!payload.description.trim()) {
      delete payload.description;
    }

    if (!payload.products.length) {
      delete payload.products;
    }

    if (!payload.competitors.length) {
      delete payload.competitors;
    }

    if (!payload.note.length) {
      delete payload.note;
    }

    if (!form.customTracking && !form.customDiscountAmount) {
      delete payload.customFields;
    }

    return payload;
  };

  const previewPayload = useMemo(
    () => ({
      lead: buildLeadPayload(),
    }),
    [form, products, competitors],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lead = buildLeadPayload();

    if (onSubmit) onSubmit(lead);
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">
          Formulário de Lead - Treino Nutshell
        </h2>

        <p className="text-sm text-purple-300 mb-4">
          Alguns campos estão mockados no código para fins de estudo da API.
        </p>

        <label className="text-yellow-400">
          Data de Vencimento{" "}
          <span className="text-xs text-purple-300">(opcional)</span>
        </label>
        <input
          type="date"
          name="dueTime"
          value={form.dueTime}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">
          Tags{" "}
          <span className="text-xs text-purple-300">
            (separadas por vírgula)
          </span>
        </label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="ex: lead quente, inbound, campanha x"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Confiança</label>
        <input
          name="confidence"
          type="number"
          min={0}
          max={100}
          value={form.confidence}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">
          Prioridade{" "}
          <span className="text-xs text-purple-300">
            (0 = normal, 1 = hot lead)
          </span>
        </label>
        <input
          name="priority"
          type="number"
          min={0}
          max={1}
          value={form.priority}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Tracking #</label>
        <input
          name="customTracking"
          value={form.customTracking}
          onChange={handleChange}
          placeholder="ex: 32ab"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Moeda do Desconto</label>
        <input
          name="customDiscountCurrency"
          value={form.customDiscountCurrency}
          onChange={handleChange}
          placeholder="ex: BRL"
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">Valor do Desconto</label>
        <div className="flex items-center border rounded-md w-full focus-within:ring-2 focus-within:ring-purple-700 bg-gray-900 border-purple-700 overflow-hidden">
          <span className="px-3 text-purple-300 bg-gray-800 border-r border-purple-700">
            R$
          </span>
          <input
            name="customDiscountAmount"
            value={form.customDiscountAmount}
            onChange={handleChange}
            placeholder="ex: 5000"
            className="px-3 py-2 w-full focus:outline-none bg-gray-900 text-purple-300"
          />
        </div>

        <label className="text-yellow-400">Descrição</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <label className="text-yellow-400">
          Notas <span className="text-xs text-purple-300">(uma por linha)</span>
        </label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />

        <div className="mt-4">
          <label className="text-yellow-400 block mb-2">Produtos</label>

          <div className="flex gap-2">
            <input
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={handleProductKeyDown}
              placeholder="Digite um produto e pressione Enter"
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
            />
            <button
              type="button"
              onClick={addProduct}
              className="bg-purple-700 hover:bg-yellow-400 hover:text-gray-900 text-white font-bold px-4 rounded-lg transition"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 bg-purple-800 text-yellow-300 px-3 py-2 rounded-full"
              >
                <span>{product.label}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="text-xs font-bold hover:text-white"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-yellow-400 block mb-2">Concorrentes</label>

          <div className="flex gap-2">
            <input
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={handleCompetitorKeyDown}
              placeholder="Digite um concorrente e pressione Enter"
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
            />
            <button
              type="button"
              onClick={addCompetitor}
              className="bg-purple-700 hover:bg-yellow-400 hover:text-gray-900 text-white font-bold px-4 rounded-lg transition"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="flex items-center gap-2 bg-purple-800 text-yellow-300 px-3 py-2 rounded-full"
              >
                <span>{competitor.label}</span>
                <button
                  type="button"
                  onClick={() => removeCompetitor(competitor.id)}
                  className="text-xs font-bold hover:text-white"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 bg-purple-700 hover:bg-yellow-400 hover:text-gray-900 hover:cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition mx-auto w-1/2"
        >
          Enviar
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">
          Preview do payload final
        </h3>

        <pre className="bg-black/40 border border-purple-700 rounded-lg p-4 text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(previewPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LeadForm;
