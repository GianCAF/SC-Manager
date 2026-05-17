"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import {
    FilePlus, Users, Settings, FileText, Calendar, ChevronRight, UserPlus, Phone, MapPin, Shield,
    Trash2, Plus, Save, Type, Hash, AlignLeft, Loader2, AlertCircle,
    CheckCircle2, Eye, LayoutGrid, X, BarChart3
} from 'lucide-react';

interface Campo {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea';
    required: boolean;
}

interface Plantilla {
    id: string;
    titulo: string;
    descripcion: string;
    campos: Campo[];
    createdAt: string;
    activo: boolean;
}

export default function AdminDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    // Navigation state
    const [vistaActiva, setVistaActiva] = useState<'dashboard' | 'editor' | 'registrar-consultor' | 'metricas'>('dashboard');

    // Data states
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [totalEncuestasSincronizadas, setTotalEncuestasSincronizadas] = useState(0);

    // Form states
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [campos, setCampos] = useState<Campo[]>([]);

    // Individual field generator states
    const [labelCampo, setLabelCampo] = useState('');
    const [tipoCampo, setTipoCampo] = useState<'text' | 'number' | 'date' | 'textarea'>('text');
    const [requeridoCampo, setRequeridoCampo] = useState(true);

    // Consultant registration states
    const [nombreCon, setNombreCon] = useState('');
    const [emailCon, setEmailCon] = useState('');
    const [curpCon, setCurpCon] = useState('');
    const [municipioCon, setMunicipioCon] = useState('');
    const [telefonoCon, setTelefonoCon] = useState('');
    const [direccionCon, setDireccionCon] = useState('');

    // Feedback states
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Security route protection
    useEffect(() => {
        if (!loading && role !== 'admin') {
            router.push('/');
        }
    }, [role, loading, router]);

    // Real-time Firestore listeners
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

        const calcularMetricas = async () => {
            try {
                const snap = await getDocs(collection(db, "respuestas_formularios"));
                setTotalEncuestasSincronizadas(snap.size);
            } catch (err) {
                console.error("Error al recuperar métricas:", err);
            }
        };
        calcularMetricas();

        return () => unsubscribe();
    }, [role]);

    // --- Dynamic Form Builder Logic ---
    const agregarCampoALista = () => {
        if (!labelCampo.trim()) {
            setErrorMsg("La etiqueta del campo no puede estar vacía.");
            return;
        }
        const nuevoCampo: Campo = {
            id: Date.now().toString(),
            label: labelCampo.trim(),
            type: tipoCampo,
            required: requeridoCampo
        };
        setCampos([...campos, nuevoCampo]);
        setLabelCampo('');
        setErrorMsg('');
    };

    // ⚡ ACTUALIZACIÓN EN CALIENTE: Permite editar cualquier propiedad de un campo ya existente
    const modificarCampoExistente = (id: string, propiedadesNuevas: Partial<Campo>) => {
        setCampos(campos.map(campo => campo.id === id ? { ...campo, ...propiedadesNuevas } : campo));
    };

    const eliminarCampoDeLista = (id: string) => {
        setCampos(campos.filter(c => c.id !== id));
    };

    const abrirEditorPlantilla = (plantilla: Plantilla) => {
        setEditandoId(plantilla.id);
        setTitulo(plantilla.titulo);
        setDescripcion(plantilla.descripcion || '');
        setCampos(plantilla.campos || []);
        setErrorMsg('');
        setVistaActiva('editor');
    };

    const abrirCreadorNuevo = () => {
        setEditandoId(null);
        setTitulo('');
        setDescripcion('');
        setCampos([]);
        setErrorMsg('');
        setVistaActiva('editor');
    };

    const handleGuardarPlantilla = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim()) {
            setErrorMsg("El título es obligatorio.");
            return;
        }
        if (campos.length === 0) {
            setErrorMsg("Debes agregar al menos un campo al formulario.");
            return;
        }

        // Validar que ningún campo existente haya quedado en blanco tras editarlo
        const tieneCamposVacios = campos.some(c => !c.label.trim());
        if (tieneCamposVacios) {
            setErrorMsg("Todas las preguntas de los campos deben tener un texto válido.");
            return;
        }

        setSubmitting(true);
        setErrorMsg('');

        try {
            const datosPlantilla = {
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                campos: campos.map(c => ({ ...c, label: c.label.trim() })), // Limpiamos espacios extras
                activo: true,
                updatedAt: new Date().toISOString()
            };

            if (editandoId) {
                await updateDoc(doc(db, "plantillas_formularios", editandoId), datosPlantilla);
                setSuccessMsg("¡Estructura de formulario actualizada con éxito!");
            } else {
                await addDoc(collection(db, "plantillas_formularios"), {
                    ...datosPlantilla,
                    createdAt: new Date().toISOString()
                });
                setSuccessMsg("¡Nuevo formato publicado exitosamente!");
            }

            setTimeout(() => {
                setSuccessMsg('');
                setVistaActiva('dashboard');
            }, 1500);

        } catch (err: any) {
            setErrorMsg("Error al procesar la operación: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEliminarPlantilla = async () => {
        if (!editandoId) return;
        const confirmar = window.confirm("¿Estás seguro de eliminar permanentemente esta plantilla?\nEsta acción afectará el renderizado de encuestas históricas.");
        if (!confirmar) return;

        try {
            setSubmitting(true);
            await deleteDoc(doc(db, "plantillas_formularios", editandoId));
            setSuccessMsg("Plantilla eliminada correctamente.");
            setTimeout(() => {
                setSuccessMsg('');
                setVistaActiva('dashboard');
            }, 1500);
        } catch (err: any) {
            setErrorMsg("No se pudo eliminar: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Consultant Registration Logic ---
    const handleRegistroConsultor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (curpCon.length !== 18) {
            setErrorMsg("La CURP debe tener exactamente 18 caracteres.");
            return;
        }

        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await fetch('/api/auth/admin/register-consultor/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombreCon,
                    email: emailCon,
                    curp: curpCon.toUpperCase(),
                    municipio: municipioCon,
                    telefono: telefonoCon,
                    direccion: direccionCon
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al registrar al consultor");
            }

            setSuccessMsg(`¡Consultor registrado! Contraseña inicial: ${data.password_generated}`);
            setNombreCon('');
            setEmailCon('');
            setCurpCon('');
            setMunicipioCon('');
            setTelefonoCon('');
            setDireccionCon('');

        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || loadingDocs) return <div className="p-10 text-center font-semibold text-slate-600">Cargando panel de control...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-lg">S</div>
                    <span className="font-black text-slate-800 tracking-tight text-lg">Socio<span className="text-blue-600 font-medium">Manager</span></span>
                </div>
                <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Modo Administrador
                </div>
            </header>

            {/* WORKSPACE */}
            <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6">

                {/* SIDEBAR */}
                <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 md:sticky md:top-24 h-fit">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-3">Módulos</p>

                    <button
                        onClick={() => { setVistaActiva('dashboard'); setErrorMsg(''); setSuccessMsg(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'dashboard' || vistaActiva === 'editor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <LayoutGrid size={18} />
                        Formatos Activos
                    </button>

                    <button
                        onClick={() => { setVistaActiva('registrar-consultor'); setErrorMsg(''); setSuccessMsg(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'registrar-consultor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <UserPlus size={18} />
                        Registrar Consultor
                    </button>

                    <button
                        onClick={() => { setVistaActiva('metricas'); setErrorMsg(''); setSuccessMsg(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'metricas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <BarChart3 size={18} />
                        Métricas del Sistema
                    </button>
                </aside>

                {/* CONTAINER */}
                <main className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[520px]">

                    {successMsg && !vistaActiva.includes('registrar') && (
                        <div className="mb-4 bg-green-50 text-green-800 border border-green-100 p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
                            <CheckCircle2 size={16} className="text-green-600" /> {successMsg}
                        </div>
                    )}

                    {/* VISTA 1: DASHBOARD DE FORMATOS */}
                    {vistaActiva === 'dashboard' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">Estructuras de Captura</h1>
                                    <p className="text-xs text-slate-400 mt-0.5">Diseño y control de cuestionarios para el personal de campo.</p>
                                </div>
                                <button
                                    onClick={abrirCreadorNuevo}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-1.5"
                                >
                                    <Plus size={16} /> Diseñar Formulario
                                </button>
                            </div>

                            <div className="space-y-3">
                                {plantillas.length === 0 ? (
                                    <div className="border-2 border-dashed border-slate-100 text-slate-400 rounded-xl p-8 text-center text-xs font-medium">No has diseñado ninguna plantilla todavía.</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {plantillas.map((form) => (
                                            <div
                                                key={form.id}
                                                onClick={() => abrirEditorPlantilla(form)}
                                                className="border border-slate-100 hover:border-blue-300 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group border-l-4 border-l-blue-600"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center text-xs font-black group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                        {form.campos ? form.campos.length : 0}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm transition-colors">{form.titulo}</h4>
                                                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Calendar size={11} /> Publicado el {new Date(form.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VISTA 2: CONSTRUCTOR / EDITOR DINÁMICO DE FORMULARIO */}
                    {vistaActiva === 'editor' && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{editandoId ? "Modo Editor" : "Diseñador"}</span>
                                    <h2 className="text-lg font-black text-slate-900 mt-1">{editandoId ? `Modificar Formato` : "Nueva Plantilla de Captura"}</h2>
                                </div>
                                {editandoId && (
                                    <button type="button" onClick={handleEliminarPlantilla} disabled={submitting} className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all self-start"><Trash2 size={13} /> Eliminar Formato</button>
                                )}
                            </div>

                            {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-100 text-xs font-medium"><AlertCircle size={16} /> {errorMsg}</div>}

                            <form onSubmit={handleGuardarPlantilla} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Título del Formulario *</label><input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Censo" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all font-semibold" /></div>
                                    <div className="space-y-1"><label className="text-xs font-bold text-slate-700">Descripción / Objetivo</label><input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Notas básicas" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-500" /></div>
                                </div>

                                {/* INSERTAR PREGUNTAS NUEVAS */}
                                <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1"><Plus size={14} className="text-blue-600" /> Crear Nuevo Campo</p>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                        <div className="md:col-span-6 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Pregunta / Etiqueta</label><input type="text" value={labelCampo} onChange={(e) => setLabelCampo(e.target.value)} placeholder="Ej. Nombre(s)" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" /></div>
                                        <div className="md:col-span-3 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Respuesta</label><select value={tipoCampo} onChange={(e) => setTipoCampo(e.target.value as any)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none h-8"><option value="text">Texto Corto</option><option value="number">Numérica</option><option value="date">Fecha (Calendario)</option><option value="textarea">Párrafo Largo</option></select></div>
                                        <div className="md:col-span-2 flex items-center h-8 justify-start md:justify-center"><label className="flex items-center gap-1.5 cursor-pointer select-none"><input type="checkbox" checked={requeridoCampo} onChange={(e) => setRequeridoCampo(e.target.checked)} className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5" /><span className="text-xs font-bold text-slate-600">Requerido</span></label></div>
                                        <div className="md:col-span-1"><button type="button" onClick={agregarCampoALista} className="w-full h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow"><Plus size={16} /></button></div>
                                    </div>
                                </div>

                                {/* ⚡ ESTRUCTURA DE CAMPOS EDICIÓN EN CALIENTE EN LA LISTA SECUENCIAL */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-tight flex items-center gap-1">
                                        <FileText size={14} className="text-slate-400" /> Lista de Reactivos Activos ({campos.length})
                                    </label>

                                    {campos.length === 0 ? (
                                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">El formato no tiene campos asignados aún.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1">
                                            {campos.map((campo, index) => (
                                                <div key={campo.id} className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-all">

                                                    {/* Izquierda: Indicador Numérico e Inputs de Edición In-Place */}
                                                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                                                        <span className="w-6 h-6 bg-slate-200 text-slate-600 font-black text-[10px] rounded-full flex items-center justify-center shrink-0">
                                                            {index + 1}
                                                        </span>

                                                        {/* Input para cambiar el nombre/label del campo de inmediato */}
                                                        <div className="flex-1 sm:max-w-xs">
                                                            <input
                                                                type="text"
                                                                value={campo.label}
                                                                placeholder="Nombre de la pregunta..."
                                                                onChange={(e) => modificarCampoExistente(campo.id, { label: e.target.value })}
                                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                            />
                                                        </div>

                                                        {/* Selector para cambiar el Tipo de Dato en caliente */}
                                                        <div>
                                                            <select
                                                                value={campo.type}
                                                                onChange={(e) => modificarCampoExistente(campo.id, { type: e.target.value as any })}
                                                                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all h-7"
                                                            >
                                                                <option value="text">Texto Corto</option>
                                                                <option value="number">Numérica</option>
                                                                <option value="date">Fecha</option>
                                                                <option value="textarea">Párrafo Largo</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Derecha: Check de Requerido y Botón Eliminar */}
                                                    <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                                                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={campo.required}
                                                                onChange={(e) => modificarCampoExistente(campo.id, { required: e.target.checked })}
                                                                className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                                                            />
                                                            <span className="text-[11px] font-bold text-slate-500">Requerido</span>
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarCampoDeLista(campo.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {editandoId ? "Guardar Modificaciones" : "Compilar Formato"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* VISTA 3: REGISTRO DE CONSULTORES */}
                    {vistaActiva === 'registrar-consultor' && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"><UserPlus size={20} /></div>
                                <div><h1 className="text-lg font-black text-slate-900">Registrar Personal de Campo</h1><p className="text-xs text-slate-400">Agrega un nuevo consultor con expediente completo al sistema.</p></div>
                            </div>
                            <form onSubmit={handleRegistroConsultor} className="space-y-4">
                                {errorMsg && <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 rounded-r-lg text-xs font-medium"><AlertCircle size={18} className="shrink-0" /> {errorMsg}</div>}
                                {successMsg && <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3 text-green-700 rounded-r-lg text-xs font-medium"><CheckCircle2 size={18} className="shrink-0" /> {successMsg}</div>}
                                <div className="space-y-1"><label className="block text-xs font-bold text-slate-700">Nombre Completo *</label><input type="text" required value={nombreCon} disabled={submitting} placeholder="Ej: Juan Pérez Gómez" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium" onChange={(e) => setNombreCon(e.target.value)} /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="block text-xs font-bold text-slate-700">Correo Electrónico *</label><input type="email" required value={emailCon} disabled={submitting} placeholder="consultor@empresa.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium" onChange={(e) => setEmailCon(e.target.value)} /></div>
                                    <div className="space-y-1"><label className="block text-xs font-bold text-slate-700">Teléfono de Contacto *</label><div className="relative"><Phone className="absolute left-3 top-2.5 text-slate-400" size={14} /><input type="tel" required value={telefonoCon} disabled={submitting} placeholder="10 dígitos" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium" onChange={(e) => setTelefonoCon(e.target.value)} /></div></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="block text-xs font-bold text-slate-700">Municipio de Asignación *</label><input type="text" required value={municipioCon} disabled={submitting} placeholder="Ej: Tlaxcoapan" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium" onChange={(e) => setMunicipioCon(e.target.value)} /></div>
                                    <div className="space-y-1"><label className="block text-xs font-bold text-slate-700">CURP (18 caracteres) *</label><input type="text" required value={curpCon} disabled={submitting} maxLength={18} placeholder="Escribe la CURP..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-black uppercase tracking-wider" onChange={(e) => setCurpCon(e.target.value)} /></div>
                                </div>
                                <div className="space-y-1"><label className="block text-xs font-bold text-slate-700">Dirección Particular *</label><div className="relative"><MapPin className="absolute left-3 top-2.5 text-slate-400" size={14} /><input type="text" required value={direccionCon} disabled={submitting} placeholder="Calle, Número, Colonia, C.P." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium" onChange={(e) => setDireccionCon(e.target.value)} /></div><p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 italic"><Shield size={11} /> Al guardar, los primeros 8 caracteres de la CURP funcionarán como su contraseña de acceso provisional.</p></div>
                                <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-50 disabled:opacity-60 text-xs">{submitting ? "Procesando Credenciales..." : "Registrar y Activar Cuenta de Campo"}</button>
                            </form>
                        </div>
                    )}

                    {/* VISTA 4: METRICAS */}
                    {vistaActiva === 'metricas' && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="border-b border-slate-100 pb-4"><h1 className="text-lg font-black text-slate-900">Métricas de Rendimiento</h1><p className="text-xs text-slate-400">Auditoría del estado del almacenamiento y sincronización de datos de la PWA.</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl"><span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Flujo de Campo</span><h3 className="text-3xl font-black text-blue-600 mt-1">{totalEncuestasSincronizadas}</h3><p className="text-xs text-slate-500 mt-1 font-medium">Encuestas respondidas por consultores y sincronizadas con la nube.</p></div>
                                <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl"><span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estructura Base</span><h3 className="text-3xl font-black text-slate-800 mt-1">{plantillas.length}</h3><p className="text-xs text-slate-500 mt-1 font-medium">Formatos de formularios dinámicos creados y disponibles globalmente.</p></div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}