-- ═══════════════════════════════════════════════════════════════════════════
-- La clínica puede eliminar del historial sus citas CANCELADAS (botón "Eliminar"
-- en el panel). Las pendientes y confirmadas no se pueden borrar: primero se
-- cancelan. Sus avisos se borran en cascada.
-- ═══════════════════════════════════════════════════════════════════════════
create policy "admin elimina citas canceladas" on public.citas
  for delete to authenticated using (public.es_admin(negocio_id) and estado = 'cancelada');

grant delete on public.citas to authenticated;
