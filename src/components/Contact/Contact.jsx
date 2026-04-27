// ============================================================
//  Contact.jsx — Formulario de contacto
//  POST a /api/leads — opciones orientadas al negocio
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
        if (!form.nombre.trim())        e.nombre        = 'Tu nombre es requerido.';
        if (!form.email.trim() || !form.email.includes('@'))
                                        e.email         = 'Ingresa un email válido.';
        if (!form.tipo_problema)        e.tipo_problema = 'Selecciona una opción.';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al escribir
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

                    {/* Columna izquierda — info */}
                    <div className={styles.info}>
                        <span className="badge badge--accent">Hablemos</span>
                        <h2 className={styles.title}>
                            Cuéntanos qué necesita<br />
                            <span className={styles.titleAccent}>tu negocio</span>
                        </h2>
                        <p className={styles.subtitle}>
                            Primera consulta gratis. Sin compromisos, sin contratos largos.
                            Te respondemos en menos de 48 horas con un plan concreto.
                        </p>

                        <ul className={styles.benefits} role="list">
                            {[
                                'Sin jerga técnica — hablamos como personas',
                                'Cotización clara y sin sorpresas',
                                'Soporte incluido después de la entrega',
                                'Pagos flexibles adaptados a tu flujo',
                            ].map((b, i) => (
                                <li key={i} className={styles.benefit}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna derecha — formulario */}
                    <div className={styles.formWrap}>
                        {status === 'success' ? (
                            <div className={styles.successState} role="status">
                                <div className={styles.successIcon} aria-hidden="true">✓</div>
                                <h3>¡Mensaje recibido!</h3>
                                <p>Te contactaremos en menos de 48 horas. Revisa tu bandeja de entrada.</p>
                                <button
                                    className="btn btn--outline"
                                    onClick={() => setStatus('idle')}
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
                                <h3 className={styles.formTitle}>Envíanos un mensaje</h3>

                                {/* Nombre */}
                                <div className={`${styles.field} ${errors.nombre ? styles.fieldError : ''}`}>
                                    <label htmlFor="nombre" className={styles.label}>
                                        Tu nombre
                                    </label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="¿Cómo te llamas?"
                                        className={styles.input}
                                        autoComplete="name"
                                        aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                                    />
                                    {errors.nombre && (
                                        <span id="nombre-error" className={styles.errorMsg} role="alert">
                                            {errors.nombre}
                                        </span>
                                    )}
                                </div>

                                {/* Email */}
                                <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
                                    <label htmlFor="email" className={styles.label}>
                                        Tu email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="correo@tunegocio.com"
                                        className={styles.input}
                                        autoComplete="email"
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                    />
                                    {errors.email && (
                                        <span id="email-error" className={styles.errorMsg} role="alert">
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                                {/* Tipo de problema */}
                                <div className={`${styles.field} ${errors.tipo_problema ? styles.fieldError : ''}`}>
                                    <label htmlFor="tipo_problema" className={styles.label}>
                                        ¿Qué necesitas?
                                    </label>
                                    <select
                                        id="tipo_problema"
                                        name="tipo_problema"
                                        value={form.tipo_problema}
                                        onChange={handleChange}
                                        className={styles.select}
                                        aria-describedby={errors.tipo_problema ? 'tipo-error' : undefined}
                                    >
                                        {TIPOS_PROBLEMA.map(({ value, label }) => (
                                            <option key={value} value={value} disabled={value === ''}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tipo_problema && (
                                        <span id="tipo-error" className={styles.errorMsg} role="alert">
                                            {errors.tipo_problema}
                                        </span>
                                    )}
                                </div>

                                {/* Mensaje */}
                                <div className={styles.field}>
                                    <label htmlFor="mensaje" className={styles.label}>
                                        Cuéntanos más <span className={styles.optional}>(opcional)</span>
                                    </label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        value={form.mensaje}
                                        onChange={handleChange}
                                        placeholder="Describe brevemente tu negocio y lo que quieres lograr..."
                                        className={styles.textarea}
                                        rows={4}
                                    />
                                </div>

                                {/* Error global */}
                                {status === 'error' && (
                                    <p className={styles.globalError} role="alert">
                                        {errMsg || 'Ocurrió un error. Intenta de nuevo.'}
                                    </p>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className={`btn btn--primary ${styles.submitBtn}`}
                                    disabled={status === 'loading'}
                                    aria-busy={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <span className={styles.spinner} aria-hidden="true" />
                                            Enviando…
                                        </>
                                    ) : (
                                        'Enviar mensaje →'
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