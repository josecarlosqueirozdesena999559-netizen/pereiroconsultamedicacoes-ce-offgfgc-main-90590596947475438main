import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Home,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
        if (rememberMe) {
          localStorage.setItem('remembered-email', login);
        } else {
          localStorage.removeItem('remembered-email');
        }

        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para o dashboard...',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Erro no login',
          description: 'E-mail ou senha invalidos. Verifique suas credenciais.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro no sistema',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(241,247,243,0.98)_34%,rgba(228,238,231,1)_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(10,97,20,0.14),transparent_20%),radial-gradient(circle_at_82%_14%,rgba(133,191,141,0.18),transparent_20%),radial-gradient(circle_at_78%_82%,rgba(10,97,20,0.08),transparent_22%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_35px_100px_rgba(26,76,37,0.16)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0a6114_0%,#0f7420_44%,#0d4f18_100%)] px-6 py-6 text-white sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_18%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.12),transparent_20%),radial-gradient(circle_at_74%_76%,rgba(255,255,255,0.10),transparent_24%)]" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <Badge className="border-white/15 bg-white/10 px-4 py-1.5 text-white hover:bg-white/10">
                  Painel institucional
                </Badge>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="gap-2 rounded-full border-white/20 bg-white/10 text-white shadow-none backdrop-blur-sm hover:bg-white/15 hover:text-white"
                >
                  <Home className="h-4 w-4" />
                  Inicio
                </Button>
              </div>

              <div className="mt-10 max-w-xl lg:mt-14">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                  ConsultMed Pereiro
                </p>
                <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl">
                  Acesso ao
                  <br />
                  painel administrativo
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                  Entre com suas credenciais para acompanhar unidades, consultar registros e manter
                  as informacoes da rede municipal de saude organizadas em um so lugar.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:mt-10">
                <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-black">24h</p>
                  <p className="mt-1 text-sm text-white/78">acesso rapido ao ambiente interno</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-black">PDF</p>
                  <p className="mt-1 text-sm text-white/78">gestao centralizada das listas</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-black">UBS</p>
                  <p className="mt-1 text-sm text-white/78">monitoramento da rede municipal</p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 lg:mt-auto">
                <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white/12 p-2.5">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Ambiente restrito e seguro</p>
                      <p className="mt-1 text-sm leading-6 text-white/76">
                        Area voltada aos profissionais autorizados da rede municipal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white/12 p-2.5">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Mesmo visual da pagina inicial</p>
                      <p className="mt-1 text-sm leading-6 text-white/76">
                        Interface alinhada com a identidade verde institucional do portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,247,0.96))] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,97,20,0.06),transparent_24%)]" />

            <div className="relative mx-auto flex h-full w-full max-w-md items-center">
              <div className="w-full rounded-[1.8rem] border border-[#d9e7da] bg-white/92 p-6 shadow-[0_20px_50px_rgba(31,73,40,0.08)] sm:p-7">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#e5f1e7,#eef7ef)] text-primary shadow-inner">
                    <LockKeyhole className="h-6 w-6" strokeWidth={2.2} />
                  </div>
                  <h2 className="mt-5 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#234426] sm:text-[2.25rem]">
                    Entrar
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#70856f]">
                    Use seu e-mail institucional e sua senha para continuar no painel.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login" className="text-[13px] font-semibold text-[#4d634f]">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea48d]" />
                      <Input
                        id="login"
                        type="email"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        placeholder="seu@email.com"
                        className="h-12 rounded-2xl border-[#dbe7dc] bg-[#fbfdfb] pl-11 pr-4 text-sm shadow-none placeholder:text-[#9aab99] focus-visible:ring-2 focus-visible:ring-[#0a6114]/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-[13px] font-semibold text-[#4d634f]">
                      Senha
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea48d]" />
                      <Input
                        id="senha"
                        type={showPassword ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Digite sua senha"
                        className="h-12 rounded-2xl border-[#dbe7dc] bg-[#fbfdfb] pl-11 pr-12 text-sm shadow-none placeholder:text-[#9aab99] focus-visible:ring-2 focus-visible:ring-[#0a6114]/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea48d] transition-colors hover:text-[#456446]"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3ece4] bg-[#f7faf7] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-[#adc1ac] data-[state=checked]:border-[#0a6114] data-[state=checked]:bg-[#0a6114]"
                      />
                      <Label htmlFor="remember" className="cursor-pointer text-[13px] font-medium text-[#688069]">
                        Lembrar acesso
                      </Label>
                    </div>
                    <p className="text-[12px] font-medium text-[#93a391]">Uso interno</p>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0a6114,#128022)] text-sm font-bold text-white shadow-[0_14px_30px_rgba(10,97,20,0.24)] hover:opacity-95"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar no painel
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
