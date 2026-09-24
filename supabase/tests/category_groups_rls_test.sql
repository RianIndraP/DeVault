BEGIN;
SELECT plan(4);

SELECT ok(to_regclass('public.category_groups') IS NOT NULL, 'category_groups table exists');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.category_groups'::regclass), 'RLS is enabled');
SELECT ok(has_table_privilege('authenticated', 'public.category_groups', 'select'), 'authenticated can read category groups');
SELECT ok((SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'category_groups') = 4, 'all category group policies exist');

SELECT * FROM finish();
ROLLBACK;
