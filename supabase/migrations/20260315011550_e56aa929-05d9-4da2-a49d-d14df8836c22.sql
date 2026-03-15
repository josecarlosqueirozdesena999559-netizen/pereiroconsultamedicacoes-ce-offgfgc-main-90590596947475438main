
-- Drop old restrictive policies
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_service" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_service" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_service" ON public.usuarios;

-- Allow full access for anon role (system uses custom auth, not Supabase Auth)
CREATE POLICY "allow_all_select" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON public.usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON public.usuarios FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_delete" ON public.usuarios FOR DELETE USING (true);
