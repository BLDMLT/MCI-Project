let Client = require('ssh2-sftp-client');
let sftp = new Client();
var csv = require("csvtojson");

sftp.connect({
  host: '192.168.0.11',
  username: 'teacher',
  password: 'teacher'
}).then(() => {
  return sftp.get('/users/assessment/websubmit/2020/s1/oop/prac1/marks-all.csv');
}).then((data) => {
  csv()
    .fromString(data.toString()) // changed this from  .fromStream(data)
    .subscribe(function(jsonObj) { //single json object will be emitted for each csv line
      // parse each json asynchronousely
      return new Promise(function(resolve, reject) {
        resolve()
        console.log(jsonObj);
      })
    })
}).catch((err) => {
  console.log(err, 'catch error');
});