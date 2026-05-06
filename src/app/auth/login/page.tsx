"use client";
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Autenticar con Firebase Auth usando el correo y los 8 dígitos de la CURP
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // 2. Obtener el documento del usuario desde la colección 'usuarios'
            const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));

            if (userDoc.exists()) {
                const rol = userDoc.data().rol;
                // 3. Redirección inteligente: Si es admin va a /admin, si es consultor a /consultor, etc.
                router.push(`/${rol}`);
            } else {
                setError("El usuario autenticado no tiene un perfil configurado en la base de datos.");
            }
        } catch (err) {
            console.error(err);
            setError("Error al iniciar sesión. Revisa que tu correo y los 8 dígitos de tu CURP sean correctos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900">Bienvenido</h2>
                    <p className="text-slate-500 mt-2">Ingresa al sistema de gestión socioeconómica</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 rounded-r-lg">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="email"
                                required
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                                placeholder="ejemplo@consultora.com"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña (CURP)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="password"
                                required
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                                placeholder="Primeros 8 caracteres de tu CURP"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 italic">
                            * Nota: Tu contraseña inicial corresponde a los primeros 8 dígitos de tu CURP en mayúsculas.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Verificando identidad..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
}