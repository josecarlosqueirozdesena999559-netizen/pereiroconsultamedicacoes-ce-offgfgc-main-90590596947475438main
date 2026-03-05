import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

const Login = () => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 flex justify-center">
        <Card className="w-full max-w-md bg-card shadow-xl rounded-xl border-border/50">
          <CardHeader className="text-center space-y-3 pt-8">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-md">
                <LogIn className="h-7 w-7 text-primary-foreground" strokeWidth={1.8} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Acesso Restrito</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sistema de gerenciamento das Unidades Básicas de Saúde
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="login"
                    type="email"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Digite seu email"
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 h-11"
                    required
                  />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
