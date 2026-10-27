// Em produção, defina VITE_API_URL com o endereço do backend (ex.: https://meu-backend.onrender.com).
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

// http -> ws e https -> wss
export const WS_URL = API_URL.replace(/^http/, "ws");
