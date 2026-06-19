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
sql += "SELECT account_id INTO @staff_id FROM account WHERE role = 'STAFF' LIMIT 1;\n";
sql += "SELECT id INTO @bike_id FROM vehicle_type WHERE name = 'Bicycle';\n";
sql += "SELECT id INTO @moto_id FROM vehicle_type WHERE name = 'Motorbike';\n";
sql += "SELECT id INTO @scooter_id FROM vehicle_type WHERE name = 'Scooter';\n\n";

for(let i=1; i<=40; i++) {
    const recordId = uuidv4();
    const cardId = getRandomInt(1, 1000);
    const isMonthly = Math.random() > 0.7;
    const type = isMonthly ? 'MONTHLY' : 'DAILY';
    
    const vehicleTypeArr = ['@moto_id', '@scooter_id', '@bike_id'];
    const vehicleType = vehicleTypeArr[getRandomInt(0, 2)];
    
    const licensePlate = vehicleType === '@bike_id' ? 'NULL' : `'29A${getRandomInt(1, 9)}-${getRandomInt(10000, 99999)}'`;
    const identifier = vehicleType === '@bike_id' ? `'BIKE-ACT-${getRandomInt(100, 999)}'` : licensePlate;
    
    const minutesAgo = getRandomInt(10, 60 * 12);
    
    sql += `INSERT IGNORE INTO parking_record (record_id, card_id, entry_time, identifier, license_plate, staff_in, type, vehicle_type) VALUES ('${recordId}', ${cardId}, DATE_SUB(NOW(), INTERVAL ${minutesAgo} MINUTE), ${identifier}, ${licensePlate}, @staff_id, '${type}', ${vehicleType});\n`;
}

fs.writeFileSync('seed_true_active.sql', sql);
console.log('Done generating seed_true_active.sql');
