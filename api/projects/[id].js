// ============================================================
//  /api/projects/[id].js
//  Vercel Serverless Function — Proyecto individual
//  PUT    → actualiza un proyecto (requiere autenticación Clerk)
//  DELETE → elimina un proyecto  (requiere autenticación Clerk)
// ============================================================

import { neon } from '@neondatabase/serverless';

function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL no está definida.');
    }
    return neon(process.env.DATABASE_URL);
}

async function verificarClerk(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];
    try {
        const response = await fetch('https://api.clerk.com/v1/tokens/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
            body: JSON.stringify({ token }),
        });
        return response.ok;
    } catch {
        return false;
    }
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    const autorizado = await verificarClerk(req);
    if (!autorizado) {
        return res.status(401).json({ error: 'No autorizado.' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID del proyecto.' });
    }

    try {
        if (req.method === 'PUT')    return await handlePut(req, res, id);
        if (req.method === 'DELETE') return await handleDelete(req, res, id);

        return res.status(405).json({ error: 'Método no permitido.' });
    } catch (error) {
        console.error(`[/api/projects/${id}] Error:`, error.message);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

// ──────────────────────────────────────────────────────────────
//  PUT — Actualizar proyecto
// ──────────────────────────────────────────────────────────────

async function handlePut(req, res, id) {
    const { titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden, activo } = req.body;

    const sql = getDb();

    const [updated] = await sql`
        UPDATE projects
        SET
            titulo            = COALESCE(${titulo}, titulo),
            descripcion_corta = COALESCE(${descripcion_corta}, descripcion_corta),
            problema_resuelto = COALESCE(${problema_resuelto}, problema_resuelto),
            url_imagen        = COALESCE(${url_imagen}, url_imagen),
            tecnologias       = COALESCE(${tecnologias}, tecnologias),
            orden             = COALESCE(${orden}, orden),
            activo            = COALESCE(${activo}, activo)
        WHERE id = ${id}
        RETURNING id, titulo
    `;

    if (!updated) {
        return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    return res.status(200).json({
        success: true,
        message: `Proyecto "${updated.titulo}" actualizado.`,
        data: updated,
    });
}

// ──────────────────────────────────────────────────────────────
//  DELETE — Eliminar proyecto (soft delete → activo = false)
// ──────────────────────────────────────────────────────────────

async function handleDelete(req, res, id) {
    const sql = getDb();

    // Soft delete: no borramos el registro, solo lo desactivamos
    const [deleted] = await sql`
        UPDATE projects
        SET activo = FALSE
        WHERE id = ${id}
        RETURNING id, titulo
    `;

    if (!deleted) {
        return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    return res.status(200).json({
        success: true,
        message: `Proyecto "${deleted.titulo}" eliminado del portafolio.`,
    });
}