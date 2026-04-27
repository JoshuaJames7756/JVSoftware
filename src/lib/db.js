// ============================================================
//  lib/db.js — Cliente de base de datos Neon
//  SOLO usar en archivos dentro de /api — NUNCA en /src
//  JVSoftware — Protocolo 4.2
// ============================================================

import { neon } from '@neondatabase/serverless';

let _sql = null;

/**
 * Retorna una instancia del cliente SQL de Neon.
 * Usa un singleton por proceso para no abrir conexiones innecesarias.
 *
 * @returns {import('@neondatabase/serverless').NeonQueryFunction}
 */
export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error(
            '[db.js] DATABASE_URL no está definida. ' +
            'Agrégala en .env.local (desarrollo) o en Variables de Entorno de Vercel (producción).'
        );
    }

    if (!_sql) {
        _sql = neon(process.env.DATABASE_URL);
    }

    return _sql;
}

/**
 * Utilidad para hacer queries con manejo de errores centralizado.
 * Útil para queries únicas que no necesitan transacciones.
 *
 * @param {function} queryFn - Función que recibe `sql` y retorna una query
 * @returns {Promise<any>}
 *
 * EJEMPLO:
 *   const projects = await query(sql => sql`SELECT * FROM projects WHERE activo = TRUE`);
 */
export async function query(queryFn) {
    const sql = getDb();
    try {
        return await queryFn(sql);
    } catch (err) {
        console.error('[db.js] Query error:', err.message);
        throw err;
    }
}