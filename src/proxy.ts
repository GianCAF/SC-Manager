import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Obtenemos el token o la sesión de la cookie (necesitaremos configurar esto)
    // Por ahora, haremos una validación básica de rutas
    const { pathname } = request.nextUrl;

    // Ejemplo: Si intenta entrar a /admin pero no está validado (esto se pulirá con Firebase Admin)
    if (pathname.startsWith('/admin')) {
        // Lógica de protección que activaremos cuando configuremos las Cookies de sesión
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/consultor/:path*', '/cliente/:path*'],
};

