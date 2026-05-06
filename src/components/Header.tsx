"use client";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { LogOut, User, LayoutDashboard, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-blue-700 flex items-center gap-2">
                    <LayoutDashboard size={20} /> Socio<span className="text-slate-800">Manager</span>
                </Link>
                <div className="flex items-center space-x-4">
                    {loading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold hidden sm:block uppercase text-blue-600">{role}</span>
                            <button onClick={handleLogout} className="p-2 hover:text-red-600"><LogOut size={20} /></button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Iniciar Sesión</Link>
                    )}
                </div>
            </div>
        </header>
    );
}