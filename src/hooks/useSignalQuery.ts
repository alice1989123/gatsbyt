// hooks/useSignalQuery.ts
import { useEffect, useState } from 'react';

export const useSignalQuery = (query: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/proxy?resource=predictions_results&query=${query}`)
      .then(res => { console.log(res); return res.json()})
      .then(setData)
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [query]);

  return { data, loading, error };
};





