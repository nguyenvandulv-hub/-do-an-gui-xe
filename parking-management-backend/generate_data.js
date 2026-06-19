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

const numRecords = 50;
let sql = '';

sql += "SELECT account_id INTO @staff1 FROM account LIMIT 1;\n";
sql += "SELECT id INTO @bike_id FROM vehicle_type WHERE name = 'Bicycle';\n";
sql += "SELECT id INTO @moto_id FROM vehicle_type WHERE name = 'Motorbike';\n";
sql += "SELECT id INTO @scooter_id FROM vehicle_type WHERE name = 'Scooter';\n\n";

for (let i = 0; i < numRecords; i++) {
    const historyId = uuidv4();
    const paymentId = uuidv4();
    const cardId = getRandomInt(100, 900);
    const amount = [5000, 10000, 3000][getRandomInt(0, 2)];
    
    const vehicleType = ['@moto_id', '@scooter_id', '@bike_id'][getRandomInt(0, 2)];
    const licensePlate = vehicleType === '@bike_id' ? 'NULL' : `'29A1-${getRandomInt(10000, 99999)}'`;
    const identifier = vehicleType === '@bike_id' ? `'BIKE-${getRandomInt(100, 999)}'` : licensePlate;
    
    const hoursAgo = getRandomInt(1, 72);
    const parkDuration = getRandomInt(1, 10);
    
    sql += `INSERT INTO payment (payment_id, amount, create_at, payment_type) VALUES ('${paymentId}', ${amount}, DATE_SUB(NOW(), INTERVAL ${hoursAgo} HOUR), 'PARKING');\n`;
    sql += `INSERT INTO parking_record_history (history_id, card_id, entry_time, exit_time, identifier, license_plate, payment_id, staff_in, staff_out, type, vehicle_type) VALUES ('${historyId}', ${cardId}, DATE_SUB(NOW(), INTERVAL ${hoursAgo + parkDuration} HOUR), DATE_SUB(NOW(), INTERVAL ${hoursAgo} HOUR), ${identifier}, ${licensePlate}, '${paymentId}', @staff1, @staff1, 'DAILY', ${vehicleType});\n`;
}

fs.writeFileSync('insert_history.sql', sql);
console.log('SQL generated to insert_history.sql');
