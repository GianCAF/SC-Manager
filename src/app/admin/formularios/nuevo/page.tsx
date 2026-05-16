"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
    Plus, Trash2, Save, ArrowLeft, Layout, ListChecks, AlertCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Campo {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea';
    required: boolean;
}

export default function DiseñadorFormularios() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [campos, setCampos] = useState<Campo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. 🛡️ Protección de Ruta instantánea con el localStorage optimizado
    if (authLoading) return <div className="p-10 text-center animate-pulse">Cargando constructor...</div>;
    if (role !== 'admin') {
        router.push('/');
        return null;
    }

    // --- Lógica del Diseñador Dinámico ---
    const agregarCampo = () => {
        const nuevoCampo: Campo = {
            id: Date.now().toString(),
            label: '',
            type: 'text',
            required: true
        };
        setCampos([...campos, nuevoCampo]);
    };

    const actualizarCampo = (id: string, updates: Partial<Campo>) => {
        setCampos(campos.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const eliminarCampo = (id: string) => {
        setCampos(campos.filter(c => c.id !== id));
    };

    const guardarPlantilla = async () => {
        if (!titulo || campos.length === 0) {
            setError("Debes asignar un título y al menos un campo al formulario.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Guardamos el esquema del formulario global en Firestore
            await addDoc(collection(db, "plantillas_formularios"), {
                titulo,
                descripcion,
                campos,
                creadoPor: user.uid,
                createdAt: new Date().toISOString(),
                activo: true
            });

            router.push('/admin'); // 👈 Regresa al Dashboard principal
        } catch (err: any) {
            setError("Error al guardar la plantilla: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* HEADER SUPERIOR */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-800">Diseñador de Formulario</h1>
                    </div>
                    <button
                        onClick={guardarPlantilla}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Publicar para Campo
                    </button>
                </div>
            </div>

            {/* ÁREA DE TRABAJO EN REJILLA */}
            <main className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* IZQUIERDA: CONFIGURACIÓN GENERAL */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layout size={16} /> Identidad del Formato
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Título del Formulario</label>
                                <input
                                    type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Encuesta de Vulnerabilidad"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción u Objetivo</label>
                                <textarea
                                    rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Explica brevemente para qué sirve este levantamiento..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <p className="text-xs font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* DERECHA: CONSTRUCTOR DE REACTIVOS */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <ListChecks size={16} /> Estructura de Reactivos ({campos.length})
                        </h3>
                        <button
                            onClick={agregarCampo}
                            className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus size={18} /> Añadir Campo
                        </button>
                    </div>

                    {campos.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus size={32} />
                            </div>
                            <p className="text-slate-400 font-medium">Haz clic en "Añadir Campo" para empezar a diseñar tu encuesta.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {campos.map((campo, index) => (
                                <div key={campo.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-end">
                                    <div className="flex-grow w-full">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">
                                            Pregunta / Etiqueta {index + 1}
                                        </label>
                                        <input
                                            type="text" value={campo.label}
                                            onChange={(e) => actualizarCampo(campo.id, { label: e.target.value })}
                                            placeholder="¿Cuál es su...?"
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                                        />
                                    </div>

                                    <div className="w-full md:w-48">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5">Tipo de Respuesta</label>
                                        <select
                                            value={campo.type}
                                            onChange={(e) => actualizarCampo(campo.id, { type: e.target.value as any })}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50 outline-none text-sm font-medium"
                                        >
                                            <option value="text">Abierta (Texto)</option>
                                            <option value="number">Numérica</option>
                                            <option value="date">Fecha</option>
                                            <option value="textarea">Párrafo Largo</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => eliminarCampo(campo.id)}
                                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-end md:mb-0.5"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}