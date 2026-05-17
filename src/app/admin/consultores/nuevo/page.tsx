"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle2, Shield, Phone, MapPin, Lock } from 'lucide-react';
import Link from 'next/link';

export default function NuevoConsultor() {
    const { role, loading: authLoading } = useAuth();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [curp, setCurp] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (curp.length !== 18) {
            setError("La CURP debe tener exactamente 18 caracteres.");
            setLoading(false);
            return;
        }

        try {
            // Enviamos los nuevos campos usando la ruta relativa funcional
            const response = await fetch('../../../api/auth/admin/register-consultor/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, curp, municipio, telefono, direccion })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al registrar al consultor");
            }

            setSuccess(`¡Consultor registrado! Contraseña inicial: ${data.password_generated}`);
            // Limpiar formulario
            setNombre('');
            setEmail('');
            setCurp('');
            setMunicipio('');
            setTelefono('');
            setDireccion('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 1. 🛡️ Estado de carga inicial mientras se recupera la sesión de Firebase
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-600 font-semibold animate-pulse">Verificando credenciales...</p>
            </div>
        );
    }

    // 2. 🛡️ Intercepción de seguridad si el rol no es explícitamente 'admin'
    if (role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Acceso No Autorizado</h2>
                    <p className="text-slate-500 text-sm mb-6">
                        No dispones de los permisos necesarios para ver este contenido. Por seguridad, debes iniciar sesión con una cuenta de Administrador.
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-md shadow-blue-100"
                    >
                        Ir al Login de Admin
                    </Link>
                </div>
            </div>
        );
    }

    // 3. 🖥️ Interfaz del Formulario (Se renderiza únicamente si pasa el filtro de Admin)
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium w-fit">
                <ArrowLeft size={16} /> Volver al Panel
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Registrar Personal de Campo</h1>
                        <p className="text-sm text-slate-500">Agrega un nuevo consultor con expediente completo.</p>
                    </div>
                </div>

                <form onSubmit={handleRegistro} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 rounded-r-lg">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3 text-green-700 rounded-r-lg">
                            <CheckCircle2 size={20} className="flex-shrink-0" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                        <input
                            type="text" required value={nombre} disabled={loading}
                            placeholder="Ej: Juan Pérez Gómez"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                            <input
                                type="email" required value={email} disabled={loading}
                                placeholder="consultor@empresa.com"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono de Contacto</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="tel" required value={telefono} disabled={loading}
                                    placeholder="10 dígitos"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Municipio de Asignación</label>
                            <input
                                type="text" required value={municipio} disabled={loading}
                                placeholder="Ej: Tlaxcoapan"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                                onChange={(e) => setMunicipio(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">CURP (18 caracteres)</label>
                            <input
                                type="text" required value={curp} disabled={loading}
                                maxLength={18}
                                placeholder="Escribe la CURP..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase tracking-wider disabled:bg-slate-50"
                                onChange={(e) => setCurp(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Dirección Particular</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text" required value={direccion} disabled={loading}
                                placeholder="Calle, Número, Colonia, C.P."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50"
                                onChange={(e) => setDireccion(e.target.value)}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 italic flex items-center gap-1">
                            <Shield size={12} /> Al guardar, los primeros 8 dígitos de la CURP serán su clave de acceso inicial.
                        </p>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-60"
                    >
                        {loading ? "Creando expediente y credenciales..." : "Registrar y Activar Cuenta"}
                    </button>
                </form>
            </div>
        </div>
    );
}