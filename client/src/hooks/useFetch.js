import { useState, useEffect } from 'react';

export const useFetch = (fn, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fn()
            .then(res => {
                if (isMounted) {
                    // Assuming standard response structure { success: true, data: ... }
                    // If res.data exists, use it. If res is the data, use res.
                    // Based on my controllers/services, res.data is the payload.
                    setData(res.data); 
                    setError(null);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError(err);
                    console.error("Fetch error:", err);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

    return { data, loading, error };
};
