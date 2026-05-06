"use client";
import { useState } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { Plus, Trash2, Save, Type, Hash, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Campo {
    id: number;
    label: string;
    tipo: 'texto' | 'numero' | 'foto';
    requerido: boolean;
}

export default function NuevoFormulario() {
    const [titulo, setTitulo] = useState('');
    const [campos, setCampos] = useState<Campo[]>([]);
    const router = useRouter();

    const agregarCampo = (tipo: 'texto' | 'numero' | 'foto') => {
        const nuevoCampo: Campo = {
            id: Date.now(),
            label: '',
            tipo,
            requerido: true
        };
        setCampos([...campos, nuevoCampo]);
    };

    const actualizarLabel = (id: number, texto: string) => {
        setCampos(campos.map(c => c.id === id ? { ...c, label: texto } : c));
    };

    const eliminarCampo = (id: number) => {
        setCampos(campos.filter(c => c.id !== id));
    };

    const guardarPlantilla = async () => {
        if (!titulo || campos.length === 0) return alert("Llena el título y añade al menos un campo");

        try {
            await addDoc(collection(db, "plantillas_formularios"), {
                titulo,
                campos,
                createdAt: new Date().toISOString(),
                activo: true
            });
            alert("¡Formulario guardado con éxito!");
            router.push('/admin');
        } catch (error) {
            console.error("Error guardando:", error);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Diseñador de Formulario</h1>
                <button
                    onClick={guardarPlantilla}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all"
                >
                    <Save size={18} /> Guardar Plantilla
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Título del Formulario</label>
                <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                    placeholder="Ej: Estudio Socioeconómico V1"
                    onChange={(e) => setTitulo(e.target.value)}
                />
            </div>

            {/* Renderizado dinámico de campos */}
            <div className="space-y-4 mb-8">
                {campos.map((campo, index) => (
                    <div key={campo.id} className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                        <div className="flex-grow">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Pregunta #{index + 1} ({campo.tipo})</label>
                            <input
                                type="text"
                                placeholder="Escribe la pregunta aquí..."
                                className="w-full p-2 border rounded mt-1 outline-none"
                                onChange={(e) => actualizarLabel(campo.id, e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => eliminarCampo(campo.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Botones para añadir tipos de campos */}
            <div className="grid grid-cols-3 gap-4">
                <button onClick={() => agregarCampo('texto')} className="flex flex-col items-center p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-slate-600">
                    <Type size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase">Texto</span>
                </button>
                <button onClick={() => agregarCampo('numero')} className="flex flex-col items-center p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-slate-600">
                    <Hash size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase">Número</span>
                </button>
                <button onClick={() => agregarCampo('foto')} className="flex flex-col items-center p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all text-slate-600">
                    <Camera size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase">Evidencia Foto</span>
                </button>
            </div>
        </div>
    );
}