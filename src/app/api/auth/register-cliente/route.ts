import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/adminConfig'; // Asegúrate de tener tu configuración de admin de Firebase

export async function POST(request: Request) {
    try {
        const { email, curp, nombre, consultorId, municipio, respuestasAsociadas } = await request.json();

        if (!email || !curp || !nombre) {
            return NextResponse.json({ error: 'Faltan datos mandatorios (Email, CURP, Nombre)' }, { status: 400 });
        }

        // 1. Extraer los primeros 8 dígitos de la CURP para la contraseña provisional
        const provisionalPassword = curp.substring(0, 8).toUpperCase();

        if (provisionalPassword.length < 6) {
            return NextResponse.json({ error: 'La CURP provista es demasiado corta para generar una contraseña' }, { status: 400 });
        }

        // 2. Crear el usuario en Firebase Auth usando Admin SDK
        const userRecord = await adminAuth.createUser({
            email: email.trim(),
            password: provisionalPassword,
            displayName: nombre.trim(),
        });

        // 3. Establecer Custom Claims para asegurar el rol de 'cliente'
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'cliente' });

        // 4. Guardar su expediente de acceso en la colección 'usuarios' de Firestore
        await adminDb.collection('usuarios').doc(userRecord.uid).set({
            uid: userRecord.uid,
            nombre: nombre.trim(),
            email: email.trim().toLowerCase(),
            curp: curp.toUpperCase(),
            municipio: municipio || '',
            role: 'cliente',
            consultorAsignado: consultorId,
            createdAt: new Date().toISOString(),
            estadoCuenta: 'activo'
        });

        return NextResponse.json({
            success: true,
            uid: userRecord.uid,
            message: 'Cuenta de cliente creada y vinculada con éxito.'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error en el registro automático del cliente:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}