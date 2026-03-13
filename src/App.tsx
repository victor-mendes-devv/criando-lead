import { useEffect } from "react";
import LeadForm from "./components/Form";

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const hasSourceId = params.has("sourceId");
    const hasCampaign = params.has("campaign");

    if (!hasSourceId || !hasCampaign) {
      params.set("sourceId", "1275");
      params.set("campaign", "form_teste");

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen py-10">
      <LeadForm />
    </div>
  );
}

export default App;
