// src/app/page.tsx
import Link from 'next/link';
import { ArrowRight, CheckCircle, Mail, Phone, MapPin, Target, Eye, Award, Send } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import Hero from "@/components/Hero"; // Componente del Hero importado

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 scroll-smooth">
      
      {/* 1. HERO SECTION DINÁMICO CON TEXTO SUPERPUESTO */}
      <section className="relative w-full overflow-hidden">
        {/* Carrusel de imágenes de fondo */}
        <Hero />

        {/* Capa superpuesta con texto y botón */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 space-y-6 bg-slate-900/50 backdrop-blur-[2px]">
          {/* Encabezados */}
          <div className="space-y-2 max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              Tu aliado en confianza y capital humano.
            </h1>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-400 tracking-tight leading-tight drop-shadow-md">
              Investigación con rigor.
            </h2>
          </div>

          {/* Subtítulo */}
          <p className="text-slate-200 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">
            Soluciones profesionales en estudios socioeconómicos, investigaciones laborales y validación de información para empresas.
          </p>

          {/* BOTÓN: Acceder al Sistema */}
          <div className="pt-4 flex justify-center">
            <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-blue-500/40 transition-all duration-200 group cursor-pointer">
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN NOSOTROS (IDENTIDAD + MISIÓN, VISIÓN Y VALORES) */}
      <section id="nosotros" className="py-20 px-4 max-w-7xl mx-auto w-full">
        {/* Identidad de la Empresa */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
              Nuestra Identidad
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Excelencia en Inteligencia Humana y Socioeconómica
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              En HR Investigations & Socioeconomic Research, somos líderes en la provisión de servicios de investigación de alta fidelidad. Nuestra metodología objetiva y autoritaria asegura que cada dato recolectado sea una base sólida para el crecimiento de su organización.
            </p>
            <div className="flex gap-8 border-t border-slate-200 pt-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <span className="text-3xl font-black text-slate-900 block">15+</span>
                <span className="text-sm text-slate-500">Años de Experiencia</span>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <span className="text-3xl font-black text-slate-900 block">99%</span>
                <span className="text-sm text-slate-500">Precisión en Datos</span>
              </div>
            </div>
          </div>

          {/* PLACEHOLDER IMAGEN IDENTIDAD */}
          <div className="relative">
            <img
              src="/imagenes/identidad.jpg" 
              alt="identidad" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Misión, Visión y Valores */}
        <div className="grid md:grid-cols-3 gap-8 border-t border-slate-200 pt-16">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Misión</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Brindar soluciones integrales en estudios socioeconómicos, investigaciones laborales, incidencias legales, reclutamiento y estrategias de publicidad y marketing, mediante procesos confiables, éticos e innovadores que permitan a nuestros clientes tomar decisiones con seguridad y fortalecer el desarrollo de sus organizaciones.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-6">
              <Eye size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Visión</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ser una empresa líder y referente a nivel nacional en servicios de investigación, verificación de información, reclutamiento y soluciones estratégicas para empresas, reconocida por la calidad de nuestros servicios, la innovación tecnológica y el compromiso con la excelencia.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Valores</h3>
            <ul className="text-slate-600 text-sm space-y-2">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" />Confidencialidad</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" /> Integridad</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" /> Objetividad</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DE SERVICIOS EN ZIG-ZAG */}
      <section id="servicios" className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto space-y-24">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-600 font-bold tracking-widest text-xs uppercase block mb-2">Lo Que Ofrecemos</span>
            <h2 className="text-4xl font-extrabold text-slate-900">Nuestros Servicios Especializados</h2>
          </div>

          {/* SERVICIO 01 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="/imagenes/img5.png" 
              alt="Estudios Socioeconómicos Integrales" 
              className="w-full h-auto object-contain"
            />
            <div>
              <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
                SERVICIO 01
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Investigación de Estudios Socioeconómicos
              </h3>
              <p className="text-slate-600 mb-6">
                Realizamos estudios socioeconómicos con el objetivo de verificar la información personal, familiar, económica y patrimonial de los candidatos o solicitantes, proporcionando información confiable para la toma de decisiones.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span><strong>Presenciales:</strong> Visitas domiciliarias para validar las condiciones de vivienda, entorno familiar, referencias personales y situación socioeconómica del candidato.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span><strong>Virtuales:</strong> Entrevistas realizadas mediante plataformas digitales, verificando la información proporcionada de manera remota con el mismo nivel de confiabilidad.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span><strong>Crediticios:</strong> Análisis del historial y comportamiento financiero del candidato para conocer su nivel de responsabilidad económica y capacidad de manejo financiero.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span><strong>Para Becas:</strong> Evaluación socioeconómica orientada a instituciones educativas u organizaciones que requieren verificar la situación económica de los aspirantes a programas de apoyo.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* SERVICIO 02 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
                SERVICIO 02
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Investigación de Estudios laborales
              </h3>
              <p className="text-slate-600 mb-6">
                Verificamos la experiencia laboral de los candidatos mediante la validación de información proporcionada en su historial profesional, ayudando a reducir riesgos en los procesos de contratación.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span> Verificación de empresas donde laboró.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span> Confirmación de puestos desempeñados.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span> Validación de fechas de ingreso y salida.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span> Motivos de separación laboral.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span> Referencias laborales.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span> Confirmación de desempeño y conducta laboral.</span>
                </li>
              </ul>
            </div>
            <img 
              src="/imagenes/img4.png" 
              alt="Estudios Socioeconómicos Integrales" 
              className="w-full h-auto object-contain"/>
          </div>

          {/* SERVICIO 03 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="/imagenes/img3.png" 
              alt="Estudios Socioeconómicos Integrales" 
              className="w-full h-auto object-contain"/>
            <div>
              <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
                SERVICIO 03
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Investigación de Incidencias Legales
              </h3>
              <p className="text-slate-600 mb-6">
                Protegemos su patrimonio y reputación mediante la búsqueda exhaustiva de antecedentes legales. Contamos con acceso a bases de datos actualizadas y procesos legales de consulta legítima.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Penal y Civil</h4>
                  <p className="text-xs text-slate-500">Búsqueda en boletines judiciales y registros estatales.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Laboral</h4>
                  <p className="text-xs text-slate-500">Identificación de demandas contra antiguos empleadores.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Administrativo</h4>
                  <p className="text-xs text-slate-500">Verificación en registros de servidores públicos y sanciones.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Internacional</h4>
                  <p className="text-xs text-slate-500">Listas de vigilancia y control global (OFAC, Interpol).</p>
                </div>
              </div>
            </div>
          </div>

          {/* SERVICIO 04 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="/imagenes/img2.png" 
              alt="Estudios Socioeconómicos Integrales" 
              className="w-full h-auto object-contain"
            />
            <div>
              <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
                SERVICIO 04
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Investigación de Reclutamiento
              </h3>
              <p className="text-slate-600 mb-6">
                Apoyamos a las organizaciones en la búsqueda y atracción del talento adecuado mediante procesos de reclutamiento eficientes, identificando candidatos que cumplan con el perfil requerido para cada vacante.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Publicación de vacantes.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Atracción de talento.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Búsqueda de candidatos.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Entrevistas iniciales.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Evaluación de perfiles.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Presentación de candidatos.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Seguimiento del proceso de reclutamiento.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* SERVICIO 05 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
                SERVICIO 05
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Publicidad y Marketing
              </h3>
              <p className="text-slate-600 mb-6">
                Diseñamos estrategias de publicidad y marketing para fortalecer la imagen de las empresas, incrementar su presencia en el mercado y atraer nuevos clientes mediante herramientas digitales y tradicionales.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Marketing digital.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Administración de redes sociales.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Diseño gráfico e identidad corporativa.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Creación de contenido publicitario.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Campañas de publicidad.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Posicionamiento de marca.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-blue-600 mt-1 shrink-0" />
                  <span>Estrategias de promoción y difusión.</span>
                </li>
              </ul>
            </div>
            <img
              src="/imagenes/img.png" 
              alt="Estudios Socioeconómicos Integrales" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* 4. BANNER EMPRESAS QUE CONFÍAN */}
      <section className="py-12 bg-slate-50 border-t border-slate-600 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-6">
            EMPRESAS QUE CONFÍAN EN NOSOTROS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 transition-all">
            <img src="/imagenes/consultores.jpeg" alt="Cliente 1" className="h-23 object-contain"/>
            <img src="/imagenes/frmedical.png" alt="Cliente 2" className="h-20 object-contain"/>
            <img src="/imagenes/laboratorio.png" alt="Cliente 3" className="h-24 object-contain"/>
            <img src="/imagenes/lockton.png" alt="Cliente 4" className="h-24 object-contain"/>
            <img src="/imagenes/amarox.jpeg" alt="Cliente 5" className="h-25 object-contain"/>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN CONTACTO Y UBICACIÓN */}
      <section id="contacto" className="py-20 bg-slate-900 text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-400 font-bold tracking-widest text-xs uppercase block mb-2">
              Estamos para atenderte
            </span>
            <h3 className="text-4xl font-extrabold">Ponte en Contacto</h3>
            <p className="text-slate-400 mt-4 text-sm">
              ¿Tienes dudas o deseas solicitar una cotización personalizada? Nuestro equipo te responderá a la brevedad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Columna Izquierda: Datos, Redes y Mapa */}
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                
                {/* Lado Izquierdo: Información de Contacto */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/30">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Correo Electrónico</h4>
                      <p className="text-slate-400 text-sm">admon.servicios@servris.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/30">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Teléfonos de Atención</h4>
                      <p className="text-slate-400 text-sm">+52 (55) 7882-1986</p>
                      <p className="text-slate-400 text-sm">WhatsApp: +52 (55) 7882-1986</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/30">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Oficinas Corporativas</h4>
                      <p className="text-slate-400 text-sm">
                        Río Consulado 49, Jardines de Morelos, 55070 Ecatepec de Morelos, Méx.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: REDES SOCIALES */}
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                    Síguenos en nuestras redes
                  </span>
                  <div className="flex flex-col gap-3">
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700 shadow-md group w-full"
                    >
                      <FaLinkedinIn className="text-lg text-blue-400 group-hover:text-white transition-colors" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=100085932893022"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700 shadow-md group w-full"
                    >
                      <FaFacebookF className="text-lg text-blue-400 group-hover:text-white transition-colors" />
                      <span className="text-sm font-medium">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contenedor mapa de Google */}
              <div className="w-full h-64 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                <iframe
                  title="Ubicación de la Empresa"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.5085375429156!2d-99.00335632400977!3d19.595638281720816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ee3adca42653%3A0xf77875c928be8ff9!2sR%C3%ADo%20Consulado%2049%2C%20Jardines%20de%20Morelos%2C%2055070%20Ecatepec%20de%20Morelos%2C%20M%C3%A9x.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Formulario de Mensaje */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Envíanos un mensaje</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Correo Corporativo
                  </label>
                  <input
                    type="email"
                    placeholder="correo@empresa.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Enviar Mensaje <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 SocioManager. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Términos</a>
            <a href="#contacto" className="hover:text-slate-300 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}