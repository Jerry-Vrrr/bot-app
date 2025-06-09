import { useState, useEffect } from "react";

const useAutoResetError = (timeout: number = 3000) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [error, timeout]);

  return { error, setError };
};

export default useAutoResetError;
