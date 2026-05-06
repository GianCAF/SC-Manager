"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { FilePlus, Users, Settings, FileText, Calendar, ChevronRight } from 'lucide-react';

interface Plantilla {
    id: string;
    titulo: string;
    campos: any[];
    createdAt: string;
    activo: boolean;
}

export default function AdminDashboard() {
    const { user, role, loading } = useAuth();
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const router = useRouter();

    // 1. Protección de ruta: Si no es admin, fuera.
    useEffect(() => {
        if (!loading && role !== 'admin') {
            router.push('/');
        }
    }, [role, loading, router]);

    // 2. Escuchar las plantillas de formularios en tiempo real
    useEffect(() => {
        if (role !== 'admin') return;

        const q = query(collection(db, "plantillas_formularios"), orderBy("createdAt", "desc"));

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

    if (loading || loadingDocs) return <div className="p-10 text-center font-semibold text-slate-600">Cargando panel de control...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
                    <p className="text-slate-500">Gestión global de la consultora socioeconómica</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 text-sm font-medium">
                    Conexión Segura
                </div>
            </header>

            {/* ACCIONES PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link
                    href="/admin/formularios/nuevo"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all block group"
                >
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FilePlus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Diseñar Formulario</h3>
                    <p className="text-slate-500 text-sm mt-1">Crea nuevas plantillas dinámicas con preguntas personalizadas y campos de evidencia.</p>
                </Link>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Registrar Consultor</h3>
                    <p className="text-slate-500 text-sm mt-1">Da de alta al personal de campo y automatiza sus claves de acceso mediante su CURP.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-4">
                        <Settings size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Métricas del Sistema</h3>
                    <p className="text-slate-500 text-sm mt-1">Monitorea el avance de las encuestas, sincronización local y uso de almacenamiento en la PWA.</p>
                </div>
            </div>

            {/* SECCIÓN MÁS IMPORTANTE: LISTADO DE FORMULARIOS REALES */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText size={22} className="text-blue-600" /> Plantillas de Formularios Activas ({plantillas.length})
                </h2>

                {plantillas.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                        No has creado ninguna plantilla todavía. Da clic arriba en "Diseñar Formulario" para comenzar.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plantillas.map((form) => (
                            <div
                                key={form.id}
                                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold">
                                        {form.campos ? form.campos.length : 0}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{form.titulo}</h4>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12} /> Creado el {new Date(form.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-green-50 text-green-700">
                                        Activo
                                    </span>
                                    <ChevronRight size={18} className="text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}