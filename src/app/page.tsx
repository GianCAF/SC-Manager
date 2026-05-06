// src/app/page.tsx
import Link from 'next/link';
import { ArrowRight, CheckCircle, Users, BarChart3, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Consultoría Socioeconómica <br />
            <span className="text-blue-700">Inteligente y Eficiente</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Gestiona entrevistas, analiza datos socioeconómicos y mantén un control total
            de tus clientes en una sola plataforma robusta y segura.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/login"
              className="bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              Acceder al Sistema <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS (Para que tu compañero la llene) */}
      <section className="py-20 max-w-7xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Gestión de Clientes</h3>
            <p className="text-slate-500 text-sm">Registro detallado y seguimiento personalizado para cada estudio socioeconómico.</p>
          </div>

          <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Estadísticas Reales</h3>
            <p className="text-slate-500 text-sm">Visualización de datos en tiempo real para la toma de decisiones administrativas.</p>
          </div>

          <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Seguridad de Datos</h3>
            <p className="text-slate-500 text-sm">Protección de información sensible bajo los más altos estándares de Firebase.</p>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2026 SocioManager. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}