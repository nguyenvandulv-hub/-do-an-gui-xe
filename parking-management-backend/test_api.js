fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'thaidui', password: 'password' }) // Or whatever the staff credentials are
}).then(r => r.json()).then(data => {
  const token = data.result.token;
  return fetch('http://localhost:8080/api/v1/parking/entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      licensePlate: '29X1-13060',
      vehicleTypeId: 'fc149233-655c-11f1-be1c-3a7b77eb7502', // Xe máy
      cardId: 99
    })
  });
}).then(r => r.json()).then(console.log);
