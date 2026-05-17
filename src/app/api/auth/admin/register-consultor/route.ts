import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. 👇 EXTRAEMOS LOS NUEVOS CAMPOS DEL BODY
        const { email, curp, nombre, municipio, telefono, direccion } = await request.json();

        // 2. 👇 VALIDAMOS QUE NINGUNO VENGA VACÍO
        if (!email || !curp || !nombre || !municipio || !telefono || !direccion) {
            return NextResponse.json({
                success: false,
                error: "Todos los campos son obligatorios (incluyendo teléfono y dirección)."
            }, { status: 400 });
        }

        // Extraemos los primeros 8 caracteres de la CURP en mayúsculas para la contraseña inicial
        const passwordInicial = curp.substring(0, 8).toUpperCase();

        // 3. Crear el usuario en Firebase Authentication
        const userRecord = await adminAuth.createUser({
            email,
            password: passwordInicial,
            displayName: nombre,
            emailVerified: true
        });

        // 4. 👇 GUARDAMOS EL EXPEDIENTE COMPLETO EN FIRESTORE
        await adminDb.collection('usuarios').doc(userRecord.uid).set({
            uid: userRecord.uid,
            nombre,
            email,
            curp: curp.toUpperCase(),
            municipio,
            telefono,    // 👈 Guardado en la BD
            direccion,   // 👈 Guardado en la BD
            rol: 'consultor',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: "Consultor registrado exitosamente",
            password_generated: passwordInicial
        });

    } catch (error: any) {
        console.error("Error al registrar consultor:", error);
        return NextResponse.json({
            success: false,
            error: error.code === 'auth/email-already-exists'
                ? "El correo electrónico ya está registrado."
                : error.message
        }, { status: 500 });
    }
}