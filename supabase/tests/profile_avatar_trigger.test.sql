-- pgtap: handle_new_user() trigger covers every metadata variant produced by
-- the auth flows we ship. Run with `supabase test db`.

begin;
select plan(9);

-- Helper: each test runs as an INSERT into auth.users. The trigger fires
-- SECURITY DEFINER so the resulting profiles row is visible to this test.

-- ---------------------------------------------------------------------------
-- Case A: manual email/password sign-up (display_name + avatar_url metadata)
-- ---------------------------------------------------------------------------
with inserted as (
  insert into auth.users (id, instance_id, email, raw_user_meta_data, aud, role)
  values (
    '00000000-0000-0000-0000-000000000a01',
    '00000000-0000-0000-0000-000000000000',
    'manual@example.com',
    jsonb_build_object(
      'display_name', 'Ibu Sari',
      'avatar_url', 'https://example.test/avatars/_signup/abc.jpg'
    ),
    'authenticated',
    'authenticated'
  )
  returning id
)
select 1 from inserted;

select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-000000000a01'),
  'Ibu Sari',
  'manual sign-up: display_name comes from raw_user_meta_data.display_name'
);

select is(
  (select avatar_url from public.profiles where user_id = '00000000-0000-0000-0000-000000000a01'),
  'https://example.test/avatars/_signup/abc.jpg',
  'manual sign-up: avatar_url comes from raw_user_meta_data.avatar_url'
);

-- ---------------------------------------------------------------------------
-- Case B: Google OAuth (full_name + picture metadata, no display_name key)
-- ---------------------------------------------------------------------------
with inserted as (
  insert into auth.users (id, instance_id, email, raw_user_meta_data, aud, role)
  values (
    '00000000-0000-0000-0000-000000000a02',
    '00000000-0000-0000-0000-000000000000',
    'gmail.user@gmail.com',
    jsonb_build_object(
      'full_name', 'Budi Santoso',
      'picture', 'https://lh3.googleusercontent.com/a/example=s96-c'
    ),
    'authenticated',
    'authenticated'
  )
  returning id
)
select 1 from inserted;

select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-000000000a02'),
  'Budi Santoso',
  'Google OAuth: display_name falls back to raw_user_meta_data.full_name'
);

select is(
  (select avatar_url from public.profiles where user_id = '00000000-0000-0000-0000-000000000a02'),
  'https://lh3.googleusercontent.com/a/example=s96-c',
  'Google OAuth: avatar_url falls back to raw_user_meta_data.picture'
);

-- ---------------------------------------------------------------------------
-- Case C: legacy / minimal metadata (name only, no avatar)
-- ---------------------------------------------------------------------------
with inserted as (
  insert into auth.users (id, instance_id, email, raw_user_meta_data, aud, role)
  values (
    '00000000-0000-0000-0000-000000000a03',
    '00000000-0000-0000-0000-000000000000',
    'minimal@example.com',
    jsonb_build_object('name', 'Pak Heri'),
    'authenticated',
    'authenticated'
  )
  returning id
)
select 1 from inserted;

select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-000000000a03'),
  'Pak Heri',
  'minimal metadata: display_name falls back to raw_user_meta_data.name'
);

select is(
  (select avatar_url from public.profiles where user_id = '00000000-0000-0000-0000-000000000a03'),
  null,
  'minimal metadata: avatar_url is null when neither avatar_url nor picture is set'
);

-- ---------------------------------------------------------------------------
-- Case D: completely empty metadata -> display_name falls back to email
-- ---------------------------------------------------------------------------
with inserted as (
  insert into auth.users (id, instance_id, email, raw_user_meta_data, aud, role)
  values (
    '00000000-0000-0000-0000-000000000a04',
    '00000000-0000-0000-0000-000000000000',
    'empty@example.com',
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  )
  returning id
)
select 1 from inserted;

select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-000000000a04'),
  'empty@example.com',
  'empty metadata: display_name falls back to email'
);

select is(
  (select avatar_url from public.profiles where user_id = '00000000-0000-0000-0000-000000000a04'),
  null,
  'empty metadata: avatar_url remains null'
);

-- ---------------------------------------------------------------------------
-- Case E: priority — display_name beats full_name beats name
-- ---------------------------------------------------------------------------
with inserted as (
  insert into auth.users (id, instance_id, email, raw_user_meta_data, aud, role)
  values (
    '00000000-0000-0000-0000-000000000a05',
    '00000000-0000-0000-0000-000000000000',
    'priority@example.com',
    jsonb_build_object(
      'display_name', 'Manual',
      'full_name', 'Full',
      'name', 'Name'
    ),
    'authenticated',
    'authenticated'
  )
  returning id
)
select 1 from inserted;

select is(
  (select display_name from public.profiles where user_id = '00000000-0000-0000-0000-000000000a05'),
  'Manual',
  'priority order: display_name wins over full_name and name'
);

select * from finish();
rollback;
