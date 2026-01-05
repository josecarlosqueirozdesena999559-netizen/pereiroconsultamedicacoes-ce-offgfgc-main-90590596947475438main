-- Tabela de tokens de push
CREATE TABLE public.push_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  platform text NOT NULL DEFAULT 'android',
  opt_in boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de assinaturas por UBS
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL,
  ubs_id uuid NOT NULL REFERENCES public.postos(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(token, ubs_id)
);

-- Índices para performance
CREATE INDEX idx_push_tokens_token ON public.push_tokens(token);
CREATE INDEX idx_push_tokens_opt_in ON public.push_tokens(opt_in) WHERE opt_in = true;
CREATE INDEX idx_push_subscriptions_ubs ON public.push_subscriptions(ubs_id);
CREATE INDEX idx_push_subscriptions_enabled ON public.push_subscriptions(ubs_id, enabled) WHERE enabled = true;

-- Habilitar RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso anônimo (sem login)
CREATE POLICY "Push tokens: acesso público insert/update" 
ON public.push_tokens 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Push subscriptions: acesso público" 
ON public.push_subscriptions 
FOR ALL
USING (true)
WITH CHECK (true);