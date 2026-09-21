import { useEffect } from "react";

export default function HealthCheck() {
  useEffect(() => {
    const checkHealth = () => {
      fetch(
        "https://616c-2001-8a0-7c07-8900-2189-2f6c-747e-2207.ngrok-free.app/health",
      )
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
