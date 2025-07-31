create table if not exists registrations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  class text not null,
  created_at timestamptz not null default now()
);
