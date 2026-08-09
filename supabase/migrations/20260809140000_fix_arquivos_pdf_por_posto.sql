-- Mantém apenas o PDF mais recente de cada UBS. Registros antigos apontavam
-- para objetos já removidos do Storage e causavam NoSuchKey no site público.
DELETE FROM public.arquivos_pdf AS antigo
USING public.arquivos_pdf AS recente
WHERE antigo.posto_id = recente.posto_id
  AND (
    COALESCE(antigo.data_upload, '-infinity'::timestamp) < COALESCE(recente.data_upload, '-infinity'::timestamp)
    OR (
      antigo.data_upload IS NOT DISTINCT FROM recente.data_upload
      AND antigo.id::text < recente.id::text
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS arquivos_pdf_posto_id_unique
  ON public.arquivos_pdf (posto_id);

-- Garante que o bucket usado pelas URLs públicas exista e seja público.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('medicacoes_ubs', 'medicacoes_ubs', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "medicacoes_ubs_select_publico" ON storage.objects;
CREATE POLICY "medicacoes_ubs_select_publico"
ON storage.objects FOR SELECT
USING (bucket_id = 'medicacoes_ubs');

DROP POLICY IF EXISTS "medicacoes_ubs_insert" ON storage.objects;
CREATE POLICY "medicacoes_ubs_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medicacoes_ubs');

DROP POLICY IF EXISTS "medicacoes_ubs_update" ON storage.objects;
CREATE POLICY "medicacoes_ubs_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'medicacoes_ubs')
WITH CHECK (bucket_id = 'medicacoes_ubs');

DROP POLICY IF EXISTS "medicacoes_ubs_delete" ON storage.objects;
CREATE POLICY "medicacoes_ubs_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'medicacoes_ubs');
