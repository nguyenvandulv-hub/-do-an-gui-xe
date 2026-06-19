-- Thêm các thẻ xe (đảm bảo đủ thẻ từ 11 đến 100)
INSERT IGNORE INTO parking_card (card_id) VALUES 
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
(31),(32),(33),(34),(35),(36),(37),(38),(39),(40);

-- Thêm 3 nhân viên
INSERT IGNORE INTO account (account_id, username, password, role) VALUES
('acc-staff-1', 'staff1', '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq', 'STAFF'),
('acc-staff-2', 'staff2', '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq', 'STAFF'),
('acc-staff-3', 'staff3', '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq', 'STAFF');

INSERT IGNORE INTO staff (account_id, name, identification, phone_number, email, address, dob, gender, is_active) VALUES
('acc-staff-1', 'Nguyễn Văn Nhân Viên 1', '012345678901', '0987654321', 'staff1@ptit.edu.vn', 'Hà Nội', '2000-01-01', 'MALE', 1),
('acc-staff-2', 'Trần Thị Nhân Viên 2', '012345678902', '0987654322', 'staff2@ptit.edu.vn', 'Hà Nội', '1999-05-15', 'FEMALE', 1),
('acc-staff-3', 'Lê Văn Nhân Viên 3', '012345678903', '0987654323', 'staff3@ptit.edu.vn', 'Hà Nội', '2001-10-20', 'MALE', 1);

-- Thêm 5 khách hàng (3 sinh viên, 2 giảng viên)
INSERT IGNORE INTO customer (customer_id, name, dob, gender, phone_number, email, address, customer_type) VALUES
('cust-1', 'Nguyễn Văn Sinh Viên 1', '2002-01-10', 'MALE', '0911111111', 'sv1@stu.ptit.edu.vn', 'Hà Nội', 'STUDENT'),
('cust-2', 'Trần Thị Sinh Viên 2', '2002-05-20', 'FEMALE', '0922222222', 'sv2@stu.ptit.edu.vn', 'Hà Nội', 'STUDENT'),
('cust-3', 'Lê Văn Sinh Viên 3', '2001-08-15', 'MALE', '0933333333', 'sv3@stu.ptit.edu.vn', 'Hà Nội', 'STUDENT'),
('cust-4', 'Tiến sĩ Giảng Viên 1', '1980-02-28', 'MALE', '0944444444', 'gv1@ptit.edu.vn', 'Hà Nội', 'LECTURER'),
('cust-5', 'Thạc sĩ Giảng Viên 2', '1985-11-11', 'FEMALE', '0955555555', 'gv2@ptit.edu.vn', 'Hà Nội', 'LECTURER');

INSERT IGNORE INTO student_information (customer_id, student_id, major, faculty, class_info) VALUES
('cust-1', 'B20DCCN001', 'Công nghệ thông tin', 'CNTT', 'D20CQCN01-B'),
('cust-2', 'B20DCCN002', 'An toàn thông tin', 'ATTT', 'D20CQAT01-B'),
('cust-3', 'B20DCCN003', 'Điện tử viễn thông', 'DTVT', 'D20CQDT01-B');

INSERT IGNORE INTO lecturer_information (customer_id, lecturer_id) VALUES
('cust-4', 'GV001'),
('cust-5', 'GV002');

-- Thêm 5 Xe (Cho 5 khách hàng)
INSERT IGNORE INTO vehicle (vehicle_id, license_plate, brand, color, type_id)
SELECT 'veh-1', '29A1-111.11', 'Honda Wave', 'Đỏ', id FROM vehicle_type WHERE name = 'Motorbike' UNION ALL
SELECT 'veh-2', '29A1-222.22', 'Honda Vision', 'Trắng', id FROM vehicle_type WHERE name = 'Scooter' UNION ALL
SELECT 'veh-3', '29A1-333.33', 'Giant', 'Đen', id FROM vehicle_type WHERE name = 'Bicycle' UNION ALL
SELECT 'veh-4', '29A1-444.44', 'Honda SH', 'Đen', id FROM vehicle_type WHERE name = 'Scooter' UNION ALL
SELECT 'veh-5', '29A1-555.55', 'Yamaha Exciter', 'Xanh', id FROM vehicle_type WHERE name = 'Motorbike';

-- Thêm thanh toán vé tháng
INSERT IGNORE INTO payment (payment_id, amount, create_at, payment_type) VALUES
('pay-reg-1', 120000, NOW(), 'MONTHLY'),
('pay-reg-2', 150000, NOW(), 'MONTHLY'),
('pay-reg-3', 25000, NOW(), 'MONTHLY'),
('pay-reg-4', 150000, NOW(), 'MONTHLY'),
('pay-reg-5', 120000, NOW(), 'MONTHLY');

-- Thêm đăng ký vé tháng
INSERT IGNORE INTO active_monthly_registration (id, customer_id, vehicle_id, payment_id, issue_date, expiration_date, create_by) VALUES
('reg-1', 'cust-1', 'veh-1', 'pay-reg-1', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 'acc-staff-1'),
('reg-2', 'cust-2', 'veh-2', 'pay-reg-2', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'acc-staff-2'),
('reg-3', 'cust-3', 'veh-3', 'pay-reg-3', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'acc-staff-1'),
('reg-4', 'cust-4', 'veh-4', 'pay-reg-4', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 'acc-staff-3'),
('reg-5', 'cust-5', 'veh-5', 'pay-reg-5', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'acc-staff-2');

-- Thêm xe đang gửi trong bãi (Chưa ra)
INSERT IGNORE INTO parking_record (record_id, card_id, vehicle_type, license_plate, type, entry_time, staff_in)
SELECT 'rec-1', 11, id, '29B1-123.45', 'DAILY', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'acc-staff-1' FROM vehicle_type WHERE name = 'Motorbike' UNION ALL
SELECT 'rec-2', 12, id, '29B1-234.56', 'DAILY', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'acc-staff-2' FROM vehicle_type WHERE name = 'Scooter' UNION ALL
SELECT 'rec-3', 13, id, '29B1-345.67', 'DAILY', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'acc-staff-1' FROM vehicle_type WHERE name = 'Motorbike' UNION ALL
SELECT 'rec-4', 14, id, '29B1-456.78', 'DAILY', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'acc-staff-3' FROM vehicle_type WHERE name = 'Bicycle' UNION ALL
SELECT 'rec-5', 15, id, '29A1-111.11', 'MONTHLY', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'acc-staff-1' FROM vehicle_type WHERE name = 'Motorbike' UNION ALL
SELECT 'rec-6', 16, id, '29A1-222.22', 'MONTHLY', DATE_SUB(NOW(), INTERVAL 8 HOUR), 'acc-staff-2' FROM vehicle_type WHERE name = 'Scooter';

-- Thêm thanh toán lượt gửi xe đã hoàn thành (Xe đã ra)
INSERT IGNORE INTO payment (payment_id, amount, create_at, payment_type) VALUES
('pay-hist-1', 3000, DATE_SUB(NOW(), INTERVAL 2 HOUR), 'PARKING'),
('pay-hist-2', 4000, DATE_SUB(NOW(), INTERVAL 5 HOUR), 'PARKING'),
('pay-hist-3', 1000, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'PARKING'),
('pay-hist-4', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR), 'PARKING'),
('pay-hist-5', 0, DATE_SUB(NOW(), INTERVAL 4 HOUR), 'PARKING');

-- Thêm lịch sử xe đã ra khỏi bãi
INSERT IGNORE INTO parking_record_history (history_id, card_id, vehicle_type, license_plate, type, entry_time, exit_time, staff_in, staff_out, payment_id)
SELECT 'hist-1', 21, id, '29C1-111.11', 'DAILY', DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'acc-staff-1', 'acc-staff-2', 'pay-hist-1' FROM vehicle_type WHERE name = 'Motorbike' UNION ALL
SELECT 'hist-2', 22, id, '29C1-222.22', 'DAILY', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), 'acc-staff-3', 'acc-staff-1', 'pay-hist-2' FROM vehicle_type WHERE name = 'Scooter' UNION ALL
SELECT 'hist-3', 23, id, '29C1-333.33', 'DAILY', DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'acc-staff-2', 'acc-staff-3', 'pay-hist-3' FROM vehicle_type WHERE name = 'Bicycle' UNION ALL
SELECT 'hist-4', 24, id, '29A1-333.33', 'MONTHLY', DATE_SUB(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), 'acc-staff-1', 'acc-staff-3', 'pay-hist-4' FROM vehicle_type WHERE name = 'Bicycle' UNION ALL
SELECT 'hist-5', 25, id, '29A1-555.55', 'MONTHLY', DATE_SUB(NOW(), INTERVAL 9 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'acc-staff-2', 'acc-staff-2', 'pay-hist-5' FROM vehicle_type WHERE name = 'Motorbike';
