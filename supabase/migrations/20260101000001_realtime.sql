-- Enable Supabase Realtime for the tables the client subscribes to.
-- Clients use postgres_changes (RLS-enforced) for messages and reactions.

alter table public.messages replica identity full;
alter table public.message_reactions replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.message_reactions;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.conversation_members;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.conversations;
  exception when duplicate_object then null;
  end;
end$$;
