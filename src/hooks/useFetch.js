// ============================================================
//  hooks/useFetch.js — Hook genérico para fetch de datos
//  JVSoftware — Protocolo 4.2
//
//  USO:
//    const { data, loading, error, refetch } = useFetch('/api/projects');
//
//  CON OPCIONES:
//    const { data } = useFetch('/api/projects', {
//        transform: (res) => res.data,  // transformar la respuesta
//        deps: [filtro],                // re-ejecutar cuando cambien
//        skip: !userId,                 // no ejecutar si condición es false
//    });
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param {string} url - Endpoint a consumir
 * @param {object} options
 * @param {function} [options.transform]  - Función para transformar la respuesta JSON
 * @param {any[]}    [options.deps=[]]    - Dependencias que disparan un nuevo fetch
 * @param {boolean}  [options.skip=false] - Si true, no ejecuta el fetch
 * @param {object}   [options.fetchOpts]  - Opciones nativas del fetch (headers, etc.)
 */
export function useFetch(url, options = {}) {
    const {
        transform   = (res) => res,
        deps        = [],
        skip        = false,
        fetchOpts   = {},
    } = options;

    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error,   setError]   = useState(null);

    // Ref para evitar state updates en componentes desmontados
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const execute = useCallback(async (signal) => {
        if (skip || !url) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url, { ...fetchOpts, signal });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${res.status}: ${res.statusText}`);
            }

            const json        = await res.json();
            const transformed = transform(json);

            if (mountedRef.current) {
                setData(transformed);
            }
        } catch (err) {
            if (err.name === 'AbortError') return; // fetch cancelado — no es un error real
            if (mountedRef.current) {
                setError(err.message || 'Error desconocido.');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, skip, ...deps]);

    useEffect(() => {
        const controller = new AbortController();
        execute(controller.signal);
        return () => controller.abort();
    }, [execute]);

    // refetch manual — útil para botones "Actualizar"
    const refetch = useCallback(() => {
        const controller = new AbortController();
        execute(controller.signal);
    }, [execute]);

    return { data, loading, error, refetch };
}