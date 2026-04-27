// ============================================================
//  ProjectForm.jsx — CRUD Maestro de Portafolio
//  JVSoftware — Protocolo 4.2 (Full Stack Edition)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import styles from './ProjectForm.module.css';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EMPTY_FORM = {
    titulo: '', descripcion_corta: '', problema_resuelto: '',
    url_imagen: '', tecnologias: '', orden: 0,
};

export default function ProjectForm() {
    const { getToken } = useAuth();

    const [projects,  setProjects]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [form,       setForm]      = useState(EMPTY_FORM);
    const [editId,     setEditId]    = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving,     setSaving]    = useState(false);
    const [msg,        setMsg]       = useState({ type: '', text: '' });
    const [preview,    setPreview]   = useState('');

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await fetch('/api/projects');
            const { data } = await res.json();
            setProjects(data || []);
        } catch (err) {
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', 'portfolio');
            formData.append('transformation', 'w_800,h_450,c_fill,q_auto,f_webp');

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();

            if (data.secure_url) {
                setForm(prev => ({ ...prev, url_imagen: data.secure_url }));
                setPreview(data.secure_url);
                setMsg({ type: 'success', text: 'Imagen optimizada y subida.' });
            } else {
                throw new Error('Error en la respuesta de Cloudinary.');
            }
        } catch (err) {
            setMsg({ type: 'error', text: `Fallo de subida: ${err.message}` });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo || !form.descripcion_corta || !form.url_imagen) {
            setMsg({ type: 'error', text: 'Completa los campos obligatorios (*)' });
            return;
        }

        setSaving(true);
        setMsg({ type: '', text: '' });

        try {
            const token = await getToken();
            const payload = {
                ...form,
                tecnologias: typeof form.tecnologias === 'string' 
                    ? form.tecnologias.split(',').map(t => t.trim()).filter(Boolean)
                    : form.tecnologias,
                orden: parseInt(form.orden) || 0,
            };

            const url    = editId ? `/api/projects/${editId}` : '/api/projects';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al guardar');

            setMsg({ type: 'success', text: editId ? 'Proyecto actualizado' : 'Proyecto creado con éxito' });
            cancelEdit();
            fetchProjects();
        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (p) => {
        setForm({
            titulo: p.titulo,
            descripcion_corta: p.descripcion_corta,
            problema_resuelto: p.problema_resuelto,
            url_imagen: p.url_imagen,
            tecnologias: p.tecnologias.join(', '),
            orden: p.orden,
        });
        setPreview(p.url_imagen);
        setEditId(p.id);
        setMsg({ type: '', text: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, titulo) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${titulo}"?`)) return;
        try {
            const token = await getToken();
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchProjects();
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    const cancelEdit = () => {
        setForm(EMPTY_FORM);
        setPreview('');
        setEditId(null);
        setMsg({ type: '', text: '' });
    };

    return (
        <div className={styles.wrap}>
            <header className={styles.formHeader}>
                <h2 className={styles.title}>
                    {editId ? '✏️ Editar Proyecto' : '➕ Nuevo Proyecto'}
                </h2>
                <p className={styles.subtitle}>Gestiona el portafolio de JVSoftware</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.grid2}>
                    <div className={styles.field}>
                        <label className={styles.label}>Título del proyecto *</label>
                        <input name="titulo" type="text" value={form.titulo} onChange={handleChange}
                            placeholder="Nombre del software" className={styles.input} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Prioridad (Orden)</label>
                        <input name="orden" type="number" value={form.orden} onChange={handleChange} 
                            className={styles.input} />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Descripción rápida *</label>
                    <input name="descripcion_corta" type="text" value={form.descripcion_corta} onChange={handleChange}
                        placeholder="Ej: Sistema de inventarios offline-first" className={styles.input} />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Problema & Solución *</label>
                    <textarea name="problema_resuelto" value={form.problema_resuelto} onChange={handleChange}
                        placeholder="¿Qué reto enfrentaba el cliente y cómo lo resolviste?"
                        className={styles.textarea} rows={4} />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Tecnologías <span className={styles.hint}>(Comas)</span></label>
                    <input name="tecnologias" type="text" value={form.tecnologias} onChange={handleChange}
                        placeholder="React, Supabase, IndexedDB..." className={styles.input} />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Imagen destacada *</label>
                    <div className={styles.uploadArea}>
                        <label className={styles.uploadBtn}>
                            {uploading ? '⏳ Procesando...' : '📷 Subir a Cloudinary'}
                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
                        </label>
                        {preview && <img src={preview} alt="Preview" className={styles.previewImg} />}
                    </div>
                </div>

                {msg.text && (
                    <div className={`${styles.alert} ${msg.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
                        {msg.text}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button type="submit" className={styles.mainBtn} disabled={saving || uploading}>
                        {saving ? 'Guardando...' : editId ? 'Actualizar Cambios' : 'Publicar Proyecto'}
                    </button>
                    {editId && (
                        <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <div className={styles.listSection}>
                <h3 className={styles.listTitle}>Proyectos Activos ({projects.length})</h3>
                {loading ? (
                    <div className={styles.skeletonGrid}>Cargando portafolio...</div>
                ) : (
                    <div className={styles.listGrid}>
                        {projects.map((p) => (
                            <div key={p.id} className={styles.projectCard}>
                                <div className={styles.cardMedia}>
                                    <img src={p.url_imagen} alt={p.titulo} />
                                    <div className={styles.orderBadge}>#{p.orden}</div>
                                </div>
                                <div className={styles.cardContent}>
                                    <h4>{p.titulo}</h4>
                                    <p>{p.descripcion_corta}</p>
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={() => handleEdit(p)}>
                                        Editar
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(p.id, p.titulo)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}