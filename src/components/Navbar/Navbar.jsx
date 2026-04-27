// ============================================================
//  Navbar.jsx — con logo PNG original
//  JVSoftware — Protocolo 4.2
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_LINKS = [
    { label: 'Servicios',  href: '#servicios'  },
    { label: 'Portafolio', href: '#portafolio' },
    { label: 'Contacto',   href: '#contacto'   },
];

export default function Navbar() {
    const [scrolled,  setScrolled]  = useState(false);
    const [menuOpen,  setMenuOpen]  = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [location]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setMenuOpen(false);
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <nav className={`container ${styles.inner}`} aria-label="Navegación principal">

                {/* Logo original PNG */}
                <Link to="/" className={styles.logo} aria-label="JVSoftware — inicio">
                    <img
                        src="/logo.png"
                        alt="JVSoftware"
                        className={styles.logoImg}
                        height="48"
                        width="48"
                        loading="eager"
                    />
                    <span className={styles.logoText}>JVSoftware</span>
                </Link>

                {/* Links desktop */}
                <ul className={styles.links} role="list">
                    {NAV_LINKS.map(({ label, href }) => (
                        <li key={href}>
                            <a
                                href={href}
                                className={styles.link}
                                onClick={(e) => handleNavClick(e, href)}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* CTA desktop */}
                <a
                    href="#contacto"
                    className={`btn btn--primary ${styles.ctaDesktop}`}
                    onClick={(e) => handleNavClick(e, '#contacto')}
                >
                    Hablemos
                </a>

                {/* Hamburguesa móvil */}
                <button
                    className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuOpen}
                >
                    <span /><span /><span />
                </button>
            </nav>

            {/* Menú móvil */}
            <div
                className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
                aria-hidden={!menuOpen}
            >
                <ul className={styles.mobileLinks} role="list">
                    {NAV_LINKS.map(({ label, href }) => (
                        <li key={href}>
                            <a
                                href={href}
                                className={styles.mobileLink}
                                onClick={(e) => handleNavClick(e, href)}
                                tabIndex={menuOpen ? 0 : -1}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                    <li>
                        <a
                            href="#contacto"
                            className={`btn btn--primary ${styles.mobileCta}`}
                            onClick={(e) => handleNavClick(e, '#contacto')}
                            tabIndex={menuOpen ? 0 : -1}
                        >
                            Hablemos →
                        </a>
                    </li>
                </ul>
            </div>
        </header>
    );
}