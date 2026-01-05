import React from "react";
import logoConsultMed from "@/assets/logo-consultmed.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = React.useState(false);

  React.useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(145deg, #0d3d15 0%, #1a5f2a 50%, #2d7a3e 100%)",
      }}
    >
      {/* Círculos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 animate-splash-float"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10 animate-splash-float-delayed"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full opacity-5 animate-splash-float"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Glow atrás do logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-56 h-56 md:w-72 md:h-72 rounded-full opacity-30 blur-3xl animate-splash-glow"
            style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 70%)" }}
          />
        </div>

        {/* Logo com animação */}
        <div className="relative animate-splash-logo">
          <img
            src={logoConsultMed}
            alt="ConsultMed Logo"
            className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Texto animado */}
        <div className="flex flex-col items-center gap-2 animate-splash-text">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide drop-shadow-lg">
            ConsultMed
          </h1>
          <p className="text-sm md:text-base text-white/70 font-light tracking-widest">
            Pereiro - CE
          </p>
        </div>

        {/* Indicador de loading elegante */}
        <div className="flex items-center gap-2 mt-6 animate-splash-loader">
          <div className="relative w-12 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-white/80 rounded-full animate-splash-progress" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
