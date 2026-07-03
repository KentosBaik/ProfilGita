-- DDL untuk Migrasi Database ke Supabase PostgreSQL
-- Silakan salin dan jalankan query ini di SQL Editor dashboard Supabase Anda.

-- 1. Tabel profile
CREATE TABLE IF NOT EXISTS profile (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nama TEXT NOT NULL,
    profesi TEXT,
    deskripsi TEXT,
    email TEXT,
    github TEXT,
    linkedin TEXT,
    instagram TEXT,
    foto TEXT
);

-- 2. Tabel articles
CREATE TABLE IF NOT EXISTS articles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel contacts
CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    pesan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel notification_subscriptions
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel projects
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    teknologi TEXT,
    github TEXT,
    demo TEXT,
    gambar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nonaktifkan Row Level Security (RLS) agar API Anon dapat mengakses data tanpa autentikasi tambahan
ALTER TABLE profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Masukkan data awal untuk Profile
INSERT INTO profile (nama, profesi, deskripsi, email, github, linkedin, instagram, foto)
SELECT 
    'Gita Wahyuni',
    'Mahasiswa Informatika',
    'Hi, saya Gita Wahyuni. Saya berusia 19 tahun dan berasal dari Cilacap. Saat ini saya sedang menempuh pendidikan di Universitas Nahdlatul Ulama Al-Ghazali Cilacap prodi Informatika.',
    'gita@email.com',
    'https://github.com/gitawahyuni',
    'https://linkedin.com/in/gitawahyuni',
    'https://instagram.com/gitawahyuni',
    'images/fotogita.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM profile);

-- Masukkan data awal untuk Projects
INSERT INTO projects (nama, deskripsi, teknologi, github, demo, gambar)
SELECT 'Website Profile Pribadi', 'Website portofolio responsive lengkap dengan fitur push notification, geolocation, dan CMS artikel.', 'HTML, CSS, JavaScript, Express.js, MySQL', 'https://github.com/gitawahyuni/profile-gita', 'https://profile-gita.vercel.app', 'images/icon-profile1.png'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE nama = 'Website Profile Pribadi');

INSERT INTO projects (nama, deskripsi, teknologi, github, demo, gambar)
SELECT 'PWA Push Notification Demo', 'Aplikasi demo implementasi Progressive Web App dengan caching offline dan notifikasi push dari server.', 'HTML, CSS, Service Worker, Web Push API', 'https://github.com/gitawahyuni/pwa-notification', 'https://pwa-notification.vercel.app', 'images/icon-profile2.png'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE nama = 'PWA Push Notification Demo');
