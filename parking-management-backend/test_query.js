const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'parking_management',
  port: 3308
});

connection.query(
  "SELECT v.license_plate, v.type_id FROM active_monthly_registration a JOIN vehicle v ON a.vehicle_id = v.vehicle_id WHERE v.license_plate = '29X1-13060'",
  function(err, results, fields) {
    console.log("29X1-13060 registration:", results);
    
    connection.query(
      "SELECT v.license_plate, v.type_id FROM active_monthly_registration a JOIN vehicle v ON a.vehicle_id = v.vehicle_id WHERE v.license_plate = '29X1-62914'",
      function(err, results, fields) {
        console.log("29X1-62914 registration:", results);
        connection.end();
      }
    );
  }
);
