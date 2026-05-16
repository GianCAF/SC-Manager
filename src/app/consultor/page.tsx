"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { FileText, ClipboardList, LogOut, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Formato {
    id: string;
    titulo: string;
    descripcion: string;
    campos: any[];
}

export default function DashboardConsultor() {
    const { user, role, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const [formatos, setFormatos] = useState<Formato[]>([]);
    const [loadingFormatos, setLoadingFormatos] = useState(true);

    // 1. 🛡️ Protección de ruta: Solo consultores entran
    useEffect(() => {
        if (!authLoading && role !== 'consultor') {
            router.push('/auth/login');
        }
    }, [role, authLoading, router]);

    // 2. 🔌 Escucha Global en Tiempo Real (Sin filtros de municipios)
    useEffect(() => {
        if (role !== 'consultor') return;

        // Escuchamos la colección completa de plantillas
        const q = query(collection(db, "plantillas_formularios"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: Formato[] = [];
            snapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() } as Formato);
            });
            setFormatos(docs);
            setLoadingFormatos(false);
        }, (error) => {
            console.error("Error al escuchar formatos de Firestore:", error);
            setLoadingFormatos(false);
        });

        return () => unsubscribe();
    }, [role]);

    if (authLoading || loadingFormatos) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-500 text-sm font-medium">Cargando herramientas de campo...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header Móvil */}
            <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10 px-4 py-3">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            S
                        </div>
                        <span className="font-bold text-slate-800 text-base">Socio <span className="text-blue-600">Manager</span></span>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-50"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 mt-6">
                {/* Perfil del Consultor */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-base tracking-wide">{user?.displayName || "Personal de Campo"}</h2>
                            <p className="text-xs text-slate-400">Consultor Autorizado</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <ClipboardList size={18} className="text-slate-700" />
                    <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Formatos Disponibles</h3>
                </div>

                {/* Lista de Formatos */}
                {formatos.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center shadow-sm">
                        <p className="text-sm text-slate-400 font-medium max-w-[240px] mx-auto">
                            No hay formatos creados en el sistema todavía.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formatos.map((formato) => (
                            <button
                                key={formato.id}
                                onClick={() => router.push(`/consultor/llenar/${formato.id}`)}
                                className="w-full bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between text-left shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
                            >
                                <div className="flex items-center gap-3.5 pr-2">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors mb-0.5">
                                            {formato.titulo}
                                        </h4>
                                        <p className="text-xs text-slate-500 line-clamp-1">
                                            {formato.descripcion || "Formulario para recolección de datos socioeconómicos."}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}