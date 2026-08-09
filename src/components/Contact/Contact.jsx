// ============================================================
//   Contact.jsx — Formulario de contacto
//   Xion Technology — Protocolo 4.2 (Business Oriented)
//   Optimización: Dark Mode & Select UX
// ============================================================

import { useState } from 'react';
import styles from './Contact.module.css';

const TIPOS_PROBLEMA = [
    { value: '',            label: '¿En qué puedo ayudarte?' },
    { value: 'inventario',  label: 'Quiero controlar mi inventario' },
    { value: 'catalogo',    label: 'Necesito un catálogo online' },
    { value: 'pos',         label: 'Quiero un sistema de ventas (POS)' },
    { value: 'tienda',      label: 'Quiero vender en línea' },
    { value: 'gestion',     label: 'Necesito organizar mi negocio' },
    { value: 'otro',        label: 'Tengo otra necesidad' },
];

const INITIAL_FORM = { nombre: '', email: '', tipo_problema: '', mensaje: '' };

export default function Contact() {
    const [form,     setForm]     = useState(INITIAL_FORM);
    const [errors,   setErrors]   = useState({});
    const [status,   setStatus]   = useState('idle'); // idle | loading | success | error
    const [errMsg,   setErrMsg]   = useState('');

    const validate = () => {
        const e = {};
        if (!form.nombre.trim())         e.nombre         = 'Tu nombre es requerido.';
        if (!form.email.trim() || !form.email.includes('@'))
                                        e.email          = 'Ingresa un email válido.';
        if (!form.tipo_problema)        e.tipo_problema = 'Selecciona una opción.';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setStatus('loading');

        try {
            const fuente =
                new URLSearchParams(window.location.search).get('utm_source') ||
                document.referrer ||
                'directa';

            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, fuente }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error al enviar.');

            setStatus('success');
            setForm(INITIAL_FORM);
        } catch (err) {
            setStatus('error');
            setErrMsg(err.message);
        }
    };

    return (
        <section id="contacto" className={`section ${styles.contact}`}>
            <div className="container">
                <div className={styles.inner}>

                    {/* Columna izquierda — Propuesta de Valor */}
                    <div className={styles.info}>
                        <span className="badge badge--accent">Hablemos</span>
                        <h2 className={styles.title}>
                            Cuéntanos qué necesita<br />
                            <span className={styles.titleAccent}>tu negocio</span>
                        </h2>
                        <p className={styles.subtitle}>
                            Primera consulta gratis. Sin compromisos ni jerga técnica.
                            Te respondemos en menos de 48 horas con una propuesta clara.
                        </p>

                        <ul className={styles.benefits} role="list">
                            {[
                                'Sin jerga técnica — hablamos tu mismo idioma',
                                'Cotización clara y sin costos ocultos',
                                'Soporte post-entrega garantizado',
                                'Pagos flexibles según el avance',
                            ].map((b, i) => (
                                <li key={i} className={styles.benefit}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" fill="var(--color-accent-soft, #B7FF7222)" />
                                        <path d="M8 12l3 3 5-5" stroke="var(--color-accent, #B7FF72)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna derecha — Formulario */}
                    <div className={styles.formWrap}>
                        {status === 'success' ? (
                            <div className={styles.successState} role="status">
                                <div className={styles.successIcon} aria-hidden="true">✓</div>
                                <h3>¡Mensaje enviado con éxito!</h3>
                                <p>Estamos analizando tu caso. Joshua se pondrá en contacto contigo muy pronto.</p>
                                <button
                                    className="btn btn--outline"
                                    onClick={() => setStatus('idle')}
                                    style={{ marginTop: 'var(--space-4)' }}
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form
                                className={styles.form}
                                onSubmit={handleSubmit}
                                noValidate
                                aria-label="Formulario de contacto"
                            >
                                <h3 className={styles.formTitle}>Inicia tu proyecto</h3>

                                <div className={`${styles.field} ${errors.nombre ? styles.fieldError : ''}`}>
                                    <label htmlFor="nombre" className={styles.label}>Tu nombre</label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej. Juan Pérez"
                                        className={styles.input}
                                        autoComplete="name"
                                    />
                                    {errors.nombre && <span className={styles.errorMsg}>{errors.nombre}</span>}
                                </div>

                                <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
                                    <label htmlFor="email" className={styles.label}>Email de contacto</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="correo@empresa.com"
                                        className={styles.input}
                                        autoComplete="email"
                                    />
                                    {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                                </div>

                                <div className={`${styles.field} ${errors.tipo_problema ? styles.fieldError : ''}`}>
                                    <label htmlFor="tipo_problema" className={styles.label}>¿Qué solución buscas?</label>
                                    <select
                                        id="tipo_problema"
                                        name="tipo_problema"
                                        value={form.tipo_problema}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        {TIPOS_PROBLEMA.map(({ value, label }) => (
                                            <option key={value} value={value} disabled={value === ''}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tipo_problema && <span className={styles.errorMsg}>{errors.tipo_problema}</span>}
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="mensaje" className={styles.label}>
                                        Detalles adicionales <span className={styles.optional}>(opcional)</span>
                                    </label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        value={form.mensaje}
                                        onChange={handleChange}
                                        placeholder="Cuéntanos un poco sobre tu negocio..."
                                        className={styles.textarea}
                                        rows={4}
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className={styles.globalError}>
                                        {errMsg || 'Error de conexión. Inténtalo de nuevo.'}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className={`btn btn--primary ${styles.submitBtn}`}
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <><span className={styles.spinner} /> Enviando...</>
                                    ) : (
                                        'Solicitar Consulta Gratis →'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}