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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        name="primaryAccountId"
        placeholder="ID da Conta Principal"
        value={form.primaryAccountId}
        onChange={handleChange}
        className="input"
      />
      <input
        name="createdTime"
        placeholder="Data de Criação (YYYY-MM-DDTHH:mm:ss±hh:mm)"
        value={form.createdTime}
        onChange={handleChange}
        className="input"
      />
      <input
        name="dueTime"
        placeholder="Data de Vencimento (YYYY-MM-DDTHH:mm:ss±hh:mm)"
        value={form.dueTime}
        onChange={handleChange}
        className="input"
      />
      <input
        name="marketId"
        placeholder="ID do Mercado"
        value={form.marketId}
        onChange={handleChange}
        className="input"
      />
      <input
        name="tags"
        placeholder="Tags (separadas por vírgula)"
        value={form.tags}
        onChange={handleChange}
        className="input"
      />
      <input
        name="accounts"
        placeholder="IDs de Contas (separados por vírgula)"
        value={form.accounts}
        onChange={handleChange}
        className="input"
      />
      <input
        name="contacts"
        placeholder="IDs de Contatos (separados por vírgula)"
        value={form.contacts}
        onChange={handleChange}
        className="input"
      />
      <input
        name="sources"
        placeholder="IDs de Fontes (separados por vírgula)"
        value={form.sources}
        onChange={handleChange}
        className="input"
      />
      <input
        name="confidence"
        type="number"
        placeholder="Confiança"
        value={form.confidence}
        onChange={handleChange}
        className="input"
      />
      <input
        name="assigneeId"
        placeholder="ID do Responsável"
        value={form.assigneeId}
        onChange={handleChange}
        className="input"
      />
      <input
        name="customTracking"
        placeholder="Tracking #"
        value={form.customTracking}
        onChange={handleChange}
        className="input"
      />
      <input
        name="customDiscountCurrency"
        placeholder="Moeda do Desconto"
        value={form.customDiscountCurrency}
        onChange={handleChange}
        className="input"
      />
      <input
        name="customDiscountAmount"
        placeholder="Valor do Desconto"
        value={form.customDiscountAmount}
        onChange={handleChange}
        className="input"
      />
      <input
        name="priority"
        type="number"
        placeholder="Prioridade"
        value={form.priority}
        onChange={handleChange}
        className="input"
      />
      <textarea
        name="description"
        placeholder="Descrição"
        value={form.description}
        onChange={handleChange}
        className="input h-20"
      />
      <textarea
        name="note"
        placeholder="Notas (uma por linha)"
        value={form.note}
        onChange={handleChange}
        className="input h-20"
      />
      <textarea
        name="products"
        placeholder="Produtos (JSON array)"
        value={form.products}
        onChange={handleChange}
        className="input h-20"
      />
      <textarea
        name="competitors"
        placeholder="Concorrentes (JSON array)"
        value={form.competitors}
        onChange={handleChange}
        className="input h-20"
      />
      <button
        type="submit"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
      >
        Criar Lead
      </button>
    </form>
  );
};

export default LeadForm;
