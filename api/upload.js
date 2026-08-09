// ============================================================
//  /api/upload.js — Firma de subida para Cloudinary (signed)
//  Genera una firma HMAC-SHA1 válida para uploads seguros.
//  Requiere auth Clerk — solo admins pueden subir imágenes.
//  XionTech — Protocolo 4.2
// ============================================================

import crypto from 'crypto';
import { createClerkClient } from '@clerk/backend';

// ──────────────────────────────────────────────────────────────
//  Utilidades
// ──────────────────────────────────────────────────────────────

async function verificarClerk(req) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader?.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];

        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        const payload = await clerk.verifyToken(token);
        return !!payload?.sub;
    } catch (err) {
        console.error('[verificarClerk] Token inválido:', err.message);
        return false;
    }
}

// ──────────────────────────────────────────────────────────────
//  Handler principal
// ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Método no permitido.' });

    // ✅ Verificación real con Clerk — no solo presencia del header
    const autorizado = await verificarClerk(req);
    if (!autorizado) return res.status(401).json({ error: 'No autorizado.' });

    try {
        const { folder = 'portfolio' } = req.body;

        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!apiSecret) throw new Error('CLOUDINARY_API_SECRET no está definida.');

        const timestamp = Math.round(Date.now() / 1000);

        // ✅ HMAC-SHA1 correcto — Cloudinary rechaza createHash (SHA1 simple)
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature    = crypto
            .createHmac('sha1', apiSecret)
            .update(paramsToSign)
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