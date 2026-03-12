import { useState } from "react";
import LeadForm from "./components/Form";
import { createLead } from "./services/api";

function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (lead: any) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await createLead(lead);
      setSuccess("Lead criada com sucesso!");
    } catch (err: any) {
      setError("Erro ao criar lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Criar Lead</h1>
        <LeadForm onSubmit={handleSubmit} />
        {loading && <p className="text-blue-500 mt-4">Enviando...</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default App;
