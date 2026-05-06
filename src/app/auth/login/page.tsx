"use client";
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
            if (userDoc.exists()) {
                router.push(`/${userDoc.data().rol}`);
            }
        } catch (err) {
            setError("Error al iniciar sesión. Revisa tu correo y CURP.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <input type="email" placeholder="Correo" className="w-full p-3 mb-4 border rounded" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="8 dígitos de CURP" className="w-full p-3 mb-6 border rounded" onChange={(e) => setPassword(e.target.value)} required />
                <button className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold">Entrar</button>
            </form>
        </div>
    );
}