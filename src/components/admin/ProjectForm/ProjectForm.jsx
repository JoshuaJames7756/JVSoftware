// ============================================================
//  ProjectForm.jsx — CRUD de portafolio para el admin
//  Subida de imagen a Cloudinary (unsigned preset) + POST /api/projects
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import styles from './ProjectForm.module.css';

const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EMPTY_FORM = {
    titulo: '', descripcion_corta: '', problema_resuelto: '',
    url_imagen: '', tecnologias: '', orden: 0,
};

export default function ProjectForm() {
    const { getToken } = useAuth();

    const [projects,  setProjects]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [form,      setForm]      = useState(EMPTY_FORM);
    const [editId,    setEditId]    = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving,    setSaving]    = useState(false);
    const [msg,       setMsg]       = useState({ type: '', text: '' });
    const [preview,   setPreview]   = useState('');

    // ── Fetch proyectos ──────────────────────────────────────
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await fetch('/api/projects');
            const { data } = await res.json();
            setProjects(data);
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    // ── Handlers de formulario ───────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validación rápida
        if (!file.type.startsWith('image/')) {
            setMsg({ type: 'error', text: 'Solo se permiten imágenes.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMsg({ type: 'error', text: 'La imagen no puede superar los 5MB.' });
            return;
        }

        setUploading(true);
        setMsg({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('file',           file);
            formData.append('upload_preset',  UPLOAD_PRESET);
            formData.append('folder',         'portfolio');
            formData.append('transformation', 'w_800,h_450,c_fill,q_auto,f_webp');

            const res  = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();

            if (data.secure_url) {
                setForm(prev => ({ ...prev, url_imagen: data.secure_url }));
                setPreview(data.secure_url);
                setMsg({ type: 'success', text: 'Imagen subida correctamente.' });
            } else {
                throw new Error('Cloudinary no devolvió una URL.');
            }
        } catch (err) {
            setMsg({ type: 'error', text: `Error al subir imagen: ${err.message}` });
        } finally {
            setUploading(false);
        }
    };

    // ── Submit ───────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo || !form.descripcion_corta || !form.url_imagen) {
            setMsg({ type: 'error', text: 'Título, descripción e imagen son requeridos.' });
            return;
        }

        setSaving(true);
        setMsg({ type: '', text: '' });

        try {
            const token = await getToken();
            const payload = {
                ...form,
                tecnologias: form.tecnologias.split(',').map(t => t.trim()).filter(Boolean),
                orden: parseInt(form.orden) || 0,
            };

            const url    = editId ? `/api/projects/${editId}` : '/api/projects';
            const method = editId ? 'PUT' : 'POST';

            const res  = await fetch(url, {
                method,
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMsg({ type: 'success', text: data.message });
            setForm(EMPTY_FORM);
            setPreview('');
            setEditId(null);
            fetchProjects();
        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    // ── Editar ───────────────────────────────────────────────
    const handleEdit = (p) => {
        setForm({
            titulo:            p.titulo,
            descripcion_corta: p.descripcion_corta,
            problema_resuelto: p.problema_resuelto,
            url_imagen:        p.url_imagen,
            tecnologias:       p.tecnologias.join(', '),
            orden:             p.orden,
        });
        setPreview(p.url_imagen);
        setEditId(p.id);
        setMsg({ type: '', text: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Eliminar (soft delete) ───────────────────────────────
    const handleDelete = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar "${titulo}" del portafolio?`)) return;
        try {
            const token = await getToken();
            await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProjects();
        } catch { /* silencioso */ }
    };

    const cancelEdit = () => {
        setForm(EMPTY_FORM);
        setPreview('');
        setEditId(null);
        setMsg({ type: '', text: '' });
    };

    return (
        <div className={styles.wrap}>
            <h2 className={styles.title}>
                {editId ? '✏️ Editar proyecto' : '➕ Agregar proyecto'}
            </h2>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className={styles.form} noValidate>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="titulo">Título del proyecto *</label>
                        <input id="titulo" name="titulo" type="text"
                            value={form.titulo} onChange={handleChange}
                            placeholder="Ej: Minimercado POS" className={styles.input} />
                    </div>
                    <div className={styles.field} style={{ maxWidth: 120 }}>
                        <label className={styles.label} htmlFor="orden">Orden</label>
                        <input id="orden" name="orden" type="number" min={0}
                            value={form.orden} onChange={handleChange} className={styles.input} />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="descripcion_corta">Descripción corta *</label>
                    <input id="descripcion_corta" name="descripcion_corta" type="text"
                        value={form.descripcion_corta} onChange={handleChange}
                        placeholder="Una línea que resume el proyecto" className={styles.input} />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="problema_resuelto">Problema resuelto *</label>
                    <textarea id="problema_resuelto" name="problema_resuelto"
                        value={form.problema_resuelto} onChange={handleChange}
                        placeholder="Describe el problema del cliente y cómo lo resolviste"
                        className={styles.textarea} rows={4} />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="tecnologias">
                        Tecnologías <span className={styles.hint}>(separadas por coma)</span>
                    </label>
                    <input id="tecnologias" name="tecnologias" type="text"
                        value={form.tecnologias} onChange={handleChange}
                        placeholder="React, Vite, Neon, PostgreSQL" className={styles.input} />
                </div>

                {/* Subida de imagen */}
                <div className={styles.field}>
                    <label className={styles.label}>Imagen del proyecto *</label>
                    <div className={styles.uploadWrap}>
                        <label htmlFor="img-upload" className={styles.uploadBtn}>
                            {uploading ? '⏳ Subiendo…' : '📎 Seleccionar imagen'}
                            <input
                                id="img-upload" type="file"
                                accept="image/*" onChange={handleImageUpload}
                                className={styles.fileInput}
                                disabled={uploading}
                            />
                        </label>
                        {form.url_imagen && (
                            <span className={styles.urlPreview} title={form.url_imagen}>
                                ✓ {form.url_imagen.split('/').pop()}
                            </span>
                        )}
                    </div>
                    {preview && (
                        <img src={preview} alt="Preview" className={styles.preview} />
                    )}
                </div>

                {/* Feedback */}
                {msg.text && (
                    <p className={`${styles.msg} ${msg.type === 'error' ? styles.msgError : styles.msgSuccess}`} role="alert">
                        {msg.text}
                    </p>
                )}

                {/* Acciones */}
                <div className={styles.actions}>
                    <button type="submit" className="btn btn--primary" disabled={saving || uploading}>
                        {saving ? '⏳ Guardando…' : editId ? 'Actualizar proyecto' : 'Guardar proyecto'}
                    </button>
                    {editId && (
                        <button type="button" className="btn btn--outline" onClick={cancelEdit}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            {/* Lista de proyectos existentes */}
            <div className={styles.projectList}>
                <h3 className={styles.listTitle}>Proyectos en el portafolio ({projects.length})</h3>
                {loading ? (
                    <p className={styles.listLoading}>Cargando…</p>
                ) : projects.length === 0 ? (
                    <p className={styles.listEmpty}>No hay proyectos aún.</p>
                ) : (
                    <div className={styles.listGrid}>
                        {projects.map((p) => (
                            <div key={p.id} className={styles.projectCard}>
                                <img src={p.url_imagen} alt={p.titulo} className={styles.cardImg}
                                    onError={e => { e.target.src = `https://placehold.co/300x180/EFEBE4/25D366?text=${encodeURIComponent(p.titulo)}`; }}
                                />
                                <div className={styles.cardInfo}>
                                    <p className={styles.cardTitle}>{p.titulo}</p>
                                    <p className={styles.cardDesc}>{p.descripcion_corta}</p>
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={() => handleEdit(p)}>✏️ Editar</button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(p.id, p.titulo)}>🗑 Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}