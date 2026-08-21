-- Seeded users. Passwords (BCrypt-hashed below):
--   creator1   / creator123
--   creator2   / creator123
--   purchaser1 / purchaser123
-- MERGE avoids duplicate rows on every restart (H2 upsert by primary key / unique username).

MERGE INTO users (id, username, password, full_name, email, role) KEY(username) VALUES
  (1, 'creator1',   '$2b$10$gkJvVIAU7doiNqQRvK/3KuaHAACXOWjCPWAMnTkWoAKmI0D3d1Uje', 'Asha Verma',   'asha.verma@vardhiin.com',   'CREATOR'),
  (2, 'creator2',   '$2b$10$gkJvVIAU7doiNqQRvK/3KuaHAACXOWjCPWAMnTkWoAKmI0D3d1Uje', 'Rohit Sharma', 'rohit.sharma@vardhiin.com', 'CREATOR'),
  (3, 'purchaser1', '$2b$10$SwNwjw0fjWN3AdiLo3JkYODYY4bNBljFAtFL3jv3.NJW59GOBVNCi', 'Meera Nair',   'meera.nair@vardhiin.com',   'PURCHASER');
