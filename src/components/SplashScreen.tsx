import React from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = React.useState(false);

  React.useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #0d4a1c 0%, #166534 50%, #15803d 100%)",
      }}
    >
      {/* Efeito de partículas/círculos sutis */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
              top: `${10 + i * 15}%`,
              left: `${5 + i * 18}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative flex flex-col items-center gap-4 px-6">
        {/* Ícone estilizado */}
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 shadow-2xl"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            animation: "splash-icon 0.6s ease-out forwards",
          }}
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 4.5v15m7.5-7.5h-15" 
            />
          </svg>
        </div>

        {/* Nome do sistema */}
        <div className="text-center" style={{ animation: "splash-text 0.8s ease-out 0.2s forwards", opacity: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            ConsultMed
          </h1>
          <div className="h-0.5 w-16 mx-auto mt-2 rounded-full bg-white/40" />
        </div>

        {/* Subtítulo */}
        <p 
          className="text-sm md:text-base text-white/70 font-light tracking-wider"
          style={{ animation: "splash-subtitle 0.8s ease-out 0.4s forwards", opacity: 0 }}
        >
          Pereiro • Ceará
        </p>

        {/* Indicador de loading minimalista */}
        <div 
          className="flex items-center gap-1.5 mt-6"
          style={{ animation: "splash-loader 0.8s ease-out 0.6s forwards", opacity: 0 }}
        >
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>

      <style>{`
        @keyframes splash-icon {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes splash-text {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-subtitle {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0.7; transform: translateY(0); }
        }
        @keyframes splash-loader {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
