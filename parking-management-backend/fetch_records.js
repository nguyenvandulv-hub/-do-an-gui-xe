fetch('http://localhost:8080/api/v1/parking/records', {
  headers: {
    'Authorization': 'Bearer ' + process.argv[2]
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d.result, null, 2)));
