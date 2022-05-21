import { useEffect, useRef, useState } from "react";

import axios, { AxiosError } from "axios";

// API configuration.
const baseApiUrl: string = process.env.REACT_APP_API_ADDRESS + '/api';

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

    const send = (data?: any) => {
        setData(null);
        setLoaded(false);
        setError("");

        (async () => {
            try {
                const response = await axios.request({
                    data: data ?? payload,
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
    }

    return { send, cancel, data, error, loaded };
}

export { HttpMethod, useHttp };