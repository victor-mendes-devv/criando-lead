import React, { useState } from "react";

interface LeadFormProps {
  onSubmit?: (data: any) => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState({
    primaryAccountId: "",
    createdTime: "",
    dueTime: "",
    marketId: "",
    tags: "",
    description: "",
    accounts: "",
    contacts: "",
    products: "",
    competitors: "",
    sources: "",
    confidence: 50,
    assigneeId: "",
    customTracking: "",
    customDiscountCurrency: "",
    customDiscountAmount: "",
    note: "",
    priority: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = {
      primaryAccount: { id: form.primaryAccountId },
      createdTime: form.createdTime,
      dueTime: form.dueTime,
      market: { id: form.marketId },
      tags: form.tags.split(","),
      description: form.description,
      accounts: form.accounts
        .split(",")
        .map((id) => ({ id: Number(id.trim()) })),
      contacts: form.contacts
        .split(",")
        .map((id) => ({ id: Number(id.trim()) })),
      products: form.products ? JSON.parse(form.products) : [],
      competitors: form.competitors ? JSON.parse(form.competitors) : [],
      sources: form.sources.split(",").map((id) => ({ id: Number(id.trim()) })),
      confidence: Number(form.confidence),
      assignee: { entityType: "Users", id: Number(form.assigneeId) },
      customFields: {
        "Tracking #": form.customTracking,
        Discount: {
          currency_shortname: form.customDiscountCurrency,
          amount: form.customDiscountAmount,
        },
      },
      note: form.note.split("\n"),
      priority: Number(form.priority),
    };
    if (onSubmit) onSubmit(lead);
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-yellow-400">ID da Conta Principal</label>
        <input
          name="primaryAccountId"
          value={form.primaryAccountId}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">
          Data de Criação{" "}
          <span className="text-xs text-purple-300">
            (YYYY-MM-DDTHH:mm:ss±hh:mm)
          </span>
        </label>
        <input
          name="createdTime"
          value={form.createdTime}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">
          Data de Vencimento{" "}
          <span className="text-xs text-purple-300">
            (YYYY-MM-DDTHH:mm:ss±hh:mm)
          </span>
        </label>
        <input
          name="dueTime"
          value={form.dueTime}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">ID do Mercado</label>
        <input
          name="marketId"
          value={form.marketId}
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
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">
          IDs de Contas{" "}
          <span className="text-xs text-purple-300">
            (separados por vírgula)
          </span>
        </label>
        <input
          name="accounts"
          value={form.accounts}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">
          IDs de Contatos{" "}
          <span className="text-xs text-purple-300">
            (separados por vírgula)
          </span>
        </label>
        <input
          name="contacts"
          value={form.contacts}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">
          IDs de Fontes{" "}
          <span className="text-xs text-purple-300">
            (separados por vírgula)
          </span>
        </label>
        <input
          name="sources"
          value={form.sources}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">Confiança</label>
        <input
          name="confidence"
          type="number"
          value={form.confidence}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">ID do Responsável</label>
        <input
          name="assigneeId"
          value={form.assigneeId}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">Tracking #</label>
        <input
          name="customTracking"
          value={form.customTracking}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">Moeda do Desconto</label>
        <input
          name="customDiscountCurrency"
          value={form.customDiscountCurrency}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">Valor do Desconto</label>
        <input
          name="customDiscountAmount"
          value={form.customDiscountAmount}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">Prioridade</label>
        <input
          name="priority"
          type="number"
          value={form.priority}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        />
        <label className="text-yellow-400">Descrição</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full h-20 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-yellow-400 border-purple-700"
        />
        <label className="text-yellow-400">
          Notas <span className="text-xs text-purple-300">(uma por linha)</span>
        </label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full h-20 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-yellow-400 border-purple-700"
        />
        <label className="text-yellow-400">
          Produtos <span className="text-xs text-purple-300">(JSON array)</span>
        </label>
        <textarea
          name="products"
          value={form.products}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full h-20 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-yellow-400 border-purple-700"
        />
        <label className="text-yellow-400">
          Concorrentes{" "}
          <span className="text-xs text-purple-300">(JSON array)</span>
        </label>
        <textarea
          name="competitors"
          value={form.competitors}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full h-20 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-yellow-400 border-purple-700"
        />
        <button
          type="submit"
          className="mt-6 bg-purple-700 hover:bg-yellow-400 hover:text-gray-900 hover:cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition mx-auto w-1/2"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default LeadForm;
