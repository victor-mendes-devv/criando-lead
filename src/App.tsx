import { useState } from "react";
import LeadForm from "./components/Form";
import { createLeadFlow } from "./services/api";

function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (lead: any) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await createLeadFlow(lead);
      setSuccess("Lead criada com sucesso!");
    } catch (err: any) {
      setError("Erro ao criar lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900">
      <LeadForm onSubmit={handleSubmit} />
      {loading && <p className="text-blue-500 mt-4">Enviando...</p>}
      {success && <p className="text-green-600 mt-4">{success}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}

export default App;
