import Link from 'next/link';
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-100 py-2 px-8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* 1. LOGO / TÍTULO (Izquierda) */}
        <div className="flex items-center">
          <Image src="/imagenes/Logo1.png"alt="Logo SocioManager"width={125} height={60} priority style={{ width: 'auto', height: 'auto' }}
          className="h-9 w-auto object-contain"/>
        </div>

        {/* 2. ENLACES EN TEXTO PLANO (Centro) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-7 py-2.5 rounded-md hover:bg-blue-700 transition-all shadow-sm text-center">
              Inicio
            </Link>
            <Link 
              href="/#nosotros"
              className="bg-blue-600 text-white px-7 py-2.5 rounded-md hover:bg-blue-700 transition-all shadow-sm text-center">
              Nosotros
            </Link>
            <Link 
              href="/#servicios"
              className="bg-blue-600 text-white px-7 py-2.5 rounded-md hover:bg-blue-700 transition-all shadow-sm text-center">
              Servicios
            </Link>
            <Link 
              href="/#contacto"
              className="bg-blue-600 text-white px-7 py-2.5 rounded-md hover:bg-blue-700 transition-all shadow-sm text-center">
              Contacto
            </Link>
        </nav>

        {/* 3. BOTÓN AZUL LIMPIO (Derecha) */}
        <div>
          <Link 
            href="/auth/login" 
            className="bg-blue-600 text-white px-7 py-2.5 rounded-md text-sm font-bold hover:bg-blue-700 transition-all shadow-sm block text-center">
            Iniciar Sesión
          </Link>
        </div>

      </div>
    </header>
  );
}