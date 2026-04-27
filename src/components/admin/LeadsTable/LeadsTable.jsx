// ============================================================
//  LeadsTable.jsx — Tabla de leads para el admin
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import styles from './LeadsTable.module.css';

const TIPO_LABELS = {
    inventario: 'Inventario',
    catalogo:   'Catálogo',
    pos:        'POS / Ventas',
    tienda:     'Tienda online',
    gestion:    'Gestión',
    otro:       'Otro',
};

function formatFecha(isoStr) {
    return new Date(isoStr).toLocaleString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function LeadsTable() {
    const { getToken } = useAuth();
    const [leads,    setLeads]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [expanded, setExpanded] = useState(null); // id del lead expandido
    const [meta,     setMeta]     = useState({});

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const res   = await fetch('/api/leads', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const { data, meta } = await res.json();
            setLeads(data);
            setMeta(meta);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    const marcarLeido = async (id) => {
        try {
            const token = await getToken();
            await fetch(`/api/leads?id=${id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeads(prev =>
                prev.map(l => l.id === id ? { ...l, leido: true } : l)
            );
        } catch { /* silencioso */ }
    };

    if (loading) return (
        <div className={styles.state} role="status">
            <div className={styles.spinner} aria-hidden="true" />
            <p>Cargando mensajes…</p>
        </div>
    );

    if (error) return (
        <div className={styles.state} role="alert">
            <p className={styles.errorMsg}>Error: {error}</p>
            <button className="btn btn--outline" onClick={fetchLeads}>Reintentar</button>
        </div>
    );

    return (
        <div className={styles.wrap}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Mensajes entrantes</h2>
                    <p className={styles.subtitle}>
                        {meta.total ?? 0} mensajes totales ·{' '}
                        <strong className={styles.unread}>{meta.sin_leer ?? 0} sin leer</strong>
                    </p>
                </div>
                <button className="btn btn--outline" onClick={fetchLeads}>
                    ↻ Actualizar
                </button>
            </div>

            {leads.length === 0 ? (
                <p className={styles.empty}>No hay mensajes aún.</p>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Interés</th>
                                <th>Fecha</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <>
                                    <tr
                                        key={lead.id}
                                        className={`${styles.row} ${!lead.leido ? styles.rowUnread : ''}`}
                                        onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                                        aria-expanded={expanded === lead.id}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>
                                            <span className={`${styles.dot} ${!lead.leido ? styles.dotUnread : styles.dotRead}`} aria-label={lead.leido ? 'Leído' : 'Sin leer'} />
                                        </td>
                                        <td className={styles.nameCell}>{lead.nombre}</td>
                                        <td>
                                            <a href={`mailto:${lead.email}`} className={styles.emailLink} onClick={e => e.stopPropagation()}>
                                                {lead.email}
                                            </a>
                                        </td>
                                        <td>
                                            <span className={styles.tipoBadge}>
                                                {TIPO_LABELS[lead.tipo_problema] ?? lead.tipo_problema}
                                            </span>
                                        </td>
                                        <td className={styles.fecha}>{formatFecha(lead.fecha)}</td>
                                        <td>
                                            {!lead.leido && (
                                                <button
                                                    className={styles.markBtn}
                                                    onClick={(e) => { e.stopPropagation(); marcarLeido(lead.id); }}
                                                    aria-label="Marcar como leído"
                                                >
                                                    ✓ Leído
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Fila expandida con mensaje */}
                                    {expanded === lead.id && (
                                        <tr key={`${lead.id}-detail`} className={styles.detailRow}>
                                            <td colSpan={6}>
                                                <div className={styles.detail}>
                                                    <p className={styles.detailLabel}>Mensaje:</p>
                                                    <p className={styles.detailMsg}>
                                                        {lead.mensaje || <em>Sin mensaje adicional.</em>}
                                                    </p>
                                                    {lead.fuente && (
                                                        <p className={styles.detailFuente}>
                                                            Fuente: <span>{lead.fuente}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}