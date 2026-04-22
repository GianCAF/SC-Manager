import * as admin from 'firebase-admin';

// Esta función previene que Firebase se inicialice más de una vez 
// durante el "Hot Reload" en desarrollo.
if (!admin.apps.length) {
    try {
        // Limpiamos la llave privada para asegurar que los saltos de línea sean correctos
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            // Opcional: Si necesitas Storage desde el servidor, añade el bucket aquí
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
        });

        console.log("✅ Firebase Admin inicializado correctamente");
    } catch (error) {
        console.error("❌ Error al inicializar Firebase Admin:", error);
    }
}

// Exportamos las instancias para usarlas en nuestras API Routes
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();