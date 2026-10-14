-- Hardening: owner-only membership changes and conversation updates, plus a
-- retry-safe profile bootstrap. Apply after 20260101000000_init.sql.

-- ---------------------------------------------------------------------------
-- Owner helper (SECURITY DEFINER avoids RLS recursion on member checks)
-- ---------------------------------------------------------------------------

create or replace function public.is_conversation_owner(p_conversation uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members
    where conversation_id = p_conversation
      and user_id = p_user
      and role = 'owner'
  );
$$;

grant execute on function public.is_conversation_owner(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Only owners may add members (anyone may still add themselves on create)
-- ---------------------------------------------------------------------------

drop policy if exists members_insert_self_or_member on public.conversation_members;
drop policy if exists members_insert_self_or_owner on public.conversation_members;
create policy members_insert_self_or_owner on public.conversation_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.is_conversation_owner(conversation_id, auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Only owners may update conversation metadata (rename, etc.)
-- ---------------------------------------------------------------------------

drop policy if exists conversations_update_member on public.conversations;
drop policy if exists conversations_update_owner on public.conversations;
create policy conversations_update_owner on public.conversations
  for update to authenticated
  using (public.is_conversation_owner(id, auth.uid()))
  with check (public.is_conversation_owner(id, auth.uid()));

-- ---------------------------------------------------------------------------
-- Retry-safe profile bootstrap: a username collision no longer aborts signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  attempt int := 0;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'user_name', ''),
    nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'user'
  );
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]+', '_', 'g');
  base_username := left(base_username, 24);
  if base_username = '' then
    base_username := 'user';
  end if;

  loop
    attempt := attempt + 1;
    candidate := base_username || '_' || substr(md5(new.id::text || attempt::text), 1, 6);
    begin
      insert into public.profiles (id, username, display_name, avatar_url)
      values (
        new.id,
        candidate,
        coalesce(
          nullif(new.raw_user_meta_data ->> 'full_name', ''),
          nullif(new.raw_user_meta_data ->> 'name', ''),
          base_username
        ),
        nullif(new.raw_user_meta_data ->> 'avatar_url', '')
      )
      on conflict (id) do nothing;
      exit;
    exception when unique_violation then
      if attempt >= 5 then
        raise;
      end if;
    end;
  end loop;

  return new;
end;
$$;
