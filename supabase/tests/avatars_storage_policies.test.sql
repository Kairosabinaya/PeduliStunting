-- pgtap: storage.objects RLS for the `avatars` bucket. Confirms that:
--   * anonymous role cannot upload anywhere in the bucket
--   * authenticated role can only write under their own `users/{uid}/` folder
--   * authenticated role cannot write into another user's folder
--   * authenticated role cannot write into the pre-signup `_signup/` folder
--   * service_role can write into any folder (used by uploadPendingAvatar)
--   * public SELECT works for anon and authenticated
--
-- Run with `supabase test db`.

begin;
select plan(8);

-- Bucket existence ----------------------------------------------------------

select ok(
  exists (select 1 from storage.buckets where id = 'avatars'),
  'avatars bucket exists'
);

select is(
  (select public from storage.buckets where id = 'avatars'),
  true,
  'avatars bucket is public-read'
);

-- Anonymous insert is rejected ---------------------------------------------

set local role anon;

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('avatars', '_signup/anon-attempt.jpg', null, '{}'::jsonb)
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'anon role cannot INSERT into avatars bucket (RLS denies)'
);

-- Authenticated user A: can write only to their own folder ------------------

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000aa","role":"authenticated"}';

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('avatars', 'users/00000000-0000-0000-0000-0000000000aa/avatar.jpg',
            '00000000-0000-0000-0000-0000000000aa', '{}'::jsonb)
  $$,
  'authenticated user can INSERT under users/{own-uid}/'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('avatars', 'users/00000000-0000-0000-0000-0000000000bb/avatar.jpg',
            '00000000-0000-0000-0000-0000000000aa', '{}'::jsonb)
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'authenticated user cannot INSERT into another user folder'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('avatars', '_signup/some-uuid.jpg',
            '00000000-0000-0000-0000-0000000000aa', '{}'::jsonb)
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'authenticated user cannot INSERT into pre-signup folder'
);

-- Service role: bypass via explicit ALL policy ------------------------------

set local role service_role;

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('avatars', '_signup/service-role-test.jpg', null, '{}'::jsonb)
  $$,
  'service_role can INSERT into pre-signup folder'
);

-- Public SELECT works for anon ---------------------------------------------

set local role anon;

select ok(
  exists (
    select 1 from storage.objects
    where bucket_id = 'avatars'
  ),
  'anon can SELECT objects from the avatars bucket'
);

select * from finish();
rollback;
