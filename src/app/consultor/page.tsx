"use client";
import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, FileText, Loader2, User, Clock, MapPin, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Plantilla {
    id: string;
    titulo: string;
    descripcion: string;
}

interface RegistroEncuesta {
    id: string;
    plantillaId: string;
    formatoTitulo: string;
    createdAt: string;
    respuestas: { [key: string]: any };
}

export default function DashboardConsultor() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    // Estados de navegación interna
    const [seccionActiva, setSeccionActiva] = useState<'registros' | 'agendar'>('registros');
    const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroEncuesta | null>(null);

    // Estados de datos de Firestore
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [registros, setRegistros] = useState<RegistroEncuesta[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Redirección de seguridad
    useEffect(() => {
        if (!authLoading && role !== 'consultor') {
            router.push('/auth/login');
        }
    }, [role, authLoading, router]);

    // Carga paralela de Formatos y Respuestas del Consultor
    useEffect(() => {
        async function cargarDatosDashboard() {
            if (!user?.uid) return;
            try {
                setLoadingData(true);

                // 1. Recuperar formatos disponibles (plantillas)
                const qPlantillas = collection(db, "plantillas_formularios");
                const snapPlantillas = await getDocs(qPlantillas);
                const listaPlantillas = snapPlantillas.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Plantilla[];
                setPlantillas(listaPlantillas);

                // 2. Recuperar registros completados por este consultor específico
                const qRegistros = query(
                    collection(db, "respuestas_formularios"),
                    where("encuestador.uid", "==", user.uid)
                );
                const snapRegistros = await getDocs(qRegistros);
                const listaRegistros = snapRegistros.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as RegistroEncuesta[];

                // Ordenamos cronológicamente de más reciente a más antiguo de forma manual
                listaRegistros.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setRegistros(listaRegistros);

            } catch (err) {
                console.error("Error al sincronizar el panel del consultor:", err);
            } finally {
                setLoadingData(false);
            }
        }

        if (role === 'consultor') cargarDatosDashboard();
    }, [user, role]);

    // Helper para formatear fechas estéticamente
    const formatIdaFecha = (isoString: string) => {
        if (!isoString) return 'Fecha no disponible';
        const d = new Date(isoString);
        return d.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-500 text-sm font-semibold">Sincronizando bitácora de campo...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* BARRA SUPERIOR DE PERFIL */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-lg tracking-wider">S</div>
                    <span className="font-black text-slate-800 tracking-tight text-lg">Socio<span className="text-blue-600 font-medium">Manager</span></span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <User size={14} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{user?.displayName || 'Consultor Autorizado'}</span>
                    <span className="bg-blue-600 text-[10px] uppercase tracking-widest text-white px-2 py-0.5 rounded-md font-extrabold">Campo</span>
                </div>
            </header>

            {/* CONTENEDOR PRINCIPAL DISPUESTO EN REJILLA */}
            <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6">

                {/* MENU LATERAL IZQUIERDO */}
                <aside className="w-full md:w-64 shrink-0 self-start bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 sticky top-24">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-3">Navegación</p>

                    <button
                        onClick={() => setSeccionActiva('registros')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${seccionActiva === 'registros'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <ClipboardList size={18} />
                        Ver Registros
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-md font-black ${seccionActiva === 'registros' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {registros.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setSeccionActiva('agendar')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${seccionActiva === 'agendar'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Calendar size={18} />
                        Agendar Encuesta
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-md font-black ${seccionActiva === 'agendar' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {plantillas.length}
                        </span>
                    </button>
                </aside>

                {/* CONTENIDO PRINCIPAL DERECHO */}
                <main className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[400px]">

                    {/* SECCIÓN 1: LISTADO DE REGISTROS YA REALIZADOS */}
                    {seccionActiva === 'registros' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-lg font-black text-slate-900">Historial de Registros Levantados</h2>
                                <p className="text-xs text-slate-400">Listado de cuestionarios recopilados y sincronizados en campo.</p>
                            </div>

                            {registros.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                    <FileText className="text-slate-300 mb-2" size={40} />
                                    <p className="text-sm font-bold text-slate-700">No has levantado registros aún</p>
                                    <p className="text-xs text-slate-400 max-w-xs mt-0.5">Ve a la pestaña "Agendar Encuesta" para iniciar tu captura inicial de datos.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {registros.map((reg) => (
                                        <div
                                            key={reg.id}
                                            onClick={() => setRegistroSeleccionado(reg)}
                                            className="group border border-slate-100 hover:border-blue-200 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                                        >
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                                                    {reg.formatoTitulo || 'Estudio sin Título'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-slate-500">
                                                        <Clock size={12} className="text-blue-500" />
                                                        {formatIdaFecha(reg.createdAt)}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-300">ID: {reg.id.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECCIÓN 2: FORMATOS DISPONIBLES PARA AGENDAR/LLENAR */}
                    {seccionActiva === 'agendar' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-lg font-black text-slate-900">Formatos Disponibles</h2>
                                <p className="text-xs text-slate-400">Selecciona el estudio socioeconómico que vas a aplicar en esta visita:</p>
                            </div>

                            {plantillas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                    <FileText className="text-slate-300 mb-2" size={40} />
                                    <p className="text-sm font-bold text-slate-700">No hay formatos asignados</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Comunícate con el administrador para que te asigne cuestionarios.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {plantillas.map((formato) => (
                                        <div key={formato.id} className="border border-slate-100 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between items-start gap-4 hover:border-slate-200 transition-all">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        <FileText size={18} />
                                                    </div>
                                                    <h3 className="font-bold text-slate-800 text-sm md:text-base">{formato.titulo}</h3>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed pl-10">{formato.descripcion}</p>
                                            </div>
                                            <Link
                                                href={`/consultor/llenar/${formato.id}`}
                                                className="w-full text-center bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 tracking-wide block"
                                            >
                                                Aplicar Formato Digital
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </main>
            </div>

            {/* 👁️ MODAL FLOTANTE DE DETALLE COMPLETO DEL REGISTRO */}
            {registroSeleccionado && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 animate-scale-up">

                        {/* Header del Modal */}
                        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Expediente Capturado</span>
                                <h3 className="font-bold text-slate-900 text-base leading-tight mt-1">{registroSeleccionado.formatoTitulo}</h3>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Clock size={12} /> Sincronizado el {formatIdaFecha(registroSeleccionado.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => setRegistroSeleccionado(null)}
                                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Contenido / Respuestas dinámicas mapeadas */}
                        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-white">
                            {Object.keys(registroSeleccionado.respuestas).length === 0 ? (
                                <p className="text-xs text-center text-slate-400 py-6">Este registro fue guardado sin campos.</p>
                            ) : (
                                Object.entries(registroSeleccionado.respuestas).map(([campoId, valor]) => (
                                    <div key={campoId} className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl space-y-1">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide">{campoId}</p>
                                        <p className="text-sm font-bold text-slate-800 break-words">
                                            {typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}$/)
                                                ? valor.split('-').reverse().join('/') // Formatea visualmente YYYY-MM-DD a DD/MM/YYYY
                                                : String(valor)
                                            }
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer de cierre */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center rounded-b-2xl">
                            <button
                                onClick={() => setRegistroSeleccionado(null)}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                            >
                                Cerrar Expediente
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}