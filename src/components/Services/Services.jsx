// ============================================================
//  Services.jsx — Sección de Servicios
//  Copywriting orientado a beneficios de negocio (sin jerga técnica)
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
        title: 'Tienda Online con Pagos y Envíos',
        tagline: 'Vende mientras duermes, a cualquier ciudad del país.',
        description: 'Una tienda en línea completa donde tus clientes pagan con tarjeta, transferencia o en efectivo. Tú recibes la notificación en el celular y preparas el pedido.',
        bullets: [
            'Pasarela de pago integrada',
            'Gestión de pedidos desde un panel simple',
            'Diseño adaptado a tu marca y colores',
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

const COLOR_MAP = {
    green:  { bg: 'var(--color-accent-light)',   border: 'var(--color-border-accent)', icon: '#25D366' },
    teal:   { bg: '#E1F5EE',                      border: 'rgba(29,158,117,0.25)',       icon: '#0F6E56' },
    amber:  { bg: '#FEF7EB',                      border: 'rgba(245,166,35,0.25)',       icon: '#BA7517' },
    purple: { bg: '#EEEDFE',                      border: 'rgba(83,74,183,0.25)',        icon: '#534AB7' },
};

export default function Services() {
    const handleCTA = (msg) => {
        const el = document.getElementById('contacto');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Opcional: pre-rellenar el select del formulario
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

                {/* Encabezado */}
                <div className={styles.header}>
                    <span className="badge badge--accent">Lo que hacemos</span>
                    <h2 className={styles.title}>
                        Herramientas que resuelven<br />
                        <span className={styles.titleAccent}>problemas reales de tu negocio</span>
                    </h2>
                    <p className={styles.subtitle}>
                        No vendemos tecnología. Vendemos tiempo recuperado, errores eliminados
                        y ventas que antes se perdían. Cada solución está pensada para dueños
                        de negocios que quieren crecer sin complicarse.
                    </p>
                </div>

                {/* Grid de servicios */}
                <div className={styles.grid}>
                    {SERVICES.map((service, i) => {
                        const colors = COLOR_MAP[service.color];
                        return (
                            <article
                                key={i}
                                className={styles.card}
                                style={{
                                    '--card-bg':     colors.bg,
                                    '--card-border': colors.border,
                                    '--card-icon':   colors.icon,
                                }}
                            >
                                {/* Icono */}
                                <div className={styles.iconWrap} aria-hidden="true">
                                    <span className={styles.icon}>{service.icon}</span>
                                </div>

                                {/* Contenido */}
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{service.title}</h3>
                                    <p className={styles.cardTagline}>{service.tagline}</p>
                                    <p className={styles.cardDesc}>{service.description}</p>

                                    {/* Bullets */}
                                    <ul className={styles.bullets} role="list">
                                        {service.bullets.map((b, j) => (
                                            <li key={j} className={styles.bullet}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA de la card */}
                                <button
                                    className={styles.cardCta}
                                    onClick={() => handleCTA(service.cta)}
                                >
                                    {service.cta}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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