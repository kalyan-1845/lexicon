"use client";

import React from "react";
import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
  variant?: "full" | "icon";
};

const Logo: React.FC<LogoProps> = ({ size = 32, className = "", variant = "full" }) => {
  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div 
        className="relative flex items-center justify-center group-hover:scale-105 transition-all duration-500" 
        style={{ width: size, height: size }}
      >
        {/* Using the dark-mode optimized Concept 1 master logo */}
        <Image 
          src="/logo_concept.png" 
          alt="Lexicon AI"
          width={size}
          height={size}
          className="w-full h-full object-contain mix-blend-screen brightness-125"
        />
        
        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      {variant === "full" && (
        <span className="font-black text-xl tracking-tighter text-white uppercase bg-clip-text">
          Lexicon
        </span>
      )}
    </div>
  );
};

export default Logo;
