"use client";
import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, FileText, Loader2, User, Clock, ArrowLeft, ClipboardCheck, AlertCircle } from 'lucide-react';

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
}

interface RegistroEncuesta {
    id: string;
    plantillaId: string;
    formatoTitulo: string;
    createdAt: string;
    respuestas: { [key: string]: any };
}

// 🧠 Selector de Fecha por Tres Clics Integrado
function SelectorFechaDinamico({ required, disabled, onChange }: { required: boolean, disabled: boolean, onChange: (val: string) => void }) {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();

    const [dia, setDia] = useState('');
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState('');

    const anios = Array.from({ length: anioActual - 1920 + 1 }, (_, i) => anioActual - i);
    const meses = [
        { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
    ];
    const dias = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

    useEffect(() => {
        if (dia && mes && anio) {
            onChange(`${anio}-${mes}-${dia}`);
        }
    }, [dia, mes, anio, onChange]);

    return (
        <div className="grid grid-cols-3 gap-2 mt-1">
            {/* Diá, Mes, Año selectores */}
            <select required={required} disabled={disabled} value={dia} onChange={(e) => setDia(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 outline-none text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Día</option>{dias.map(d => <option key={d} value={d}>{d}</option>)}</select>
            <select required={required} disabled={disabled} value={mes} onChange={(e) => setMes(e.target.value)} className="w-full px-2 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 outline-none text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Mes</option>{meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
            <select required={required} disabled={disabled} value={anio} onChange={(e) => setAnio(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 outline-none text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Año</option>{anios.map(a => <option key={a} value={a}>{a}</option>)}</select>
        </div>
    );
}

export default function DashboardConsultor() {
    const { user, role, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    // Estados de navegación interna SPA (Single Page Experience)
    // Valores: 'registros' | 'detalle-registro' | 'agendar' | 'llenar'
    const [vistaActiva, setVistaActiva] = useState<'registros' | 'detalle-registro' | 'agendar' | 'llenar'>('registros');

    const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroEncuesta | null>(null);
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<Plantilla | null>(null);

    // Estados de datos de Firestore
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [registros, setRegistros] = useState<RegistroEncuesta[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Estados para el motor de llenado interno
    const [respuestasForm, setRespuestasForm] = useState<{ [key: string]: string }>({});
    const [submittingForm, setSubmittingForm] = useState(false);
    const [errorForm, setErrorForm] = useState('');
    const [successForm, setSuccessForm] = useState(false);

    useEffect(() => {
        if (!authLoading && role !== 'consultor') {
            router.push('/auth/login');
        }
    }, [role, authLoading, router]);

    // Función reutilizable para cargar datos de Firestore
    const cargarDatosDashboard = async () => {
        if (!user?.uid) return;
        try {
            setLoadingData(true);

            const qPlantillas = collection(db, "plantillas_formularios");
            const snapPlantillas = await getDocs(qPlantillas);
            const listaPlantillas = snapPlantillas.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Plantilla[];
            setPlantillas(listaPlantillas);

            const qRegistros = query(collection(db, "respuestas_formularios"), where("encuestador.uid", "==", user.uid));
            const snapRegistros = await getDocs(qRegistros);
            const listaRegistros = snapRegistros.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RegistroEncuesta[];

            listaRegistros.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setRegistros(listaRegistros);

        } catch (err) {
            console.error("Error al sincronizar el panel:", err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (role === 'consultor') cargarDatosDashboard();
    }, [user, role]);

    const formatIdaFecha = (isoString: string) => {
        if (!isoString) return 'Fecha no disponible';
        const d = new Date(isoString);
        return d.toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Helper de UX: Extrae dinámicamente el nombre completo guardado en las respuestas
    // 🧠 Extractor inteligente ajustado al formato: Nombre(s), Apellido Paterno, Apellido Materno
    const obtenerNombreResumen = (respuestas: { [key: string]: any }) => {
        const llaves = Object.keys(respuestas);

        // Función para estandarizar el texto (quita acentos, paréntesis y espacios de más)
        const normalizar = (txt: string) =>
            txt.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Quita acentos
                .replace(/[()]/g, "")           // Quita paréntesis como los de Nombre(s)
                .trim();

        // Buscamos las llaves reales usando búsquedas difusas normalizadas
        const llaveNombre = llaves.find(k => {
            const limpio = normalizar(k);
            return limpio.includes('nombre') && !limpio.includes('paterno') && !limpio.includes('materno');
        });
        const llavePaterno = llaves.find(k => normalizar(k).includes('paterno'));
        const llaveMaterno = llaves.find(k => normalizar(k).includes('materno'));

        if (llaveNombre) {
            const nom = respuestas[llaveNombre] || '';
            const pat = llavePaterno ? respuestas[llavePaterno] || '' : '';
            const mat = llaveMaterno ? respuestas[llaveMaterno] || '' : '';

            // Unimos y limpiamos espacios dobles si el usuario no metió algún apellido
            const completo = `${nom} ${pat} ${mat}`.trim().replace(/\s+/g, ' ');
            if (completo) return completo;
        }

        // Fallback de seguridad si el formato cambia drásticamente
        if (llaves.length > 0) return String(respuestas[llaves[0]]);
        return "Expediente de Campo";
    };

    // Manejador del submit del formulario integrado
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hoyStr = new Date().toISOString().split('T')[0];
        for (const campo of plantillaSeleccionada?.campos || []) {
            if (campo.type === 'date' && respuestasForm[campo.id] > hoyStr) {
                setErrorForm(`La fecha en '${campo.label}' no puede ser posterior al día de hoy.`);
                return;
            }
        }

        setSubmittingForm(true);
        setErrorForm('');

        try {
            await addDoc(collection(db, "respuestas_formularios"), {
                plantillaId: plantillaSeleccionada?.id,
                formatoTitulo: plantillaSeleccionada?.titulo,
                respuestas: respuestasForm,
                encuestador: { uid: user.uid, nombre: user.displayName, email: user.email },
                createdAt: new Date().toISOString()
            });

            setSuccessForm(true);
            setRespuestasForm({});

            // Sincronizamos la lista en segundo plano y volvemos
            await cargarDatosDashboard();

            setTimeout(() => {
                setSuccessForm(false);
                setVistaActiva('registros');
            }, 1500);

        } catch (err: any) {
            setErrorForm("No se guardó el registro: " + err.message);
        } finally {
            setSubmittingForm(false);
        }
    };

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-500 text-sm font-semibold">Cargando interfaz unificada...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-lg">S</div>
                    <span className="font-black text-slate-800 tracking-tight text-lg">Socio<span className="text-blue-600 font-medium">Manager</span></span>
                </div>
                <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {user?.displayName}
                </div>
            </header>

            {/* REJILLA DE TRABAJO */}
            <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6">

                {/* MENÚ IZQUIERDO ESTÁTICO (SIEMPRE VISIBLE) */}
                <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 md:sticky md:top-24 h-fit">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-3">Opciones</p>

                    <button
                        onClick={() => { setVistaActiva('registros'); setErrorForm(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'registros' || vistaActiva === 'detalle-registro'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <ClipboardList size={18} />
                        Ver Registros
                    </button>

                    <button
                        onClick={() => { setVistaActiva('agendar'); setErrorForm(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'agendar' || vistaActiva === 'llenar'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Calendar size={18} />
                        Agendar Encuesta
                    </button>
                </aside>

                {/* CONTENEDOR DE CONTENIDO DINÁMICO DERECHO */}
                <main className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[450px]">

                    {/* FASE 1: HISTORIAL DE RESÚMENES */}
                    {vistaActiva === 'registros' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-lg font-black text-slate-900">Historial de Registros</h2>
                                <p className="text-xs text-slate-400">Selecciona un beneficiario para auditar su expediente completo.</p>
                            </div>

                            {registros.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-sm">No hay expedientes capturados en tu bitácora.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {registros.map((reg) => (
                                        <div
                                            key={reg.id}
                                            onClick={() => { setRegistroSeleccionado(reg); setVistaActiva('detalle-registro'); }}
                                            className="border border-slate-100 hover:border-blue-200 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                                        >
                                            {/* ⚡ Resaltado de Nombre en Azul Contraste de Alta UX */}
                                            <h3 className="font-extrabold text-blue-600 text-base tracking-wide uppercase">
                                                {obtenerNombreResumen(reg.respuestas)}
                                            </h3>
                                            {/* Fecha y actualización debajo */}
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1.5">
                                                <Clock size={12} className="text-slate-300" />
                                                Realizado el: <span className="text-slate-600 font-semibold">{formatIdaFecha(reg.createdAt)}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FASE 2: DETALLE DEL REGISTRO EN EL MISMO ESPACIO */}
                    {vistaActiva === 'detalle-registro' && registroSeleccionado && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Expediente Completo</span>
                                    <h2 className="text-xl font-black text-slate-900 mt-1 uppercase text-blue-600 tracking-wide">
                                        {obtenerNombreResumen(registroSeleccionado.respuestas)}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Capturado en: {registroSeleccionado.formatoTitulo}</p>
                                </div>
                                {/* ⚡ Botón Cerrar Expediente integrado en el espacio */}
                                <button
                                    onClick={() => { setVistaActiva('registros'); setRegistroSeleccionado(null); }}
                                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md self-start md:self-center"
                                >
                                    Cerrar Expediente
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3.5">
                                {Object.entries(registroSeleccionado.respuestas).map(([campoId, valor]) => (
                                    <div key={campoId} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{campoId}</p>
                                        <p className="text-sm font-bold text-slate-800 mt-1">
                                            {typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}$/)
                                                ? valor.split('-').reverse().join('/') // Formato dd/mm/yyyy
                                                : String(valor)
                                            }
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FASE 3: LISTADO DE FORMATOS PARA AGENDAR */}
                    {vistaActiva === 'agendar' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-lg font-black text-slate-900">Formatos de Encuesta</h2>
                                <p className="text-xs text-slate-400">Selecciona un formato para abrir el formulario de captura inmediatamente abajo.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {plantillas.map((formato) => (
                                    <div key={formato.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{formato.titulo}</h4>
                                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{formato.descripcion}</p>
                                        </div>
                                        <button
                                            onClick={() => { setPlantillaSeleccionada(formato); setVistaActiva('llenar'); }}
                                            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md shrink-0"
                                        >
                                            Seleccionar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FASE 4: FORMULARIO DE CAPTURA EN EL MISMO ESPACIO */}
                    {vistaActiva === 'llenar' && plantillaSeleccionada && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">Captura Activa</span>
                                    <h2 className="text-lg font-black text-slate-900 mt-1">{plantillaSeleccionada.titulo}</h2>
                                </div>
                                <button
                                    onClick={() => { setVistaActiva('agendar'); setErrorForm(''); }}
                                    className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1"
                                >
                                    <ArrowLeft size={14} /> Cambiar Formato
                                </button>
                            </div>

                            {successForm ? (
                                <div className="py-12 text-center space-y-2">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow animate-bounce"><ClipboardCheck size={24} /></div>
                                    <h3 className="font-black text-slate-900 text-base">¡Guardado Exitosamente!</h3>
                                    <p className="text-xs text-slate-400">Sincronizando bitácora general...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    {errorForm && (
                                        <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-100 text-xs font-medium">
                                            <AlertCircle size={16} /> {errorForm}
                                        </div>
                                    )}

                                    {plantillaSeleccionada.campos.map((campo) => (
                                        <div key={campo.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                {campo.label} {campo.required && <span className="text-red-500">*</span>}
                                            </label>

                                            {campo.type === 'text' && (
                                                <input type="text" required={campo.required} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setRespuestasForm({ ...respuestasForm, [campo.id]: e.target.value })} />
                                            )}

                                            {campo.type === 'number' && (
                                                <input type="number" required={campo.required} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setRespuestasForm({ ...respuestasForm, [campo.id]: e.target.value })} />
                                            )}

                                            {campo.type === 'date' && (
                                                <SelectorFechaDinamico required={campo.required} disabled={submittingForm} onChange={(valor) => setRespuestasForm({ ...respuestasForm, [campo.id]: valor })} />
                                            )}

                                            {campo.type === 'textarea' && (
                                                <textarea rows={3} required={campo.required} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => setRespuestasForm({ ...respuestasForm, [campo.id]: e.target.value })} />
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="submit" disabled={submittingForm}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs tracking-wide transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2"
                                    >
                                        {submittingForm ? <Loader2 className="animate-spin" size={16} /> : "Guardar y Sincronizar Registro"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}