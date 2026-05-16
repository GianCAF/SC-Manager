"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Campo {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  required: boolean;
}

interface Plantilla {
  titulo: string;
  descripcion: string;
  campos: Campo[];
}

export default function LlenarEncuesta() {
  const { id } = useParams();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
  const [respuestas, setRespuestas] = useState<{ [key: string]: string }>({});
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 🛡️ Protección de ruta: Solo consultores entran
  useEffect(() => {
    if (!authLoading && role !== 'consultor') {
      router.push('/auth/login');
    }
  }, [role, authLoading, router]);

  // 🔌 Recuperar estructura del formulario desde Firestore
  useEffect(() => {
    async function cargarPlantilla() {
      if (!id) return;
      try {
        const docRef = doc(db, "plantillas_formularios", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPlantilla(docSnap.data() as Plantilla);
        } else {
          setError("El formulario solicitado no existe.");
        }
      } catch (err: any) {
        setError("Error al recuperar el formato: " + err.message);
      } finally {
        setLoadingDocs(false);
      }
    }
    if (role === 'consultor') cargarPlantilla();
  }, [id, role]);

  const handleInputChange = (campoId: string, valor: string) => {
    setRespuestas({ ...respuestas, [campoId]: valor });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Guardar las respuestas ingresadas en campo
      await addDoc(collection(db, "respuestas_formularios"), {
        plantillaId: id,
        formatoTitulo: plantilla?.titulo,
        respuestas,
        encuestador: {
          uid: user.uid,
          nombre: user.displayName,
          email: user.email
        },
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/consultor');
      }, 2000);
    } catch (err: any) {
      setError("No se pudieron guardar las respuestas: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingDocs) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 text-sm font-medium">Levantando formato digital...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <ClipboardCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">¡Registro Exitoso!</h2>
        <p className="text-slate-500 text-sm">Los datos han sido sincronizados con el servidor.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER DE CONTROL */}
      <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/consultor" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-slate-800 text-base line-clamp-1">{plantilla?.titulo}</h1>
        </div>
      </div>

      {/* CUERPO DEL FORMULARIO DINÁMICO */}
      <main className="p-4 max-w-md mx-auto mt-2">
        {plantilla?.descripcion && (
          <p className="text-xs text-slate-500 bg-white border border-slate-100 p-4 rounded-xl shadow-sm mb-5 leading-relaxed">
            {plantilla.descripcion}
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 mb-5">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {plantilla?.campos.map((campo) => (
            <div key={campo.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-slate-800 mb-2">
                {campo.label} {campo.required && <span className="text-red-500">*</span>}
              </label>

              {campo.type === 'text' && (
                <input 
                  type="text" required={campo.required} disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                  onChange={(e) => handleInputChange(campo.id, e.target.value)}
                />
              )}

              {campo.type === 'number' && (
                <input 
                  type="number" required={campo.required} disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                  onChange={(e) => handleInputChange(campo.id, e.target.value)}
                />
              )}

              {/* 📅 CALENDARIO INTERACTIVO POR CLICS */}
              {campo.type === 'date' && (
                <input 
                  type="date" required={campo.required} disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-slate-700"
                  onChange={(e) => handleInputChange(campo.id, e.target.value)}
                />
              )}

              {campo.type === 'textarea' && (
                <textarea 
                  rows={3} required={campo.required} disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed"
                  onChange={(e) => handleInputChange(campo.id, e.target.value)}
                />
              )}
            </div>
          ))}

          <button
            type="submit" disabled={submitting || !plantilla}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-60 text-sm tracking-wide"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Sincronizando...
              </>
            ) : (
              "Finalizar y Guardar Encuesta"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}