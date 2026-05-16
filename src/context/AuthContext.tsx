"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
    user: any;
    role: string | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Intentamos recuperar el rol de inmediato de la caché local para evitar la pantalla de carga
        const cachedRole = localStorage.getItem('user_role');
        if (cachedRole) {
            setRole(cachedRole);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Si hay un rol cacheado, lo usamos y bajamos la bandera de carga rápido
                if (cachedRole) {
                    setLoading(false);
                }

                try {
                    // Buscamos en Firestore en segundo plano para validar/actualizar si cambió el rol
                    const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
                    if (userDoc.exists()) {
                        const currentRole = userDoc.data().rol;
                        setRole(currentRole);
                        localStorage.setItem('user_role', currentRole); // 💾 Actualizamos caché
                    }
                } catch (error) {
                    console.error("Error al obtener rol del usuario:", error);
                }
            } else {
                // Si no hay usuario logueado, limpiamos todo
                setRole(null);
                localStorage.removeItem('user_role'); // 🧹 Limpiamos caché
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setRole(null);
            localStorage.removeItem('user_role'); // 🧹 Limpieza absoluta
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);