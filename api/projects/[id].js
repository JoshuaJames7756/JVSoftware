// ============================================================
//  /api/projects/[id].js
//  Vercel Serverless Function — Operaciones por ID
//  PUT    → edita un proyecto (requiere auth Clerk)
//  DELETE → desactiva un proyecto (requiere auth Clerk)
// ============================================================

import { neon } from '@neondatabase/serverless';

// ──────────────────────────────────────────────────────────────
//  Utilidades
// ──────────────────────────────────────────────────────────────

function getDb() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no definida.');
    return neon(process.env.DATABASE_URL);
}

/**
 * Verifica el token JWT de Clerk decodificando el payload directamente.
 * Compatible con development keys (sk_test_) sin instancia de producción.
 * TODO: cuando tengas sk_live_ + dominio propio, migrar a
 *       createClerkClient({ secretKey }).verifyToken(token)
 */
async function verificarClerk(req) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader?.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];

        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf8')
        );

        const ahora = Math.floor(Date.now() / 1000);
        if (!payload.sub || !payload.exp || payload.exp < ahora) return false;

        return true;
    } catch (err) {
        console.error('[verificarClerk] Error:', err.message);
        return false;
    }
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ──────────────────────────────────────────────────────────────
//  Handler principal
// ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const autorizado = await verificarClerk(req);
    if (!autorizado) return res.status(401).json({ error: 'No autorizado.' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Se requiere el ID.' });

    try {
        if (req.method === 'PUT')    return await handlePut(req, res, id);
        if (req.method === 'DELETE') return await handleDelete(req, res, id);

        return res.status(405).json({ error: 'Método no permitido.' });
    } catch (error) {
        console.error(`[/api/projects/${id}] Error:`, error.message, '| Code:', error.code);
        return res.status(500).json({ error: 'Error interno.', detalle: error.message });
    }
}

// ──────────────────────────────────────────────────────────────
//  PUT — Editar proyecto
// ──────────────────────────────────────────────────────────────

async function handlePut(req, res, id) {
    const { titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden, activo } = req.body;

    const sql = getDb();

    const [updated] = await sql`
        UPDATE projects SET
            titulo            = COALESCE(${titulo            ?? null}, titulo),
            descripcion_corta = COALESCE(${descripcion_corta ?? null}, descripcion_corta),
            problema_resuelto = COALESCE(${problema_resuelto ?? null}, problema_resuelto),
            url_imagen        = COALESCE(${url_imagen        ?? null}, url_imagen),
            tecnologias       = COALESCE(${tecnologias       ?? null}, tecnologias),
            orden             = COALESCE(${orden             ?? null}, orden),
            activo            = COALESCE(${activo            ?? null}, activo)
        WHERE id = ${id}
        RETURNING id, titulo
    `;

    if (!updated) return res.status(404).json({ error: 'Proyecto no encontrado.' });

    return res.status(200).json({
        success: true,
        message: `Proyecto "${updated.titulo}" actualizado.`,
        data: updated,
    });
}

// ──────────────────────────────────────────────────────────────
//  DELETE — Soft delete (activo = FALSE)
// ──────────────────────────────────────────────────────────────

async function handleDelete(req, res, id) {
    const sql = getDb();

    const [deleted] = await sql`
        UPDATE projects SET activo = FALSE
        WHERE id = ${id}
        RETURNING id, titulo
    `;

    if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado.' });

    return res.status(200).json({
        success: true,
        message: `Proyecto "${deleted.titulo}" eliminado.`,
    });
}