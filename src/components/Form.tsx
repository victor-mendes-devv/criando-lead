import React, { useState } from "react";
import { createLeadFlow } from "../services/api";
import {
  FATURAMENTO_OPTIONS,
  VENDE_NO_ML_OPTIONS,
} from "../constants/leadOptions";

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  faturamento: string;
  vende_no_ml: string;
}

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));

  return match ? decodeURIComponent(match[2]) : "";
};

const LeadForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    faturamento: "",
    vende_no_ml: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatusMessage("");

    if (
      !form.nome.trim() ||
      !form.email.trim() ||
      !form.telefone.trim() ||
      !form.empresa.trim() ||
      !form.faturamento.trim() ||
      !form.vende_no_ml.trim()
    ) {
      setStatusMessage("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        ...form,
        user_agent: navigator.userAgent,
        _fbc: getCookie("_fbc"),
        _fbp: getCookie("_fbp"),
      };

      const result = await createLeadFlow(payload);

      setStatusMessage(
        `Fluxo concluído com sucesso. Company ID: ${result.companyId} | Contact ID: ${result.contactId} | Lead ID: ${result.leadId}`,
      );

      setForm({
        nome: "",
        email: "",
        telefone: "",
        empresa: "",
        faturamento: "",
        vende_no_ml: "",
      });
    } catch (error: any) {
      const message =
        error?.message ||
        error?.error?.message ||
        JSON.stringify(error) ||
        "Erro ao criar lead";

      setStatusMessage(`Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">
          Formulário - Criação de Lead na Nutshell
        </h2>

        <p className="text-sm text-purple-300 mb-4">
          Este formulário cria Company, Contact e Lead em sequência.
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

        <label className="text-yellow-400">Já vende no ML?</label>
        <select
          name="vende_no_ml"
          value={form.vende_no_ml}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-700 bg-gray-900 text-purple-300 border-purple-700"
        >
          <option value="">Selecione uma opção</option>
          {VENDE_NO_ML_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 bg-purple-700 hover:bg-yellow-400 hover:text-gray-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition mx-auto w-1/2"
        >
          {isLoading ? "Enviando..." : "Criar lead"}
        </button>
      </form>

      {statusMessage && (
        <div className="mt-6 border border-green-700 bg-green-900/20 rounded-lg p-4 text-green-300 whitespace-pre-wrap">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default LeadForm;
