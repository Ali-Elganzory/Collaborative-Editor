import { useEffect, useRef, useState } from "react";

import axios, { AxiosError } from "axios";

// API configuration.
const baseApiUrl: string = 'http://localhost:8000/api';

enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
};

function useHttp(url: string, method: HttpMethod, payload?: any) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loaded, setLoaded] = useState(false);
    const controllerRef = useRef(new AbortController());

    const cancel = () => {
        controllerRef.current.abort();
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.request({
                    data: payload,
                    signal: controllerRef.current.signal,
                    method: method,
                    url: baseApiUrl + '/editor' + url,
                });
                setData(response.data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoaded(true);
            }
        })();
    }, [
        url,
        method,
        payload,
    ]);

    return { cancel, data, error, loaded };
}

export { HttpMethod, useHttp };