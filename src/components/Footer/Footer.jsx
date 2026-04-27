// ============================================================
//  Footer.jsx — Pie de página
//  JVSoftware — Protocolo 4.2 (Premium & Branded)
// ============================================================

import styles from './Footer.module.css';

const YEAR = new Date().getFullYear();

// Links de navegación principal
const LINKS = [
    { label: 'Servicios',  href: '#servicios'  },
    { label: 'Portafolio', href: '#portafolio' },
    { label: 'Contacto',   href: '#contacto'   },
];

// Configuración de Redes Sociales
const SOCIAL = [
    { 
        label: 'Facebook', 
        href: 'https://www.facebook.com/profile.php?id=61570707803890',
        // Icono SVG de Facebook
        icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    },
    { 
        label: 'Instagram', 
        href: 'https://www.instagram.com/_jvsoftware_/',
        // Icono SVG de Instagram
        icon: (
            <>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </>
        )
    },
];

export default function Footer() {
    // Función para scroll suave
    const handleNav = (e, href) => {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <footer className={styles.footer}>
            <div className="container">

                <div className={styles.top}>
                    {/* Marca con Logo Oficial PNG (Consistencia con Navbar) */}
                    <div className={styles.brand}>
                        <div className={styles.logoWrapper}>
                            <img
                                src="/logo.png"
                                alt="JVSoftware Logo"
                                className={styles.logoImg}
                                width="44"
                                height="44"
                                loading="lazy"
                            />
                        </div>
                        <div className={styles.brandText}>
                            <span className={styles.brandName}>JVSoftware</span>
                            <span className={styles.brandTagline}>
                                Sistemas que hacen crecer tu negocio
                            </span>
                        </div>
                    </div>

                    {/* Links de Navegación */}
                    <nav aria-label="Links del footer" className={styles.nav}>
                        <ul className={styles.links} role="list">
                            {LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <a
                                        href={href}
                                        className={styles.link}
                                        onClick={(e) => handleNav(e, href)}
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Redes Sociales e Interacción */}
                    <div className={styles.actions}>
                        <div className={styles.social}>
                            {SOCIAL.map((s) => (
                                <a 
                                    key={s.label}
                                    href={s.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.socialIcon}
                                    aria-label={s.label}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {s.icon}
                                    </svg>
                                </a>
                            ))}
                        </div>

                        {/* CTA WhatsApp con efecto premium */}
                        <a
                            href="https://wa.me/59174328155?text=Hola%2C%20me%20interesa%20conocer%20sus%20servicios"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsapp}
                            aria-label="Contactar por WhatsApp"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                        </a>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copy}>
                        © {YEAR} JVSoftware. Hecho con ☕ y código limpio en Bolivia.
                    </p>
                    <div className={styles.legal}>
                        <span className={styles.credit}>Estrategia y Desarrollo Premium</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}