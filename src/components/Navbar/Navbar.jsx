import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_LINKS = [
    { label: 'Servicios',  href: '#servicios'  },
    { label: 'Portafolio', href: '#portafolio' },
    { label: 'Contacto',   href: '#contacto'   },
];

export default function Navbar() {
    const [scrolled, setScrolled]   = useState(false);
    const [menuOpen, setMenuOpen]   = useState(false);
    const location                  = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
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
        if (el) {
            const offset          = 80;
            const bodyRect        = document.body.getBoundingClientRect().top;
            const elementRect     = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition  = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    /* Menú móvil renderizado directamente en <body> via portal */
    const mobileMenu = createPortal(
        <div
            className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
            aria-hidden={!menuOpen}
        >
            <ul className={styles.mobileLinks} role="list">
                {NAV_LINKS.map(({ label, href }, index) => (
                    <li key={href} style={{ transitionDelay: `${index * 50}ms` }}>
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
                <li style={{ transitionDelay: `${NAV_LINKS.length * 50}ms` }}>
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
        </div>,
        document.body
    );

    return (
        <>
            <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
                <nav className={`${styles.inner} container`} aria-label="Navegación principal">

                    {/* Logo */}
                    <Link to="/" className={styles.logo} aria-label="JVSoftware — inicio">
                        <div className={styles.logoWrapper}>
                            <img
                                src="/logo.png"
                                alt="JVSoftware"
                                className={styles.logoImg}
                                height="48"
                                width="48"
                                loading="eager"
                            />
                        </div>
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

                    {/* CTA desktop + Hamburguesa */}
                    <div className={styles.actions}>
                        <a
                            href="#contacto"
                            className={`btn btn--primary ${styles.ctaDesktop}`}
                            onClick={(e) => handleNavClick(e, '#contacto')}
                        >
                            Hablemos
                        </a>

                        <button
                            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={menuOpen}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Portal — menú móvil montado en document.body */}
            {mobileMenu}
        </>
    );
}