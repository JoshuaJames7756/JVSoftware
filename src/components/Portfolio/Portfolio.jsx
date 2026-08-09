// ============================================================
//  Portfolio.jsx — Portafolio dinámico mejorado
//  Fetch desde /api/projects — datos reales desde Neon
// ============================================================

import { useState, useEffect } from 'react';
import styles from './Portfolio.module.css';

function ProjectCard({ project }) {
    // Desestructuración con valores por defecto para evitar errores de renderizado
    const { 
        titulo = "Proyecto", 
        descripcion_corta = "", 
        problema_resuelto = "", 
        url_imagen = "", 
        tecnologias = [] 
    } = project;

    return (
        <article className={styles.card}>
            {/* Imagen con Overlay mejorado */}
            <div className={styles.imageWrap}>
                <img
                    src={url_imagen}
                    alt={`Proyecto ${titulo}`}
                    className={styles.image}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = `https://placehold.co/600x360/18251D/B7FF72?text=${encodeURIComponent(titulo)}`;
                    }}
                />
                <div className={styles.imageOverlay} aria-hidden="true" />
            </div>

            {/* Contenido */}
            <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{titulo}</h3>
                <p className={styles.cardDesc}>{descripcion_corta}</p>

                {/* Problema → Solución (Truncado inteligente) */}
                <div className={styles.problem}>
                    <span className={styles.problemLabel}>Problema resuelto</span>
                    <p className={styles.problemText}>
                        {problema_resuelto.length > 140
                            ? problema_resuelto.slice(0, 140) + '...'
                            : problema_resuelto
                        }
                    </p>
                </div>

                {/* Tecnologías con diseño premium */}
                <div className={styles.tags} role="list" aria-label="Tecnologías usadas">
                    {tecnologias.map((tech) => (
                        <span key={tech} className={styles.tag} role="listitem">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </article>
    );
}

function SkeletonCard() {
    return (
        <div className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div className={styles.skeletonLine} style={{ width: '90%' }} />
                <div className={styles.skeletonLine} style={{ width: '75%' }} />
            </div>
        </div>
    );
}

export default function Portfolio() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects', { signal: controller.signal });
                if (!res.ok) throw new Error(`Error ${res.status}`);
                
                const result = await res.json();
                // Mejora: Validación de que los datos vengan en el formato esperado
                const dataArray = Array.isArray(result) ? result : result.data;
                setProjects(dataArray || []);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError('No se pudieron cargar los proyectos. Intenta de nuevo.');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
        return () => controller.abort();
    }, []);

    return (
        <section id="portafolio" className={`section section--dark ${styles.portfolio}`}>
            <div className="container">

                {/* Encabezado */}
                <div className={styles.header}>
                    <span className={`badge ${styles.badgeDark}`}>Proyectos reales</span>
                    <h2 className={styles.title}>
                        Negocios que ya trabajan<br />
                        <span className={styles.titleAccent}>con sistemas propios</span>
                    </h2>
                    <p className={styles.subtitle}>
                        Cada proyecto nació de un problema concreto. Aquí ves qué tenían,
                        qué construimos y cómo cambió su operación.
                    </p>
                </div>

                {/* Estados de la UI */}
                {loading && (
                    <div className={styles.grid} aria-busy="true" aria-label="Cargando proyectos">
                        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {error && (
                    <div className={styles.errorState} role="alert">
                        <span style={{ fontSize: '2rem' }}>⚠️</span>
                        <p>{error}</p>
                        <button
                            className="btn btn--outline"
                            onClick={() => { setError(null); setLoading(true); }}
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && projects.length === 0 && (
                    <p className={styles.emptyState}>Proyectos próximamente.</p>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className={styles.grid}>
                        {projects.map((p) => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}