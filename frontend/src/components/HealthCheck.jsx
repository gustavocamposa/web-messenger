import { useEffect } from "react";
import { API_URL } from "../config";

export default function HealthCheck() {
  useEffect(() => {
    const checkHealth = () => {
      fetch(`${API_URL}/health`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Health Check:", data);
        });
    };

    checkHealth();

    const interval = setInterval(checkHealth, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
