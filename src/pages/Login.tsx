import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Home } from 'lucide-react';

const Login = () => {
  const [login, setLogin] = useState(() => localStorage.getItem('remembered-email') || '');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered-email'));
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await authLogin(login, senha);
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha inválidos. Verifique suas credenciais.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro no sistema",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Botão Início */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-card/90 backdrop-blur-sm border-border hover:bg-card text-foreground gap-1.5 shadow-md"
        >
          <Home className="h-4 w-4" />
          Início
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Lado esquerdo - Info */}
        <div
          className="lg:flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="max-w-md text-primary-foreground">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Acesso Restrito
            </h1>
            <p className="text-base sm:text-lg font-semibold opacity-95 mb-3">
              Sistema de gerenciamento das Unidades Básicas de Saúde.
            </p>
            <p className="text-sm sm:text-base opacity-80 leading-relaxed">
              Acesso exclusivo para profissionais autorizados pela Secretaria Municipal de Saúde.
            </p>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="lg:flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Entrar no Sistema</h2>
                <p className="text-sm text-muted-foreground mt-1">Acesse sua conta para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login" className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    id="login"
                    type="email"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-11 bg-background border-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-sm font-medium text-foreground">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pr-10 bg-background border-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Lembrar login
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
