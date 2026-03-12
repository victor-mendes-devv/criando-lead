import axios from "axios";

const API_URL = import.meta.env.VITE_NUTSHELL_API_URL;
const API_USERNAME = import.meta.env.VITE_NUTSHELL_USERNAME;
const API_PASSWORD = import.meta.env.VITE_NUTSHELL_PASSWORD;
const API_METHOD = import.meta.env.VITE_NUTSHELL_METHOD || "newLead";
const API_REQUEST_ID = import.meta.env.VITE_NUTSHELL_REQUEST_ID || "apeye";

if (!API_URL) {
  throw new Error("VITE_NUTSHELL_API_URL nao foi definida no .env");
}

if (!API_USERNAME) {
  throw new Error("VITE_NUTSHELL_USERNAME nao foi definida no .env");
}

if (!API_PASSWORD) {
  throw new Error("VITE_NUTSHELL_PASSWORD nao foi definida no .env");
}

const basicAuth = btoa(`${API_USERNAME}:${API_PASSWORD}`);

export const createLead = async (lead: Record<string, any>) => {
  console.log(lead);
  try {
    const response = await axios.post(
      API_URL,
      {
        jsonrpc: "2.0",
        method: API_METHOD,
        id: API_REQUEST_ID,
        params: {
          lead,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Erro completo Nutshell:", error);

    if (error.response?.data) {
      throw error.response.data;
    }

    throw new Error(error.message || "Erro ao criar lead na Nutshell");
  }
};
