-- Thêm tài khoản admin
INSERT INTO account (account_id, username, password, role)
VALUES (UUID(), 'admin', '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq', 'ADMIN')
ON DUPLICATE KEY UPDATE username = username;

-- Thêm các loại phương tiện
INSERT INTO vehicle_type (id, name)
VALUES 
    (UUID(), 'Bicycle'),
    (UUID(), 'Motorbike'),
    (UUID(), 'Scooter')
ON DUPLICATE KEY UPDATE name = name;

-- Thêm giá cho các loại phương tiện
INSERT INTO price (type_id, day_price, night_price, monthly_price)
SELECT vt.id, 1000, 2000, 25000
FROM vehicle_type vt
WHERE vt.name = 'Bicycle'
ON DUPLICATE KEY UPDATE day_price = 1000, night_price = 2000, monthly_price = 25000;

INSERT INTO price (type_id, day_price, night_price, monthly_price)
SELECT vt.id, 3000, 4000, 120000
FROM vehicle_type vt
WHERE vt.name = 'Motorbike'
ON DUPLICATE KEY UPDATE day_price = 3000, night_price = 4000, monthly_price = 120000;

INSERT INTO price (type_id, day_price, night_price, monthly_price)
SELECT vt.id, 4000, 5000, 150000
FROM vehicle_type vt
WHERE vt.name = 'Scooter'
ON DUPLICATE KEY UPDATE day_price = 4000, night_price = 5000, monthly_price = 150000;

INSERT IGNORE INTO parking_card (card_id) VALUES 
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);
