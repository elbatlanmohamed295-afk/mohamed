-- ====================================================
-- شغّل الكود ده مرة واحدة بس في: Supabase Dashboard > SQL Editor > New Query
-- ====================================================

-- 1) جدول الأعمال (Portfolio)
create table if not exists portfolio_items (
  id bigint generated always as identity primary key,
  title text not null,
  title_en text not null,
  category text not null,
  image_url text not null,
  project_link text,
  created_at timestamptz default now()
);

-- 2) جدول الروابط
create table if not exists saved_links (
  id bigint generated always as identity primary key,
  title text not null,
  url text not null,
  icon text default 'fa-solid fa-globe',
  created_at timestamptz default now()
);

-- 3) جدول معرض الصور
create table if not exists gallery_images (
  id bigint generated always as identity primary key,
  name text not null,
  image_url text not null,
  created_at timestamptz default now()
);

-- 4) جدول الملفات المرفوعة
create table if not exists uploaded_files (
  id bigint generated always as identity primary key,
  name text not null,
  size text,
  file_url text,
  created_at timestamptz default now()
);

-- 5) جدول إعدادات الموقع (صف واحد بس)
create table if not exists site_settings (
  id int primary key default 1,
  site_title text,
  site_email text,
  site_phone text,
  site_location text,
  site_description text,
  facebook_link text,
  twitter_link text,
  instagram_link text,
  linkedin_link text,
  github_link text
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ====================================================
-- تفعيل الحماية (RLS) مع سياسات مفتوحة للقراءة/الكتابة
-- ملاحظة: تسجيل الدخول عندك بسيط (من المتصفح فقط)، فمفيش حماية سيرفر حقيقية.
-- ده مقبول لموقع شخصي بسيط، لكن أي حد يعرف الـ anon key يقدر يعدل البيانات نظريًا.
-- لو حبيت حماية أقوى لاحقًا، نضيف Supabase Auth.
-- ====================================================
alter table portfolio_items enable row level security;
alter table saved_links enable row level security;
alter table gallery_images enable row level security;
alter table uploaded_files enable row level security;
alter table site_settings enable row level security;

create policy "public full access portfolio" on portfolio_items for all using (true) with check (true);
create policy "public full access links" on saved_links for all using (true) with check (true);
create policy "public full access gallery" on gallery_images for all using (true) with check (true);
create policy "public full access files" on uploaded_files for all using (true) with check (true);
create policy "public full access settings" on site_settings for all using (true) with check (true);

-- ====================================================
-- مكان تخزين الصور والملفات (Storage bucket)
-- ====================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "public read uploads" on storage.objects
  for select using (bucket_id = 'uploads');

create policy "public insert uploads" on storage.objects
  for insert with check (bucket_id = 'uploads');

create policy "public delete uploads" on storage.objects
  for delete using (bucket_id = 'uploads');
