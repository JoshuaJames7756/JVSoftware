// ============================================================
//  /api/upload.js — Firma de subida para Cloudinary (opcional)
//  Solo necesario si cambias el preset a "signed" en Cloudinary
//  Por defecto el proyecto usa "unsigned" — este archivo queda
//  disponible si quieres mayor seguridad en producción.
//  JVSoftware — Protocolo 4.2
// ============================================================

import crypto from 'crypto';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Método no permitido.' });

    // Verificar que venga de un admin autenticado (Clerk)
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado.' });
    }

    try {
        const { folder = 'portfolio' } = req.body;

        const timestamp  = Math.round(Date.now() / 1000);
        const apiSecret  = process.env.CLOUDINARY_API_SECRET;

        if (!apiSecret) {
            throw new Error('CLOUDINARY_API_SECRET no está definida.');
        }

        // Crear la firma HMAC-SHA1 requerida por Cloudinary
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature    = crypto
            .createHash('sha1')
            .update(paramsToSign + apiSecret)
            .digest('hex');

        return res.status(200).json({
            signature,
            timestamp,
            api_key:    process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
            folder,
        });
    } catch (err) {
        console.error('[/api/upload] Error:', err.message);
        return res.status(500).json({ error: 'No se pudo generar la firma.' });
    }
}