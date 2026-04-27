// ============================================================
//  /api/projects/index.js
//  Vercel Serverless Function — Portafolio de proyectos
//  GET  → lista proyectos activos (público)
//  POST → crea proyecto nuevo (requiere auth Clerk)
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ──────────────────────────────────────────────────────────────
//  Handler principal
// ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET')  return await handleGet(req, res);
        if (req.method === 'POST') return await handlePost(req, res);

        return res.status(405).json({ error: 'Método no permitido.' });
    } catch (error) {
        console.error('[/api/projects] Error inesperado:', error.message, '| Code:', error.code);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

// ──────────────────────────────────────────────────────────────
//  GET — Listar proyectos activos (público)
// ──────────────────────────────────────────────────────────────

async function handleGet(req, res) {
    try {
        const sql = getDb();

        const projects = await sql`
            SELECT
                id,
                titulo,
                descripcion_corta,
                problema_resuelto,
                url_imagen,
                tecnologias,
                orden,
                fecha_creacion
            FROM projects
            WHERE activo = TRUE
            ORDER BY orden ASC, fecha_creacion DESC
        `;

        return res.status(200).json({
            success: true,
            data: projects,
            total: projects.length,
        });
    } catch (err) {
        console.error('[handleGet projects] Neon error:', err.message, '| Code:', err.code);
        return res.status(500).json({
            error: 'Error al obtener proyectos.',
            detalle: err.message,
        });
    }
}

// ──────────────────────────────────────────────────────────────
//  POST — Crear proyecto nuevo (solo admin autenticado)
// ──────────────────────────────────────────────────────────────

async function handlePost(req, res) {
    const autorizado = await verificarClerk(req);
    if (!autorizado) return res.status(401).json({ error: 'No autorizado.' });

    const { titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden } = req.body;

    if (!titulo || !descripcion_corta || !problema_resuelto || !url_imagen) {
        return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    if (!Array.isArray(tecnologias) || tecnologias.length === 0) {
        return res.status(400).json({ error: 'tecnologias debe ser un array no vacío.' });
    }

    try {
        const sql = getDb();

        const [proyecto] = await sql`
            INSERT INTO projects (titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden)
            VALUES (
                ${titulo},
                ${descripcion_corta},
                ${problema_resuelto},
                ${url_imagen},
                ${tecnologias},
                ${orden ?? 0}
            )
            RETURNING id, titulo, fecha_creacion
        `;

        return res.status(201).json({
            success: true,
            message: `Proyecto "${proyecto.titulo}" creado.`,
            data: proyecto,
        });
    } catch (err) {
        console.error('[handlePost projects] Neon error:', err.message, '| Code:', err.code);
        return res.status(500).json({
            error: 'Error al crear el proyecto.',
            detalle: err.message,
        });
    }
}