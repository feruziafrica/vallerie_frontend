import { useState, useCallback } from "react";

/**
 * useApi — thin wrapper that adds loading / error / data state
 * around any async function from services/api.js.
 *
 * Usage:
 *   const { execute, loading, error, data } = useApi(submitContact);
 *   await execute({ name, email, service, message });
 *
 * @param {Function} apiFn  - an async function from services/api.js
 * @returns {{ execute, loading, error, data, reset }}
 */
export function useApi(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [data,    setData]    = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message ?? "Something went wrong. Please try again.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}