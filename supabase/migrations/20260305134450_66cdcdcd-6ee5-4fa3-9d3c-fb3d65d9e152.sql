
-- Function to update a user (bypasses RLS)
CREATE OR REPLACE FUNCTION public.fn_atualizar_usuario(
  p_user_id uuid,
  p_nome text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_senha text DEFAULT NULL,
  p_tipo user_role DEFAULT NULL
)
RETURNS TABLE(id uuid, email text, nome text, senha text, tipo text, criado_em timestamp without time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  UPDATE public.usuarios u
  SET
    nome = COALESCE(p_nome, u.nome),
    email = COALESCE(p_email, u.email),
    senha = CASE WHEN p_senha IS NOT NULL THEN crypt(p_senha, gen_salt('bf', 10)) ELSE u.senha END,
    tipo = COALESCE(p_tipo, u.tipo)
  WHERE u.id = p_user_id;

  RETURN QUERY
  SELECT u.id, u.email, u.nome, u.senha, u.tipo::text, u.criado_em
  FROM public.usuarios u
  WHERE u.id = p_user_id;
END;
$$;
