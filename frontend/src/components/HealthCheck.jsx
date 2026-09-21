import { useEffect } from "react";

export default function HealthCheck() {
  useEffect(() => {
    const checkHealth = () => {
      fetch("http://localhost:3000/health")
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
