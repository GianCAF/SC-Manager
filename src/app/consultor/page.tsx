"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ClipboardList, User, MapPin, LogOut, ArrowRight, ClipboardCopy } from 'lucide-react';

interface Plantilla {
    id: string;
    titulo: string;
    campos: any[];
    activo: boolean;
}

export default function ConsultorDashboard() {
    const { user, role, loading, logout } = useAuth();
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const router = useRouter();

    // 1. Protección de ruta: Si el rol no es consultor, lo mandamos fuera
    useEffect(() => {
        if (!loading && role !== 'consultor') {
            router.push('/');
        }
    }, [role, loading, router]);

    // 2. Traer solo las plantillas de formularios que estén marcadas como ACTIVAS
    useEffect(() => {
        if (role !== 'consultor') return;

        const q = query(collection(db, "plantillas_formularios"), where("activo", "==", true));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: Plantilla[] = [];
            snapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() } as Plantilla);
            });
            setPlantillas(docs);
            setLoadingDocs(false);
        });

        return () => unsubscribe();
    }, [role]);

    if (loading || loadingDocs) {
        return <div className="p-10 text-center font-bold text-slate-600">Cargando herramientas de campo...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* HEADER ENFOCADO EN MÓVIL */}
            <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                            {user?.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm leading-tight">{user?.displayName}</h2>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-0.5">
                                <MapPin size={10} /> Personal de Campo
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="p-4 max-w-md mx-auto mt-4">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardList className="text-blue-600" size={20} /> Formatos Disponibles
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Selecciona el estudio que vas a aplicar en esta visita:</p>
                </div>

                {/* LISTADO DE TARJETAS DINÁMICAS */}
                {plantillas.length === 0 ? (
                    <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-400 text-sm">
                        No hay formatos asignados para tu zona en este momento.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {plantillas.map((form) => (
                            <div
                                key={form.id}
                                onClick={() => router.push(`/consultor/encuesta/${form.id}`)}
                                className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-blue-500 active:bg-slate-50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <ClipboardCopy size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{form.titulo}</h4>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {form.campos ? form.campos.length : 0} reactivos a evaluar
                                        </p>
                                    </div>
                                </div>
                                <div className="w-7 App-router h-7 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}