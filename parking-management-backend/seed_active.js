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

// Get a staff ID for operations
sql += "SELECT account_id INTO @staff_id FROM account WHERE role = 'STAFF' LIMIT 1;\n";

// Vehicle Types
sql += "SELECT id INTO @bike_id FROM vehicle_type WHERE name = 'Bicycle';\n";
sql += "SELECT id INTO @moto_id FROM vehicle_type WHERE name = 'Motorbike';\n";
sql += "SELECT id INTO @scooter_id FROM vehicle_type WHERE name = 'Scooter';\n\n";

// Generate active parking records (exit_time IS NULL)
for(let i=1; i<=40; i++) {
    const historyId = uuidv4();
    const cardId = getRandomInt(1, 1000); // Cards exist up to 1000
    
    // Some are daily, some are monthly
    const isMonthly = Math.random() > 0.7;
    const type = isMonthly ? 'MONTHLY' : 'DAILY';
    
    const vehicleType = ['@moto_id', '@scooter_id', '@bike_id'][getRandomInt(0, 2)];
    const licensePlate = vehicleType === '@bike_id' ? 'NULL' : `'29A${getRandomInt(1, 9)}-${getRandomInt(10000, 99999)}'`;
    const identifier = vehicleType === '@bike_id' ? `'BIKE-ACT-${getRandomInt(100, 999)}'` : licensePlate;
    
    const minutesAgo = getRandomInt(10, 60 * 12); // Between 10 mins and 12 hours ago
    
    sql += `INSERT IGNORE INTO parking_record_history (history_id, card_id, entry_time, exit_time, identifier, license_plate, payment_id, staff_in, staff_out, type, vehicle_type) VALUES ('${historyId}', ${cardId}, DATE_SUB(NOW(), INTERVAL ${minutesAgo} MINUTE), NULL, ${identifier}, ${licensePlate}, NULL, @staff_id, NULL, '${type}', ${vehicleType});\n`;
}

fs.writeFileSync('seed_active_records.sql', sql);
console.log('SQL generated to seed_active_records.sql');
