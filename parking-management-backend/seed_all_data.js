const fs = require('fs');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let sql = '';

// Use admin as default creator if no staff exists
sql += "SELECT account_id INTO @admin_id FROM account WHERE role = 'ADMIN' LIMIT 1;\n";

// Vehicle Types
sql += "SELECT id INTO @bike_id FROM vehicle_type WHERE name = 'Bicycle';\n";
sql += "SELECT id INTO @moto_id FROM vehicle_type WHERE name = 'Motorbike';\n";
sql += "SELECT id INTO @scooter_id FROM vehicle_type WHERE name = 'Scooter';\n\n";

// 1. Generate Staff
for(let i=1; i<=3; i++) {
    let accId = uuidv4();
    let user = `staff_dummy_${i}`;
    // password is password
    let pass = '$2a$10$riOsq0JyAqDzFCXShMPvxeqILBKQnYdZik/ZYpeeEEodkyCMkf6Pq';
    sql += `INSERT IGNORE INTO account (account_id, password, role, username) VALUES ('${accId}', '${pass}', 'STAFF', '${user}');\n`;
    sql += `INSERT IGNORE INTO staff (account_id, address, dob, email, gender, identification, is_active, name, phone_number) VALUES ('${accId}', 'Hanoi', '1990-01-01', '${user}@test.com', 'MALE', '00109000000${i}', 1, 'Staff Name ${i}', '090000000${i}');\n`;
}

// Get a staff ID for operations
sql += "SELECT account_id INTO @staff_id FROM account WHERE role = 'STAFF' LIMIT 1;\n";

// 2. Generate Customers & Vehicles & Monthly Registrations
for(let i=1; i<=10; i++) {
    let cusId = uuidv4();
    let type = i % 2 === 0 ? 'STUDENT' : 'LECTURER';
    sql += `INSERT INTO customer (customer_id, address, customer_type, dob, email, gender, name, phone_number) VALUES ('${cusId}', 'Hanoi', '${type}', '2000-01-01', 'cus${i}@test.com', 'FEMALE', 'Customer ${i}', '080000000${i}');\n`;
    
    if (type === 'STUDENT') {
        sql += `INSERT INTO student_information (customer_id, class_info, faculty, major, student_id) VALUES ('${cusId}', 'Class ${i}', 'IT', 'SE', 'B20DCCN00${i}');\n`;
    } else {
        sql += `INSERT INTO lecturer_information (customer_id, lecturer_id) VALUES ('${cusId}', 'GV00${i}');\n`;
    }
    
    // Vehicle
    let vehId = uuidv4();
    let vType = ['@moto_id', '@scooter_id'][getRandomInt(0, 1)];
    let lp = vType === '@bike_id' ? 'NULL' : `'29X1-${getRandomInt(10000, 99999)}'`;
    sql += `INSERT INTO vehicle (vehicle_id, brand, color, license_plate, type_id) VALUES ('${vehId}', 'Honda', 'Red', ${lp}, ${vType});\n`;
    
    // Monthly Registration
    let payId = uuidv4();
    let regId = uuidv4();
    sql += `INSERT INTO payment (payment_id, amount, create_at, payment_type) VALUES ('${payId}', 150000, DATE_SUB(NOW(), INTERVAL ${getRandomInt(1, 20)} DAY), 'MONTHLY');\n`;
    sql += `INSERT INTO active_monthly_registration (id, expiration_date, issue_date, create_by, customer_id, payment_id, vehicle_id) VALUES ('${regId}', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), @staff_id, '${cusId}', '${payId}', '${vehId}');\n`;
}

// 3. Generate Missing Reports
for(let i=1; i<=5; i++) {
    let repId = uuidv4();
    let payId = uuidv4();
    let vType = ['@moto_id', '@scooter_id', '@bike_id'][getRandomInt(0, 2)];
    let lp = vType === '@bike_id' ? 'NULL' : `'29Y1-${getRandomInt(10000, 99999)}'`;
    let iden = vType === '@bike_id' ? `'BIKE-MISS-${i}'` : lp;
    
    sql += `INSERT INTO payment (payment_id, amount, create_at, payment_type) VALUES ('${payId}', 50000, DATE_SUB(NOW(), INTERVAL ${getRandomInt(1, 48)} HOUR), 'MISSING');\n`;
    sql += `INSERT INTO missing_report (report_id, address, brand, color, create_at, gender, identification, identifier, license_plate, name, phone_number, create_by, payment_id, record_id, vehicle_type) VALUES ('${repId}', 'Hanoi', 'Yamaha', 'Blue', DATE_SUB(NOW(), INTERVAL ${getRandomInt(1, 48)} HOUR), 'MALE', '00100000000${i}', ${iden}, ${lp}, 'Loser ${i}', '070000000${i}', @staff_id, '${payId}', NULL, ${vType});\n`;
}

// 4. Generate more parking records
for(let i=1; i<=50; i++) {
    const historyId = uuidv4();
    const paymentId = uuidv4();
    const cardId = getRandomInt(100, 900);
    const amount = [5000, 10000, 3000][getRandomInt(0, 2)];
    const vehicleType = ['@moto_id', '@scooter_id', '@bike_id'][getRandomInt(0, 2)];
    const licensePlate = vehicleType === '@bike_id' ? 'NULL' : `'29Z1-${getRandomInt(10000, 99999)}'`;
    const identifier = vehicleType === '@bike_id' ? `'BIKE-${getRandomInt(100, 999)}'` : licensePlate;
    const hoursAgo = getRandomInt(1, 72);
    const parkDuration = getRandomInt(1, 10);
    
    sql += `INSERT INTO payment (payment_id, amount, create_at, payment_type) VALUES ('${paymentId}', ${amount}, DATE_SUB(NOW(), INTERVAL ${hoursAgo} HOUR), 'PARKING');\n`;
    sql += `INSERT INTO parking_record_history (history_id, card_id, entry_time, exit_time, identifier, license_plate, payment_id, staff_in, staff_out, type, vehicle_type) VALUES ('${historyId}', ${cardId}, DATE_SUB(NOW(), INTERVAL ${hoursAgo + parkDuration} HOUR), DATE_SUB(NOW(), INTERVAL ${hoursAgo} HOUR), ${identifier}, ${licensePlate}, '${paymentId}', @staff_id, @staff_id, 'DAILY', ${vehicleType});\n`;
}

fs.writeFileSync('seed_all.sql', sql);
console.log('SQL generated to seed_all.sql');
