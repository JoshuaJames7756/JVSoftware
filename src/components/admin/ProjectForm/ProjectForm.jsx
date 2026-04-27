// ============================================================
//  ProjectForm.jsx — Gestión Integral de Portafolio
//  JVSoftware — Sistema de Control de Proyectos
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import styles from './ProjectForm.module.css';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EMPTY_FORM = {
    titulo: '',
    descripcion_corta: '',
    problema_resuelto: '',
    url_imagen: '',
    tecnologias: '',
    orden: 0,
};

export default function ProjectForm() {
    const { getToken } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [preview, setPreview] = useState('');

    // --- MEJORA: Generador de imagen fallback ---
    const getPlaceholderUrl = (text) => {
        const bg = "151515"; // Fondo oscuro JV
        const color = "25D366"; // Verde acento
        return `https://placehold.co/800x450/${bg}/${color}?text=${encodeURIComponent(text || 'JVSoftware')}`;
    };

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects');
            const { data } = await res.json();
            setProjects(data || []);
        } catch (err) {
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMsg({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', 'portfolio');

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.secure_url) {
                setForm(prev => ({ ...prev, url_imagen: data.secure_url }));
                setPreview(data.secure_url);
                setMsg({ type: 'success', text: 'Imagen cargada correctamente.' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error al conectar con Cloudinary.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const token = await getToken();
            const payload = {
                ...form,
                tecnologias: typeof form.tecnologias === 'string' 
                    ? form.tecnologias.split(',').map(t => t.trim()).filter(Boolean)
                    : form.tecnologias,
                orden: parseInt(form.orden) || 0,
                // Si no hay imagen, guardamos el placeholder por defecto
                url_imagen: form.url_imagen || getPlaceholderUrl(form.titulo)
            };

            const url = editId ? `/api/projects/${editId}` : '/api/projects';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMsg({ type: 'success', text: editId ? 'Proyecto actualizado.' : 'Proyecto creado.' });
                cancelEdit();
                fetchProjects();
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error al procesar la solicitud.' });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (p) => {
        setForm({
            ...p,
            tecnologias: Array.isArray(p.tecnologias) ? p.tecnologias.join(', ') : p.tecnologias
        });
        setPreview(p.url_imagen);
        setEditId(p.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setForm(EMPTY_FORM);
        setPreview('');
        setEditId(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este proyecto?')) return;
        try {
            const token = await getToken();
            await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.wrap}>
            <header className={styles.formHeader}>
                <h2 className={styles.title}>{editId ? '✏️ Editar Proyecto' : '➕ Agregar nuevo proyecto'}</h2>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.gridMain}>
                    <div className={styles.field}>
                        <label className={styles.label}>Título del proyecto *</label>
                        <input 
                            placeholder="Ej: Minimercado POS"
                            className={styles.input}
                            value={form.titulo}
                            onChange={(e) => setForm({...form, titulo: e.target.value})}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Orden</label>
                        <input 
                            type="number"
                            className={styles.input}
                            value={form.orden}
                            onChange={(e) => setForm({...form, orden: e.target.value})}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Descripción corta *</label>
                    <input 
                        placeholder="Una línea que resume el proyecto"
                        className={styles.input}
                        value={form.descripcion_corta}
                        onChange={(e) => setForm({...form, descripcion_corta: e.target.value})}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Problema resuelto *</label>
                    <textarea 
                        placeholder="Describe el problema del cliente y cómo lo resolviste"
                        className={styles.textarea}
                        value={form.problema_resuelto}
                        onChange={(e) => setForm({...form, problema_resuelto: e.target.value})}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Tecnologías (separadas por coma)</label>
                    <input 
                        placeholder="React, Vite, Neon, PostgreSQL"
                        className={styles.input}
                        value={form.tecnologias}
                        onChange={(e) => setForm({...form, tecnologias: e.target.value})}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Imagen del proyecto *</label>
                    <div className={styles.uploadBox}>
                        <label className={styles.fileLabel}>
                            {uploading ? '⌛ Subiendo...' : '📁 Seleccionar imagen'}
                            <input type="file" onChange={handleImageUpload} hidden />
                        </label>
                        {preview && <img src={preview} className={styles.miniPreview} alt="Preview" />}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="submit" disabled={saving} className={styles.saveBtn}>
                        {saving ? 'Guardando...' : 'Guardar proyecto'}
                    </button>
                    {editId && <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>Cancelar</button>}
                </div>
                {msg.text && <p className={msg.type === 'success' ? styles.success : styles.error}>{msg.text}</p>}
            </form>

            <section className={styles.listContainer}>
                <h3 className={styles.listTitle}>Proyectos en el portafolio ({projects.length})</h3>
                <div className={styles.gridList}>
                    {projects.map((p) => (
                        <div key={p.id} className={styles.card}>
                            <div className={styles.cardImage}>
                                <img 
                                    src={p.url_imagen || getPlaceholderUrl(p.titulo)} 
                                    alt={p.titulo} 
                                    onError={(e) => { e.target.src = getPlaceholderUrl(p.titulo); }}
                                />
                                <span className={styles.tag}>#{p.orden}</span>
                            </div>
                            <div className={styles.cardBody}>
                                <h4>{p.titulo}</h4>
                                <p>{p.descripcion_corta}</p>
                            </div>
                            <div className={styles.cardFooter}>
                                <button onClick={() => handleEdit(p)} className={styles.btnEdit}>📝 Editar</button>
                                <button onClick={() => handleDelete(p.id)} className={styles.btnDelete}>🗑️ Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}