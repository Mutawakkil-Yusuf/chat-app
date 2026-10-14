-- Chat app schema: profiles, conversations, membership, messages, reactions.
-- All access is gated by Row Level Security. Clients only ever use the
-- publishable (anon) key; no service-role secret is required in the browser.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'conversation_kind') then
    create type public.conversation_kind as enum ('direct', 'group');
  end if;
end$$;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind public.conversation_kind not null default 'direct',
  title text,
  created_by uuid references public.profiles (id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default to_timestamp(0),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  reply_to_id uuid references public.messages (id) on delete set null,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

-- ---------------------------------------------------------------------------
-- Indexes (every FK / column used by RLS is indexed)
-- ---------------------------------------------------------------------------

create index if not exists conversation_members_user_idx
  on public.conversation_members (user_id);
create index if not exists conversation_members_conversation_idx
  on public.conversation_members (conversation_id);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id);
create index if not exists messages_body_search_idx
  on public.messages using gin (to_tsvector('simple', body));
create index if not exists message_reactions_message_idx
  on public.message_reactions (message_id);
create index if not exists conversations_last_message_idx
  on public.conversations (last_message_at desc);
create index if not exists profiles_username_idx on public.profiles (username);

-- ---------------------------------------------------------------------------
-- Membership helper (SECURITY DEFINER avoids RLS recursion on member checks)
-- ---------------------------------------------------------------------------

create or replace function public.is_member(p_conversation uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members
    where conversation_id = p_conversation and user_id = p_user
  );
$$;

create or replace function public.is_message_member(p_message uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messages m
    where m.id = p_message and public.is_member(m.conversation_id, p_user)
  );
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Auto-create a profile whenever a new auth user signs up. This replaces the
-- old "get-or-create user" call that required a private key in the browser.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'user_name', ''),
    nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'user'
  );

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    base_username || '_' || substr(new.id::text, 1, 4),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      base_username
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep conversation ordering fresh whenever a message is inserted.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;

-- profiles: readable by any authenticated user, writable only for self.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- conversations: only members can see or modify them.
drop policy if exists conversations_select_member on public.conversations;
create policy conversations_select_member on public.conversations
  for select to authenticated using (public.is_member(id, auth.uid()));

drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own on public.conversations
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists conversations_update_member on public.conversations;
create policy conversations_update_member on public.conversations
  for update to authenticated using (public.is_member(id, auth.uid()));

-- membership: visible to members; you may add yourself or another member.
drop policy if exists members_select_member on public.conversation_members;
create policy members_select_member on public.conversation_members
  for select to authenticated using (public.is_member(conversation_id, auth.uid()));

drop policy if exists members_insert_self_or_member on public.conversation_members;
create policy members_insert_self_or_member on public.conversation_members
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_member(conversation_id, auth.uid()));

drop policy if exists members_update_self on public.conversation_members;
create policy members_update_self on public.conversation_members
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists members_delete_self on public.conversation_members;
create policy members_delete_self on public.conversation_members
  for delete to authenticated using (user_id = auth.uid());

-- messages: readable/writable by conversation members only.
drop policy if exists messages_select_member on public.messages;
create policy messages_select_member on public.messages
  for select to authenticated using (public.is_member(conversation_id, auth.uid()));

drop policy if exists messages_insert_member on public.messages;
create policy messages_insert_member on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_member(conversation_id, auth.uid()));

drop policy if exists messages_update_own on public.messages;
create policy messages_update_own on public.messages
  for update to authenticated using (sender_id = auth.uid()) with check (sender_id = auth.uid());

drop policy if exists messages_delete_own on public.messages;
create policy messages_delete_own on public.messages
  for delete to authenticated using (sender_id = auth.uid());

-- reactions: readable by members; manageable only for self.
drop policy if exists reactions_select_member on public.message_reactions;
create policy reactions_select_member on public.message_reactions
  for select to authenticated using (public.is_message_member(message_id, auth.uid()));

drop policy if exists reactions_insert_own on public.message_reactions;
create policy reactions_insert_own on public.message_reactions
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_message_member(message_id, auth.uid()));

drop policy if exists reactions_delete_own on public.message_reactions;
create policy reactions_delete_own on public.message_reactions
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Conversation list with last message, unread count and (for DMs) the other user.
create or replace function public.get_my_conversations()
returns table (
  id uuid,
  kind public.conversation_kind,
  title text,
  last_message_at timestamptz,
  last_message_body text,
  last_message_sender_id uuid,
  last_read_at timestamptz,
  unread_count bigint,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  other_user_last_seen timestamptz,
  member_ids uuid[]
)
language sql
stable
security definer
set search_path = public
as $$
  with mine as (
    select c.id, c.kind, c.title, c.last_message_at, m.last_read_at
    from public.conversation_members m
    join public.conversations c on c.id = m.conversation_id
    where m.user_id = auth.uid()
  )
  select
    mine.id,
    mine.kind,
    mine.title,
    mine.last_message_at,
    lm.body,
    lm.sender_id,
    mine.last_read_at,
    coalesce((
      select count(*)
      from public.messages msg
      where msg.conversation_id = mine.id
        and msg.created_at > mine.last_read_at
        and msg.sender_id <> auth.uid()
    ), 0),
    ou.other_user_id,
    ou.other_user_name,
    ou.other_user_avatar,
    ou.other_user_last_seen,
    (select array_agg(cm.user_id) from public.conversation_members cm where cm.conversation_id = mine.id)
  from mine
  left join lateral (
    select msg.body, msg.sender_id
    from public.messages msg
    where msg.conversation_id = mine.id
    order by msg.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select p.id as other_user_id, p.display_name as other_user_name,
           p.avatar_url as other_user_avatar, p.last_seen_at as other_user_last_seen
    from public.conversation_members cm2
    join public.profiles p on p.id = cm2.user_id
    where cm2.conversation_id = mine.id and cm2.user_id <> auth.uid()
    limit 1
  ) ou on true
  order by mine.last_message_at desc nulls last;
$$;

-- Idempotently fetch or create a 1:1 conversation.
create or replace function public.start_direct_conversation(other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing uuid;
  created uuid;
begin
  if other_user = auth.uid() then
    raise exception 'Cannot start a conversation with yourself';
  end if;

  select c.id into existing
  from public.conversations c
  join public.conversation_members a on a.conversation_id = c.id and a.user_id = auth.uid()
  join public.conversation_members b on b.conversation_id = c.id and b.user_id = other_user
  where c.kind = 'direct'
  limit 1;

  if existing is not null then
    return existing;
  end if;

  insert into public.conversations (kind, created_by)
  values ('direct', auth.uid())
  returning id into created;

  insert into public.conversation_members (conversation_id, user_id)
  values (created, auth.uid()), (created, other_user);

  return created;
end;
$$;

-- Create a group conversation with the given members plus the caller.
create or replace function public.create_group_conversation(p_title text, p_member_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  created uuid;
  everyone uuid[];
begin
  everyone := array(select distinct unnest(coalesce(p_member_ids, '{}'::uuid[]) || auth.uid()));

  insert into public.conversations (kind, title, created_by)
  values ('group', coalesce(nullif(p_title, ''), 'New group'), auth.uid())
  returning id into created;

  insert into public.conversation_members (conversation_id, user_id, role)
  select created, uid, case when uid = auth.uid() then 'owner' else 'member' end
  from unnest(everyone) as uid
  on conflict do nothing;

  return created;
end;
$$;

grant execute on function public.get_my_conversations() to authenticated;
grant execute on function public.start_direct_conversation(uuid) to authenticated;
grant execute on function public.create_group_conversation(text, uuid[]) to authenticated;
grant execute on function public.is_member(uuid, uuid) to authenticated;
grant execute on function public.is_message_member(uuid, uuid) to authenticated;
