import React from "react";
import logoConsultMed from "@/assets/logo-consultmed.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a5f2a]">
      <div className="flex flex-col items-center gap-6 animate-splash-logo">
        <img
          src={logoConsultMed}
          alt="ConsultMed Logo"
          className="w-40 h-40 md:w-52 md:h-52 object-contain animate-splash-pulse"
        />
        <div className="flex gap-1.5 mt-4">
          <span className="w-2.5 h-2.5 bg-white/80 rounded-full animate-splash-dot-1"></span>
          <span className="w-2.5 h-2.5 bg-white/80 rounded-full animate-splash-dot-2"></span>
          <span className="w-2.5 h-2.5 bg-white/80 rounded-full animate-splash-dot-3"></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
