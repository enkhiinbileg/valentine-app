-- Create memories table
create table memories (
  id uuid default gen_random_uuid() primary key,
  -- Changed card_id to text because the cards table uses text IDs
  card_id text not null references cards(id) on delete cascade, 
  type text check (type in ('image', 'video')) not null,
  url text not null,
  caption text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table memories enable row level security;

-- Policies
create policy "Public memories access"
  on memories for select
  using ( true );

-- Allow public insert to ensure Server Actions can save memories without session
create policy "Public memories insert"
  on memories for insert
  with check ( true );

-- Function to increment view count (if not exists already)
-- Note: changed card_id input type to text here as well
create or replace function increment_view_count(card_id text)
returns void as $$
begin
  update cards
  set view_count = coalesce(view_count, 0) + 1,
      last_viewed_at = now()
  where id = card_id;
end;
$$ language plpgsql security definer;
