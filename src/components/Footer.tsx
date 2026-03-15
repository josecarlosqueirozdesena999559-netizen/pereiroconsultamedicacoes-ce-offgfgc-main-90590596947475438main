import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Links legais */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              to="/termos-de-uso" 
              className="hover:underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity"
            >
              Termos de Uso
            </Link>
            <span className="opacity-50">|</span>
            <Link 
              to="/politica-de-privacidade" 
              className="hover:underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity"
            >
              Política de Privacidade
            </Link>
          </nav>

          {/* Links externos */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a
              href="https://www.pereiro.ce.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="h-3 w-3" />
              Site da Prefeitura
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs opacity-70 pt-2 border-t border-primary-foreground/20 w-full max-w-md">
            <p>© {currentYear} Prefeitura Municipal de Pereiro</p>
            <p className="mt-1">Secretaria de Saúde - Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
