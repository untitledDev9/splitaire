const API_BASE_URL = 'https://splitaire-backend.vercel.app/api';
const config = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};
export default config;