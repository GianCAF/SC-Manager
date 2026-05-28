"use client";
import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ClipboardList, Calendar, FileText, Loader2, Clock, ArrowLeft, ClipboardCheck, AlertCircle, Search, X, Edit2, Save } from 'lucide-react';

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

function SelectorFechaDinamico({ required, disabled, value, onChange }: { required: boolean, disabled: boolean, value?: string, onChange: (val: string) => void }) {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();

    const [anio, mes, dia] = value ? value.split('-') : ['', '', ''];

    const anios = Array.from({ length: anioActual - 1920 + 1 }, (_, i) => anioActual - i);
    const meses = [
        { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
    ];
    const dias = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

    return (
        <div className="grid grid-cols-3 gap-2 mt-1">
            <select required={required} disabled={disabled} value={dia} onChange={(e) => onChange(`${anio || anioActual}-${mes || '01'}-${e.target.value}`)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Día</option>{dias.map(d => <option key={d} value={d}>{d}</option>)}</select>
            <select required={required} disabled={disabled} value={mes} onChange={(e) => onChange(`${anio || anioActual}-${e.target.value}-${dia || '01'}`)} className="w-full px-2 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Mes</option>{meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
            <select required={required} disabled={disabled} value={anio} onChange={(e) => onChange(`${e.target.value}-${mes || '01'}-${dia || '01'}`)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"><option value="">Año</option>{anios.map(a => <option key={a} value={a}>{a}</option>)}</select>
        </div>
    );
}

export default function DashboardConsultor() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();

    const [vistaActiva, setVistaActiva] = useState<'registros' | 'detalle-registro' | 'agendar' | 'llenar'>('registros');
    const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroEncuesta | null>(null);
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<Plantilla | null>(null);

    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [registros, setRegistros] = useState<RegistroEncuesta[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [filtroBusqueda, setFiltroBusqueda] = useState('');

    const [respuestasForm, setRespuestasForm] = useState<{ [key: string]: string }>({});
    const [submittingForm, setSubmittingForm] = useState(false);
    const [errorForm, setErrorForm] = useState('');
    const [successForm, setSuccessForm] = useState(false);

    const [mostrarToast, setMostrarToast] = useState(false);
    const [animarToast, setAnimarToast] = useState(false);

    const [editandoExpediente, setEditandoExpediente] = useState(false);
    const [respuestasEditadas, setRespuestasEditadas] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (!authLoading && role !== 'consultor') {
            router.push('/auth/login');
        }
    }, [role, authLoading, router]);

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

            const qRegistros = collection(db, "respuestas_formularios");
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

    const obtenerNombreResumen = (reg: RegistroEncuesta) => {
        const respuestas = reg.respuestas;
        const llaves = Object.keys(respuestas);

        const normalizar = (txt: string) =>
            txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[()]/g, "").trim();

        const plantillaOriginal = plantillas.find(p => p.id === reg.plantillaId);
        if (plantillaOriginal && plantillaOriginal.campos) {
            const campoNom = plantillaOriginal.campos.find(c => {
                const l = normalizar(c.label);
                return l.includes('nombre') && !l.includes('paterno') && !l.includes('materno');
            });
            const campoPat = plantillaOriginal.campos.find(c => normalizar(c.label).includes('paterno'));
            const campoMat = plantillaOriginal.campos.find(c => normalizar(c.label).includes('materno'));

            if (campoNom) {
                const nom = respuestas[campoNom.label] || '';
                const pat = campoPat ? respuestas[campoPat.label] || '' : '';
                const mat = campoMat ? respuestas[campoMat.label] || '' : '';
                const completo = `${nom} ${pat} ${mat}`.trim().replace(/\s+/g, ' ');
                if (completo) return completo;
            }
        }

        const llaveNombre = llaves.find(k => {
            const l = normalizar(k);
            return l.includes('nombre') && !l.includes('paterno') && !l.includes('materno');
        });
        const llavePaterno = llaves.find(k => normalizar(k).includes('paterno'));
        const llaveMaterno = llaves.find(k => normalizar(k).includes('materno'));

        if (llaveNombre) {
            const nom = respuestas[llaveNombre] || '';
            const pat = llavePaterno ? respuestas[llavePaterno] || '' : '';
            const mat = llaveMaterno ? respuestas[llaveMaterno] || '' : '';
            const completo = `${nom} ${pat} ${mat}`.trim().replace(/\s+/g, ' ');
            if (completo) return completo;
        }

        if (llaves.length > 0) {
            const llavesOrdenadas = [...llaves].sort();
            const llaveFiltro = llavesOrdenadas.find(k => !normalizar(k).includes('fecha') && !normalizar(k).includes('curp')) || llavesOrdenadas[0];
            return String(respuestas[llaveFiltro]);
        }

        return "Expediente de Campo";
    };

    const handleInputChange = (campoLabel: string, campoId: string, valor: string) => {
        let valorProcesado = valor;
        if (campoLabel.toLowerCase().includes('curp')) {
            valorProcesado = valor.toUpperCase();
        }
        setRespuestasForm({ ...respuestasForm, [campoId]: valorProcesado });
    };

    const dispararToastError = (mensaje: string) => {
        setErrorForm(mensaje);
        setMostrarToast(true);
        setTimeout(() => setAnimarToast(true), 50);

        setTimeout(() => {
            setAnimarToast(false);
            setTimeout(() => setMostrarToast(false), 200);
        }, 3000);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const hoyStr = new Date().toISOString().split('T')[0];
        for (const campo of plantillaSeleccionada?.campos || []) {
            if (campo.type === 'date' && respuestasForm[campo.id] > hoyStr) {
                dispararToastError(`La fecha en '${campo.label}' no puede ser posterior al día de hoy.`);
                return;
            }
        }

        setSubmittingForm(true);
        setErrorForm('');

        try {
            let emailCliente = '';
            let curpCliente = '';
            let nombreCon = '';
            let patCon = '';
            let matCon = '';
            let municipioCliente = '';

            const normalizar = (txt: string) =>
                txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[()]/g, "").trim();

            plantillaSeleccionada?.campos.forEach(campo => {
                const lbl = normalizar(campo.label);
                const val = (respuestasForm[campo.id] || '').trim();

                if (lbl.includes('correo') || lbl.includes('email')) {
                    emailCliente = val;
                } else if (lbl.includes('curp')) {
                    curpCliente = val.toUpperCase();
                } else if (lbl.includes('nombre') && !lbl.includes('paterno') && !lbl.includes('materno')) {
                    nombreCon = val;
                } else if (lbl.includes('paterno')) {
                    patCon = val;
                } else if (lbl.includes('materno')) {
                    matCon = val;
                } else if (lbl.includes('municipio') || lbl.includes('localidad')) {
                    municipioCliente = val;
                }
            });

            if (!curpCliente || curpCliente.length !== 18) {
                throw new Error("La CURP es obligatoria y debe contener exactamente 18 caracteres.");
            }

            const qValidarCurp = query(
                collection(db, "respuestas_formularios"),
                where(`respuestas.CURP`, "==", curpCliente)
            );
            const snapValidar = await getDocs(qValidarCurp);

            if (!snapValidar.empty) {
                throw new Error(`La CURP "${curpCliente}" ya está registrada en otro expediente.`);
            }

            if (emailCliente) {
                const nombreCompletoCliente = `${nombreCon} ${patCon} ${matCon}`.trim().replace(/\s+/g, ' ') || "Cliente Registrado";

                await fetch('/api/auth/register-cliente/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailCliente,
                        curp: curpCliente,
                        nombre: nombreCompletoCliente,
                        municipio: municipioCliente,
                        consultorId: user.uid
                    })
                });
            }

            const respuestasEstructuradas: { [key: string]: any } = {};
            plantillaSeleccionada?.campos.forEach(campo => {
                respuestasEstructuradas[campo.label] = (campo.label.toUpperCase() === 'CURP')
                    ? curpCliente
                    : (respuestasForm[campo.id] || '');
            });

            await addDoc(collection(db, "respuestas_formularios"), {
                plantillaId: plantillaSeleccionada?.id,
                formatoTitulo: plantillaSeleccionada?.titulo,
                respuestas: respuestasEstructuradas,
                encuestador: { uid: user.uid, nombre: user.displayName, email: user.email },
                createdAt: new Date().toISOString()
            });

            setSuccessForm(true);
            setRespuestasForm({});
            await cargarDatosDashboard();

            setTimeout(() => {
                setSuccessForm(false);
                setVistaActiva('registros');
            }, 1500);

        } catch (err: any) {
            dispararToastError(err.message);
        } finally {
            setSubmittingForm(false);
        }
    };

    const handleActualizarExpediente = async () => {
        if (!registroSeleccionado?.id) return;
        setSubmittingForm(true);
        setErrorForm('');

        try {
            const respuestasLimpias = { ...respuestasEditadas };
            Object.keys(respuestasLimpias).forEach(key => {
                if (key.toLowerCase().includes('curp') && typeof respuestasLimpias[key] === 'string') {
                    respuestasLimpias[key] = respuestasLimpias[key].toUpperCase();
                }
            });

            const docRef = doc(db, "respuestas_formularios", registroSeleccionado.id);
            await updateDoc(docRef, {
                respuestas: respuestasLimpias,
                modificadoAt: new Date().toISOString()
            });

            const registroActualizado = {
                ...registroSeleccionado,
                respuestas: respuestasLimpias
            };

            setRegistroSeleccionado(registroActualizado);
            setEditandoExpediente(false);
            setSuccessForm(true);
            await cargarDatosDashboard();

            setTimeout(() => setSuccessForm(false), 1500);

        } catch (err: any) {
            dispararToastError("No se pudieron guardar los cambios: " + err.message);
        } finally {
            setSubmittingForm(false);
        }
    };

    const registrosFiltrados = registros.filter(reg => {
        const nombreCompleto = obtenerNombreResumen(reg).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const busquedaLimpia = filtroBusqueda.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombreCompleto.includes(busquedaLimpia);
    });

    if (authLoading || loadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-500 text-sm font-semibold">Cargando interfaz unificada...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden pb-24">

            {/* TOAST DE ERROR */}
            {mostrarToast && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto">
                    <div className={`bg-red-600 border border-red-700 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${animarToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
                        <AlertCircle size={20} className="shrink-0 mt-0.5 animate-pulse text-red-100" />
                        <div className="flex-1"><p className="text-xs font-black uppercase tracking-wider text-red-200">Alerta de Registro</p><p className="text-xs font-bold mt-0.5 leading-relaxed">{errorForm}</p></div>
                        <button onClick={() => { setAnimarToast(false); setTimeout(() => setMostrarToast(false), 200); }} className="p-1 hover:bg-red-700/60 rounded-lg transition-colors text-red-200 hover:text-white"><X size={14} /></button>
                    </div>
                </div>
            )}

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

            {/* REJILLA SPA */}
            <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6">

                {/* MENÚ IZQUIERDO */}
                <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 md:sticky md:top-24 h-fit">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 mb-3">Opciones</p>
                    <button onClick={() => { setVistaActiva('registros'); setErrorForm(''); setFiltroBusqueda(''); setEditandoExpediente(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'registros' || (vistaActiva === 'detalle-registro' && !editandoExpediente) ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}><ClipboardList size={18} />Ver Registros</button>
                    <button onClick={() => { setVistaActiva('agendar'); setErrorForm(''); setEditandoExpediente(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${vistaActiva === 'agendar' || vistaActiva === 'llenar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}><Calendar size={18} />Agendar Encuesta</button>
                </aside>

                {/* PANEL DERECHO */}
                <main className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[450px]">

                    {/* HISTORIAL DE RESÚMENES */}
                    {vistaActiva === 'registros' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-lg font-black text-slate-900">Historial de Registros</h2>
                                <p className="text-xs text-slate-400">Selecciona un beneficiario para auditar su expediente completo.</p>
                            </div>
                            {registros.length > 0 && (
                                <div className="relative w-full mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Search size={16} /></div>
                                    <input type="text" value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} placeholder="Busca por nombre y/o apellidos" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner" />
                                </div>
                            )}
                            {registros.length === 0 ? (<div className="text-center py-12 text-slate-400 text-sm">No hay expedientes capturados en tu bitácora.</div>) : registrosFiltrados.length === 0 ? (<div className="text-center py-12 text-slate-400 text-sm">No se encontraron coincidencias para "{filtroBusqueda}".</div>) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {registrosFiltrados.map((reg) => (
                                        <div key={reg.id} onClick={() => { setRegistroSeleccionado(reg); setVistaActiva('detalle-registro'); setEditandoExpediente(false); }} className="border border-slate-100 hover:border-blue-300 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-600 animate-in fade-in duration-150">
                                            <h3 className="font-black text-blue-700 text-base tracking-wide uppercase">{obtenerNombreResumen(reg)}</h3>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-2"><Clock size={12} className="text-slate-300" />Realizado el: <span className="text-slate-600 font-semibold">{formatIdaFecha(reg.createdAt)}</span></p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DETALLE Y EDICIÓN DEL REGISTRO DINÁMICO */}
                    {vistaActiva === 'detalle-registro' && registroSeleccionado && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <div className="border-b border-slate-100 pb-3">
                                <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    {editandoExpediente ? "Modo Edición Activo" : "Expediente Completo"}
                                </span>
                                <h2 className="text-xl font-black text-blue-700 mt-1 uppercase tracking-wide">
                                    {obtenerNombreResumen(registroSeleccionado)}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">Capturado en: {registroSeleccionado.formatoTitulo}</p>
                            </div>

                            {successForm && (
                                <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                    <ClipboardCheck size={16} /> ¡Expediente actualizado y sincronizado correctamente!
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3.5">
                                {(() => {
                                    const plantillaAsociada = plantillas.find(p => p.id === registroSeleccionado.plantillaId);

                                    if (plantillaAsociada && plantillaAsociada.campos && plantillaAsociada.campos.length > 0) {
                                        return plantillaAsociada.campos.map((campo) => {
                                            const valorRespuesta = editandoExpediente
                                                ? respuestasEditadas[campo.label]
                                                : registroSeleccionado.respuestas[campo.label];

                                            const valorString = valorRespuesta !== undefined && valorRespuesta !== null ? String(valorRespuesta) : '';

                                            return (
                                                <div key={campo.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        {campo.label} {campo.required && editandoExpediente && <span className="text-red-500">*</span>}
                                                    </label>

                                                    {editandoExpediente ? (
                                                        <>
                                                            {campo.type === 'text' && (
                                                                <input type="text" value={valorString} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setRespuestasEditadas({ ...respuestasEditadas, [campo.label]: e.target.value })} />
                                                            )}
                                                            {campo.type === 'number' && (
                                                                <input type="number" value={valorString} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setRespuestasEditadas({ ...respuestasEditadas, [campo.label]: e.target.value })} />
                                                            )}
                                                            {campo.type === 'date' && (
                                                                <SelectorFechaDinamico required={campo.required} disabled={submittingForm} value={valorString} onChange={(valor) => setRespuestasEditadas({ ...respuestasEditadas, [campo.label]: valor })} />
                                                            )}
                                                            {campo.type === 'textarea' && (
                                                                <textarea rows={3} value={valorString} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setRespuestasEditadas({ ...respuestasEditadas, [campo.label]: e.target.value })} />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-sm font-bold text-slate-800 mt-1">
                                                            {campo.type === 'date' && valorString.match(/^\d{4}-\d{2}-\d{2}$/)
                                                                ? valorString.split('-').reverse().join('/')
                                                                : valorString || '—'
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        });
                                    }

                                    return Object.entries(registroSeleccionado.respuestas).map(([labelPregunta, valor]) => (
                                        <div key={labelPregunta} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{labelPregunta}</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1">{String(valor) || '—'}</p>
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* ─── 🛠️ CONTROLADOR FLOTANTE INFERIOR DE ACCIÓN GLOBAL (STICKY UX) ─── */}
                            <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="text-xs font-bold text-slate-400">
                                    {editandoExpediente ? "⚠️ Cambios sin guardar" : "📄 Modo Lectura"}
                                </div>
                                <div className="flex items-center gap-3">
                                    {editandoExpediente ? (
                                        <>
                                            <button
                                                onClick={() => setEditandoExpediente(false)}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-5 py-2.5 rounded-xl transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleActualizarExpediente} disabled={submittingForm}
                                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-100 flex items-center gap-1.5"
                                            >
                                                {submittingForm ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                                Guardar Cambios
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setVistaActiva('registros'); setRegistroSeleccionado(null); }}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-5 py-2.5 rounded-xl transition-all"
                                            >
                                                Cerrar Expediente
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setRespuestasEditadas(registroSeleccionado.respuestas);
                                                    setEditandoExpediente(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-1.5"
                                            >
                                                <Edit2 size={14} />
                                                Editar Datos
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* LISTADO DE FORMATOS */}
                    {vistaActiva === 'agendar' && (
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3"><h2 className="text-lg font-black text-slate-900">Formatos de Encuesta</h2><p className="text-xs text-slate-400">Selecciona un formato para abrir el formulario de captura inmediatamente abajo.</p></div>
                            <div className="grid grid-cols-1 gap-3">
                                {plantillas.map((formato) => (
                                    <div key={formato.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between gap-4">
                                        <div><h4 className="font-bold text-slate-800 text-sm">{formato.titulo}</h4><p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{formato.descripcion}</p></div>
                                        <button onClick={() => { setPlantillaSeleccionada(formato); setVistaActiva('llenar'); }} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md shrink-0">Seleccionar</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FORMULARIO DE CAPTURA NUEVA */}
                    {vistaActiva === 'llenar' && plantillaSeleccionada && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div><span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">Captura Activa</span><h2 className="text-lg font-black text-slate-900 mt-1">{plantillaSeleccionada.titulo}</h2></div>
                                <button onClick={() => { setVistaActiva('agendar'); setErrorForm(''); }} className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1"><ArrowLeft size={14} /> Cambiar Formato</button>
                            </div>
                            {successForm ? (
                                <div className="py-12 text-center space-y-2">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow animate-bounce"><ClipboardCheck size={24} /></div>
                                    <h3 className="font-black text-slate-900 text-base">¡Guardado Exitosamente!</h3>
                                    <p className="text-xs text-slate-400">Sincronizando bitácora general y credenciales de acceso...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    {plantillaSeleccionada.campos.map((campo) => (
                                        <div key={campo.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">{campo.label} {campo.required && <span className="text-red-500">*</span>}</label>
                                            {campo.type === 'text' && (<input type="text" required={campo.required} value={respuestasForm[campo.id] || ''} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => handleInputChange(campo.label, campo.id, e.target.value)} />)}
                                            {campo.type === 'number' && (<input type="number" required={campo.required} value={respuestasForm[campo.id] || ''} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => handleInputChange(campo.label, campo.id, e.target.value)} />)}
                                            {campo.type === 'date' && (<SelectorFechaDinamico required={campo.required} disabled={submittingForm} onChange={(valor) => handleInputChange(campo.label, campo.id, valor)} />)}
                                            {campo.type === 'textarea' && (<textarea rows={3} required={campo.required} value={respuestasForm[campo.id] || ''} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" onChange={(e) => handleInputChange(campo.label, campo.id, e.target.value)} />)}
                                        </div>
                                    ))}
                                    <button type="submit" disabled={submittingForm} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs tracking-wide transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2">{submittingForm ? <Loader2 className="animate-spin" size={16} /> : "Guardar y Sincronizar Registro"}</button>
                                </form>
                            )}
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}