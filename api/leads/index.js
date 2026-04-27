// ============================================================
//  /api/leads/index.js
//  Vercel Serverless Function — Formulario de contacto
//  POST  → guarda un lead nuevo (público, sin auth)
//  GET   → lista los leads entrantes (requiere auth Clerk)
//  PATCH → marca lead como leído (requiere auth Clerk)
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function validarLead({ nombre, email, tipo_problema }) {
    if (!nombre || nombre.trim().length < 2)          return 'El nombre es requerido.';
    if (!email  || !email.includes('@'))               return 'El email no es válido.';
    if (!tipo_problema || tipo_problema.trim() === '') return 'Selecciona el tipo de problema.';
    return null;
}

// ──────────────────────────────────────────────────────────────
//  Handler principal
// ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST')  return await handlePost(req, res);
        if (req.method === 'GET')   return await handleGet(req, res);
        if (req.method === 'PATCH') return await handlePatch(req, res);

        return res.status(405).json({ error: 'Método no permitido.' });
    } catch (error) {
        console.error('[/api/leads] Error inesperado:', error.message);
        return res.status(500).json({ error: 'Error interno. Intenta de nuevo.' });
    }
}

// ──────────────────────────────────────────────────────────────
//  POST — Guardar nuevo lead (formulario público)
// ──────────────────────────────────────────────────────────────

async function handlePost(req, res) {
    const { nombre, email, tipo_problema, mensaje, fuente } = req.body;

    const error = validarLead({ nombre, email, tipo_problema });
    if (error) return res.status(400).json({ error });

    const fuenteFinal = fuente || req.headers['referer'] || 'directa';

    const sql = getDb();

    const [lead] = await sql`
        INSERT INTO leads (nombre, email, tipo_problema, mensaje, fuente)
        VALUES (
            ${nombre.trim()},
            ${email.trim().toLowerCase()},
            ${tipo_problema},
            ${mensaje?.trim() || null},
            ${fuenteFinal}
        )
        RETURNING id, nombre, fecha
    `;

    return res.status(201).json({
        success: true,
        message: '¡Mensaje recibido! Te contactaremos pronto.',
        data: { id: lead.id, nombre: lead.nombre },
    });
}

// ──────────────────────────────────────────────────────────────
//  GET — Listar leads (solo admin autenticado)
// ──────────────────────────────────────────────────────────────

async function handleGet(req, res) {
    const autorizado = await verificarClerk(req);
    if (!autorizado) return res.status(401).json({ error: 'No autorizado.' });

    const { pagina = 1, por_pagina = 20, solo_no_leidos } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(por_pagina);

    const sql = getDb();

    const leads = await sql`
        SELECT
            id, nombre, email, tipo_problema,
            mensaje, fuente, leido, fecha
        FROM leads
        ${solo_no_leidos === 'true' ? sql`WHERE leido = FALSE` : sql``}
        ORDER BY fecha DESC
        LIMIT ${parseInt(por_pagina)}
        OFFSET ${offset}
    `;

    const [{ total }]    = await sql`SELECT COUNT(*) AS total FROM leads`;
    const [{ sin_leer }] = await sql`SELECT COUNT(*) AS sin_leer FROM leads WHERE leido = FALSE`;

    return res.status(200).json({
        success: true,
        data: leads,
        meta: {
            total:      parseInt(total),
            sin_leer:   parseInt(sin_leer),
            pagina:     parseInt(pagina),
            por_pagina: parseInt(por_pagina),
        },
    });
}

// ──────────────────────────────────────────────────────────────
//  PATCH — Marcar lead como leído (solo admin)
// ──────────────────────────────────────────────────────────────

async function handlePatch(req, res) {
    const autorizado = await verificarClerk(req);
    if (!autorizado) return res.status(401).json({ error: 'No autorizado.' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Se requiere el ID del lead.' });

    const sql = getDb();
    await sql`UPDATE leads SET leido = TRUE WHERE id = ${id}`;

    return res.status(200).json({ success: true, message: 'Lead marcado como leído.' });
}