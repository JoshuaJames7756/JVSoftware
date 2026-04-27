// ============================================================
//  Hero.jsx — Sección Hero Principal
//  JVSoftware — Protocolo 4.2
//  Copywriting orientado a dueños de negocios
// ============================================================

import styles from './Hero.module.css';

export default function Hero() {
    const handleCTA = () => {
        const contacto = document.getElementById('contacto');
        if (contacto) {
            contacto.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section className={styles.hero} aria-label="Sección principal JVSoftware">

            {/* Fondo decorativo — puntos y gradiente sutil */}
            <div className={styles.bg} aria-hidden="true">
                <div className={styles.bgDots} />
                <div className={styles.bgGlow} />
            </div>

            <div className={`container ${styles.content}`}>

                {/* Badge de confianza */}
                <div className={`animate-fade-up ${styles.badge}`}>
                    <span className={styles.badgeDot} aria-hidden="true" />
                    Soluciones digitales para negocios reales
                </div>

                {/* Titular principal */}
                <h1 className={`animate-fade-up delay-1 ${styles.heading}`}>
                    Tu negocio merece{' '}
                    <span className={styles.headingAccent}>trabajar solo</span>{' '}
                    mientras tú descansas
                </h1>

                {/* Subtítulo empático */}
                <p className={`animate-fade-up delay-2 ${styles.subheading}`}>
                    Creamos sistemas digitales que reemplazan el trabajo manual:
                    controla tu inventario desde el celular, recibe pedidos por WhatsApp
                    y sabe exactamente cuánto ganaste hoy — sin contratar más personal.
                </p>

                {/* Social proof rápido */}
                <div className={`animate-fade-up delay-3 ${styles.socialProof}`}>
                    <div className={styles.proofItem}>
                        <span className={styles.proofNumber}>+15</span>
                        <span className={styles.proofLabel}>Negocios sistematizados</span>
                    </div>
                    <div className={styles.proofDivider} aria-hidden="true" />
                    <div className={styles.proofItem}>
                        <span className={styles.proofNumber}>48h</span>
                        <span className={styles.proofLabel}>Tiempo promedio de respuesta</span>
                    </div>
                    <div className={styles.proofDivider} aria-hidden="true" />
                    <div className={styles.proofItem}>
                        <span className={styles.proofNumber}>100%</span>
                        <span className={styles.proofLabel}>Proyectos entregados a tiempo</span>
                    </div>
                </div>

                {/* CTAs */}
                <div className={`animate-fade-up delay-4 ${styles.ctas}`}>
                    <button
                        className={`btn btn--primary ${styles.ctaPrimary}`}
                        onClick={handleCTA}
                        aria-label="Ir al formulario de contacto"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Quiero sistematizar mi negocio
                    </button>

                    <a
                        href="#portafolio"
                        className={`btn btn--outline ${styles.ctaSecondary}`}
                        aria-label="Ver proyectos realizados"
                    >
                        Ver proyectos reales
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>

                {/* Garantía de confianza */}
                <p className={`animate-fade-up delay-5 ${styles.trust}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sin contratos largos · Primera consulta gratis · Soporte incluido
                </p>

            </div>

            {/* Indicador de scroll */}
            <div className={styles.scrollIndicator} aria-hidden="true">
                <div className={styles.scrollLine} />
            </div>

        </section>
    );
}