// ============================================================
//  hooks/useAdmin.js — Hook para operaciones autenticadas
//  XionTech — Protocolo 4.2
//
//  Envuelve fetch con el token de Clerk automáticamente.
//
//  USO:
//    const { request, loading, error } = useAdmin();
//
//    // GET autenticado
//    const leads = await request('/api/leads');
//
//    // POST autenticado
//    await request('/api/projects', {
//        method: 'POST',
//        body: JSON.stringify(payload),
//    });
// ============================================================

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useAdmin() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    /**
     * Realiza un fetch autenticado con el token de Clerk.
     *
     * @param {string} url
     * @param {RequestInit} [options={}]
     * @returns {Promise<any>} - JSON de la respuesta
     */
    const request = useCallback(async (url, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();

            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Error ${res.status}`);
            }

            return data;
        } catch (err) {
            const msg = err.message || 'Error en la operación.';
            setError(msg);
            throw err; // re-throw para que el componente pueda manejarlo también
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    /** Limpia el error manualmente si el componente lo necesita */
    const clearError = useCallback(() => setError(null), []);

    return { request, loading, error, clearError };
}