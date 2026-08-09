// ============================================================
//  Services.jsx — Sección de Servicios (Optimizado v2)
// ============================================================

import styles from './Services.module.css';

const SERVICES = [
    {
        icon: '🏪',
        title: 'Sistema de Punto de Venta e Inventario',
        tagline: 'Sabe exactamente qué tienes y cuánto ganaste, en tiempo real.',
        description: 'Olvídate del cuaderno y el Excel. Registra ventas desde el celular o tablet, controla tu stock automáticamente y recibe alertas cuando un producto esté por agotarse.',
        bullets: [
            'Inventario actualizado al instante',
            'Reportes de ventas por día, semana o mes',
            'Funciona sin internet (modo offline)',
            'Multi-usuario para cajeros y supervisores',
        ],
        cta: 'Quiero controlar mi inventario',
        color: 'green',
    },
    {
        icon: '📲',
        title: 'Catálogo Digital directo a WhatsApp',
        tagline: 'Tu tienda abierta 24/7, sin pagarle a un vendedor extra.',
        description: 'Tus clientes ven tus productos, eligen lo que quieren y te mandan el pedido directo por WhatsApp. Sin apps, sin complicaciones — funciona desde cualquier celular.',
        bullets: [
            'Catálogo con fotos, precios y descripciones',
            'Botón de pedido directo a tu WhatsApp',
            'Tú administras los productos sin depender de nadie',
            'Comparte el link en Instagram, Facebook o impreso',
        ],
        cta: 'Quiero mi catálogo digital',
        color: 'teal',
    },
    {
        icon: '🛒',
        title: 'Tienda Online con Pagos QR',
        tagline: 'Vende mientras duermes, con cobros directos a tu cuenta.',
        description: 'Una tienda en línea donde tus clientes eligen sus productos y pagan escaneando tu QR oficial. Recibes el dinero al instante en tu banco y preparas el envío.',
        bullets: [
            'Generación de pedidos automáticos',
            'Integración con pagos QR de Simple',
            'Gestión de inventario y stock real',
            'SEO para que Google te encuentre',
        ],
        cta: 'Quiero vender en línea',
        color: 'amber',
    },
    {
        icon: '📊',
        title: 'Panel de Gestión y Reportes',
        tagline: 'Toda la información de tu negocio en una sola pantalla.',
        description: 'Deja de perder tiempo buscando papeles o preguntándole a los empleados. Un panel centralizado con ventas, gastos, clientes y métricas clave — accesible desde tu celular.',
        bullets: [
            'Dashboard con indicadores clave del negocio',
            'Registro de clientes y su historial',
            'Control de gastos y ganancias',
            'Acceso con usuario y contraseña para cada empleado',
        ],
        cta: 'Quiero ordenar mi negocio',
        color: 'purple',
    },
];

// Colores ajustados para Dark Mode con opacidades sutiles
const COLOR_MAP = {
    green:  { glow: 'rgba(183, 255, 114, 0.15)', border: 'rgba(183, 255, 114, 0.3)', icon: '#B7FF72' },
    teal:   { glow: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.3)',  icon: '#14b8a6' },
    amber:  { glow: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)',  icon: '#f59e0b' },
    purple: { glow: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)',  icon: '#a855f7' },
};

export default function Services() {
    const handleCTA = (msg) => {
        const el = document.getElementById('contacto');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        const select = document.getElementById('tipo_problema');
        if (select) {
            const match = Array.from(select.options).find(o =>
                o.text.toLowerCase().includes(msg.toLowerCase().split(' ')[1])
            );
            if (match) select.value = match.value;
        }
    };

    return (
        <section id="servicios" className={`section ${styles.services}`}>
            <div className="container">

                <div className={styles.header}>
                    <span className="badge badge--accent">Lo que hacemos</span>
                    <h2 className={styles.title}>
                        Herramientas que resuelven<br />
                        <span className={styles.titleAccent}>problemas reales de tu negocio</span>
                    </h2>
                    <p className={styles.subtitle}>
                        No vendemos tecnología. Vendemos tiempo recuperado, errores eliminados
                        y ventas que antes se perdían.
                    </p>
                </div>

                <div className={styles.grid}>
                    {SERVICES.map((service, i) => {
                        const colors = COLOR_MAP[service.color];
                        return (
                            <article
                                key={i}
                                className={styles.card}
                                style={{
                                    '--card-glow': colors.glow,
                                    '--card-border': colors.border,
                                    '--card-icon': colors.icon,
                                }}
                            >
                                <div className={styles.iconWrap} aria-hidden="true">
                                    <span className={styles.icon}>{service.icon}</span>
                                </div>

                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{service.title}</h3>
                                    <p className={styles.cardTagline}>{service.tagline}</p>
                                    <p className={styles.cardDesc}>{service.description}</p>

                                    <ul className={styles.bullets} role="list">
                                        {service.bullets.map((b, j) => (
                                            <li key={j} className={styles.bullet}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    className={styles.cardCta}
                                    onClick={() => handleCTA(service.cta)}
                                >
                                    {service.cta}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </article>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}