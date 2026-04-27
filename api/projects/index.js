const { neon } = require('@neondatabase/serverless');

function getDb() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no definida.');
    return neon(process.env.DATABASE_URL);
}

async function verificarClerk(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    try {
        const r = await fetch('https://api.clerk.com/v1/tokens/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}` },
            body: JSON.stringify({ token }),
        });
        return r.ok;
    } catch { return false; }
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET')  return await handleGet(req, res);
        if (req.method === 'POST') return await handlePost(req, res);
        return res.status(405).json({ error: 'Método no permitido.' });
    } catch (error) {
        console.error('[/api/projects] Error:', error.message);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

async function handleGet(req, res) {
    const sql = getDb();
    const projects = await sql`
        SELECT id, titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden, fecha_creacion
        FROM projects
        WHERE activo = TRUE
        ORDER BY orden ASC, fecha_creacion DESC
    `;
    return res.status(200).json({ success: true, data: projects, total: projects.length });
}

async function handlePost(req, res) {
    const autorizado = await verificarClerk(req);
    if (!autorizado) return res.status(401).json({ error: 'No autorizado.' });

    const { titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden } = req.body;

    if (!titulo || !descripcion_corta || !problema_resuelto || !url_imagen) {
        return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    if (!Array.isArray(tecnologias) || tecnologias.length === 0) {
        return res.status(400).json({ error: 'tecnologias debe ser un array.' });
    }

    const sql = getDb();
    const [proyecto] = await sql`
        INSERT INTO projects (titulo, descripcion_corta, problema_resuelto, url_imagen, tecnologias, orden)
        VALUES (${titulo}, ${descripcion_corta}, ${problema_resuelto}, ${url_imagen}, ${tecnologias}, ${orden ?? 0})
        RETURNING id, titulo, fecha_creacion
    `;

    return res.status(201).json({ success: true, message: `Proyecto "${proyecto.titulo}" creado.`, data: proyecto });
}