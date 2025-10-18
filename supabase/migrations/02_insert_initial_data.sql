-- =============================================
-- 초기 데이터 INSERT
-- provinces, regencies, categories
-- =============================================

-- =============================================
-- 1. PROVINCES (인도네시아 주요 도시/지역)
-- =============================================

INSERT INTO provinces (province_id, province_name) VALUES
(1, 'DKI Jakarta'),
(2, 'Jawa Barat'),
(3, 'Jawa Tengah'),
(4, 'Jawa Timur'),
(5, 'Banten'),
(6, 'Bali'),
(7, 'Sumatera Utara'),
(8, 'Sumatera Selatan'),
(9, 'Kalimantan Timur'),
(10, 'Sulawesi Selatan')
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. REGENCIES (주요 시/군/구)
-- =============================================

-- Jakarta
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(101, 'Jakarta Pusat', 1),
(102, 'Jakarta Selatan', 1),
(103, 'Jakarta Timur', 1),
(104, 'Jakarta Barat', 1),
(105, 'Jakarta Utara', 1)
ON CONFLICT DO NOTHING;

-- Jawa Barat
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(201, 'Bandung Kota', 2),
(202, 'Bandung Barat', 2),
(203, 'Bekasi Kota', 2),
(204, 'Bogor Kota', 2),
(205, 'Depok', 2),
(206, 'Cimahi', 2)
ON CONFLICT DO NOTHING;

-- Jawa Tengah
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(301, 'Semarang Kota', 3),
(302, 'Solo (Surakarta)', 3),
(303, 'Yogyakarta', 3)
ON CONFLICT DO NOTHING;

-- Jawa Timur
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(401, 'Surabaya Kota', 4),
(402, 'Malang Kota', 4),
(403, 'Surabaya Selatan', 4),
(404, 'Surabaya Pusat', 4)
ON CONFLICT DO NOTHING;

-- Banten
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(501, 'Tangerang Kota', 5),
(502, 'Tangerang Selatan', 5),
(503, 'Serang', 5)
ON CONFLICT DO NOTHING;

-- Bali
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(601, 'Denpasar', 6),
(602, 'Badung', 6),
(603, 'Gianyar', 6)
ON CONFLICT DO NOTHING;

-- Sumatera Utara
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(701, 'Medan Kota', 7),
(702, 'Deli Serdang', 7)
ON CONFLICT DO NOTHING;

-- Sumatera Selatan
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(801, 'Palembang', 8)
ON CONFLICT DO NOTHING;

-- Kalimantan Timur
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(901, 'Balikpapan', 9),
(902, 'Samarinda', 9)
ON CONFLICT DO NOTHING;

-- Sulawesi Selatan
INSERT INTO regencies (regency_id, regency_name, province_id) VALUES
(1001, 'Makassar', 10)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. CATEGORIES (직종 대분류)
-- =============================================

INSERT INTO categories (category_id, name, parent_category) VALUES
-- IT & Technology
(1, 'IT & Teknologi', NULL),
-- Marketing & Sales
(2, 'Marketing & Penjualan', NULL),
-- Finance & Accounting
(3, 'Keuangan & Akuntansi', NULL),
-- Human Resources
(4, 'SDM & Rekrutmen', NULL),
-- Education
(5, 'Pendidikan', NULL),
-- Healthcare
(6, 'Kesehatan', NULL),
-- Engineering
(7, 'Teknik & Manufaktur', NULL),
-- Hospitality & Tourism
(8, 'Perhotelan & Pariwisata', NULL),
-- Creative & Design
(9, 'Kreatif & Desain', NULL),
-- Customer Service
(10, 'Layanan Pelanggan', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. SUBCATEGORIES (직종 소분류)
-- =============================================

-- IT & Teknologi (parent_category = 1)
INSERT INTO categories (category_id, name, parent_category) VALUES
(101, 'Software Developer', 1),
(102, 'Web Developer', 1),
(103, 'Mobile Developer', 1),
(104, 'Data Analyst', 1),
(105, 'Data Scientist', 1),
(106, 'DevOps Engineer', 1),
(107, 'System Administrator', 1),
(108, 'Network Engineer', 1),
(109, 'UI/UX Designer', 1),
(110, 'Quality Assurance', 1),
(111, 'Database Administrator', 1),
(112, 'IT Support', 1)
ON CONFLICT DO NOTHING;

-- Marketing & Penjualan (parent_category = 2)
INSERT INTO categories (category_id, name, parent_category) VALUES
(201, 'Digital Marketing', 2),
(202, 'Marketing Manager', 2),
(203, 'Sales Executive', 2),
(204, 'Account Manager', 2),
(205, 'Social Media Specialist', 2),
(206, 'Content Writer', 2),
(207, 'SEO Specialist', 2),
(208, 'Brand Manager', 2)
ON CONFLICT DO NOTHING;

-- Keuangan & Akuntansi (parent_category = 3)
INSERT INTO categories (category_id, name, parent_category) VALUES
(301, 'Akuntan', 3),
(302, 'Financial Analyst', 3),
(303, 'Tax Specialist', 3),
(304, 'Auditor', 3),
(305, 'Finance Manager', 3),
(306, 'Kasir', 3)
ON CONFLICT DO NOTHING;

-- SDM & Rekrutmen (parent_category = 4)
INSERT INTO categories (category_id, name, parent_category) VALUES
(401, 'HR Manager', 4),
(402, 'Recruiter', 4),
(403, 'HR Generalist', 4),
(404, 'Training Specialist', 4)
ON CONFLICT DO NOTHING;

-- Pendidikan (parent_category = 5)
INSERT INTO categories (category_id, name, parent_category) VALUES
(501, 'Guru', 5),
(502, 'Dosen', 5),
(503, 'Tutor', 5),
(504, 'Kepala Sekolah', 5),
(505, 'Admin Sekolah', 5)
ON CONFLICT DO NOTHING;

-- Kesehatan (parent_category = 6)
INSERT INTO categories (category_id, name, parent_category) VALUES
(601, 'Dokter', 6),
(602, 'Perawat', 6),
(603, 'Bidan', 6),
(604, 'Apoteker', 6),
(605, 'Ahli Gizi', 6),
(606, 'Fisioterapis', 6)
ON CONFLICT DO NOTHING;

-- Teknik & Manufaktur (parent_category = 7)
INSERT INTO categories (category_id, name, parent_category) VALUES
(701, 'Mechanical Engineer', 7),
(702, 'Electrical Engineer', 7),
(703, 'Civil Engineer', 7),
(704, 'Production Manager', 7),
(705, 'Quality Control', 7)
ON CONFLICT DO NOTHING;

-- Perhotelan & Pariwisata (parent_category = 8)
INSERT INTO categories (category_id, name, parent_category) VALUES
(801, 'Hotel Manager', 8),
(802, 'Front Office', 8),
(803, 'Housekeeping', 8),
(804, 'Chef', 8),
(805, 'Waiter/Waitress', 8),
(806, 'Tour Guide', 8)
ON CONFLICT DO NOTHING;

-- Kreatif & Desain (parent_category = 9)
INSERT INTO categories (category_id, name, parent_category) VALUES
(901, 'Graphic Designer', 9),
(902, 'Video Editor', 9),
(903, 'Photographer', 9),
(904, 'Animator', 9),
(905, 'Illustrator', 9)
ON CONFLICT DO NOTHING;

-- Layanan Pelanggan (parent_category = 10)
INSERT INTO categories (category_id, name, parent_category) VALUES
(1001, 'Customer Service', 10),
(1002, 'Call Center Agent', 10),
(1003, 'Receptionist', 10),
(1004, 'Customer Success Manager', 10)
ON CONFLICT DO NOTHING;
