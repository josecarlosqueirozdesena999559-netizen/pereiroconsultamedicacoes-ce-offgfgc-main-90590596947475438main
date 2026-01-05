import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface PublicHeaderProps {
  showBack?: boolean;
}

const PublicHeader = ({ showBack = false }: PublicHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/" className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary-foreground leading-tight">
                ConsultMed
              </span>
              <span className="text-xs text-primary-foreground/80 leading-tight">
                Pereiro - CE
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
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
