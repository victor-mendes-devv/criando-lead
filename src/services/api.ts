import axios from 'axios';

const API_URL = 'https://api.nutshell.com/v1/leads'; // Substitua pela URL correta da API Nutshell

export const createLead = async (lead: any) => {
  try {
    const response = await axios.post(API_URL, { lead });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
