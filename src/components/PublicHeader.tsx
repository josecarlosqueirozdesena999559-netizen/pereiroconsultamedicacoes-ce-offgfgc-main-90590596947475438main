import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import logoPereiro from "@/assets/logo-pereiro.png";

interface PublicHeaderProps {
  showBack?: boolean;
}

const PublicHeader = ({ showBack = false }: PublicHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logoPereiro} 
              alt="Prefeitura de Pereiro" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">
                ConsultMed
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Pereiro - CE
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Início</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default PublicHeader;
