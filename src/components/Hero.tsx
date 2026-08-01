"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// 1. Pon las rutas exactas de tus 2 imágenes
const HERO_IMAGES = [
  "/imagenes/imagen2.png", 
  "/imagenes/imagen.png",
  "/imagenes/imagen3.png",
  "/imagenes/imagen4.png",
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 2. Transición automática cada 5 segundos (5000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      
      {/* 3. Carrusel de imágenes con efecto suave (Opacity) */}
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Hero Background ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* 4. Overlay oscuro para darle contraste al texto */}
      <div className="absolute inset-0 bg-slate-950/70 z-10" />
    </section>
  );
}