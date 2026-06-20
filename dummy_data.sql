SET @staff1 = UUID();
SET @staff2 = UUID();

INSERT INTO account (account_id, password, role, username) VALUES 
(@staff1, '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq', 'STAFF', 'staff1'),
(@staff2, '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq', 'STAFF', 'staff2');

INSERT INTO staff (account_id, address, dob, email, gender, identification, is_active, name, phone_number) VALUES
(@staff1, 'Hà Nội', '1995-01-01', 'staff1@test.com', 'MALE', '001095000001', 1, 'Nguyễn Văn A', '0901234567'),
(@staff2, 'Hồ Chí Minh', '1998-05-05', 'staff2@test.com', 'FEMALE', '001098000002', 1, 'Trần Thị B', '0912345678');

SELECT id INTO @bike_id FROM vehicle_type WHERE name = 'Bicycle';
SELECT id INTO @moto_id FROM vehicle_type WHERE name = 'Motorbike';
SELECT id INTO @scooter_id FROM vehicle_type WHERE name = 'Scooter';

INSERT INTO parking_record (record_id, entry_time, identifier, license_plate, type, card_id, staff_in, vehicle_type) VALUES
(UUID(), DATE_SUB(NOW(), INTERVAL 2 HOUR), '29A1-12345', '29A1-12345', 'DAILY', 10, @staff1, @moto_id),
(UUID(), DATE_SUB(NOW(), INTERVAL 5 HOUR), '30B2-56789', '30B2-56789', 'DAILY', 11, @staff1, @scooter_id),
(UUID(), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'BIKE-001', NULL, 'DAILY', 12, @staff2, @bike_id),
(UUID(), DATE_SUB(NOW(), INTERVAL 30 MINUTE), '29C3-99999', '29C3-99999', 'DAILY', 13, @staff2, @moto_id),
(UUID(), DATE_SUB(NOW(), INTERVAL 10 MINUTE), '30D4-88888', '30D4-88888', 'DAILY', 14, @staff1, @scooter_id);
