// ============================================================
//  lib/cloudinary.js — Utilidades de Cloudinary
//  Solo para uso en el FRONTEND (/src)
//  La subida real ocurre directo desde el browser a Cloudinary
//  (unsigned preset) — nunca pasa por las Serverless Functions
//  JVSoftware — Protocolo 4.2
// ============================================================

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ──────────────────────────────────────────────────────────────
//  SUBIDA DE IMAGEN
// ──────────────────────────────────────────────────────────────

/**
 * Sube una imagen directo a Cloudinary usando un unsigned preset.
 * Retorna el secure_url para guardar en Neon.
 *
 * @param {File}   file    - Archivo de imagen del input
 * @param {object} [opts]
 * @param {string} [opts.folder='portfolio']    - Carpeta en Cloudinary
 * @param {string} [opts.transformation]        - String de transformación
 * @param {function} [opts.onProgress]          - Callback de progreso (0-100)
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number }>}
 */
export async function uploadImage(file, opts = {}) {
    const {
        folder         = 'portfolio',
        transformation = 'w_800,h_450,c_fill,q_auto,f_webp',
        onProgress,
    } = opts;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error(
            'VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET ' +
            'deben estar definidas en .env.local'
        );
    }

    // Validaciones de seguridad básicas
    validateImageFile(file);

    const formData = new FormData();
    formData.append('file',           file);
    formData.append('upload_preset',  UPLOAD_PRESET);
    formData.append('folder',         folder);
    if (transformation) {
        formData.append('transformation', transformation);
    }

    // XMLHttpRequest para progreso real (fetch no soporta upload progress)
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });
        }

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve({
                        url:       data.secure_url,
                        publicId:  data.public_id,
                        width:     data.width,
                        height:    data.height,
                        format:    data.format,
                    });
                } catch {
                    reject(new Error('Respuesta inválida de Cloudinary.'));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err.error?.message || `Error ${xhr.status} de Cloudinary.`));
                } catch {
                    reject(new Error(`Error ${xhr.status} al subir la imagen.`));
                }
            }
        });

        xhr.addEventListener('error',  () => reject(new Error('Error de red al subir la imagen.')));
        xhr.addEventListener('abort',  () => reject(new Error('Subida cancelada.')));

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
        xhr.send(formData);
    });
}

// ──────────────────────────────────────────────────────────────
//  TRANSFORMACIONES DE URL (para mostrar imágenes optimizadas)
// ──────────────────────────────────────────────────────────────

/**
 * Retorna una URL de Cloudinary con transformaciones aplicadas.
 * Útil para mostrar thumbnails sin re-subir la imagen.
 *
 * @param {string} url    - URL original de Cloudinary
 * @param {object} [opts]
 * @param {number}  [opts.width=800]
 * @param {number}  [opts.height=450]
 * @param {string}  [opts.crop='fill']
 * @param {string}  [opts.format='webp']
 * @param {string}  [opts.quality='auto']
 * @returns {string}
 *
 * EJEMPLO:
 *   getOptimizedUrl(project.url_imagen, { width: 400, height: 225 })
 */
export function getOptimizedUrl(url, opts = {}) {
    if (!url || !url.includes('cloudinary.com')) return url;

    const {
        width   = 800,
        height  = 450,
        crop    = 'fill',
        format  = 'webp',
        quality = 'auto',
    } = opts;

    const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

    // Insertar transformación en la URL de Cloudinary
    return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Retorna la URL del thumbnail (versión pequeña) de una imagen de portafolio.
 *
 * @param {string} url
 * @returns {string}
 */
export function getThumbnailUrl(url) {
    return getOptimizedUrl(url, { width: 400, height: 225 });
}

// ──────────────────────────────────────────────────────────────
//  VALIDACIÓN
// ──────────────────────────────────────────────────────────────

/**
 * Valida que el archivo sea una imagen y no supere el límite de tamaño.
 * Lanza un Error con mensaje claro si falla.
 *
 * @param {File} file
 * @param {object} [opts]
 * @param {number} [opts.maxSizeMB=5]
 */
export function validateImageFile(file, opts = {}) {
    const { maxSizeMB = 5 } = opts;

    if (!file) {
        throw new Error('No se seleccionó ningún archivo.');
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            `Tipo de archivo no permitido: ${file.type}. ` +
            'Usa JPG, PNG, WebP o GIF.'
        );
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        throw new Error(`La imagen supera el límite de ${maxSizeMB}MB.`);
    }
}