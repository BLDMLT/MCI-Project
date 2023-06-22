var express = require('express');
var app = express();
var bodyParser = require('body-parser');
   
  // address http://127.0.0.1:8081/
  var urlencodedParser = bodyParser.urlencoded({ extended: false })
   
  app.use('/public', express.static('public'));

  app.get('/', function (req, res) {
     res.sendFile( __dirname + "/" + "index.html" );
  })
  app.get('/success', function (req, res) {
     res.sendFile( __dirname + "/" + "success.html" );
  })
  app.get('/fail', function (req, res) {
     res.sendFile( __dirname + "/" + "fail.html" );
  })
  app.post('/process_response', urlencodedParser, function (req, res) {
    if(req.body.submit === 'submit'){
      if(req.body.cs_id!=""&&req.body.as_id!=""&&req.body.token!=""&&req.body.host!=""&&
        req.body.username!=""&&req.body.password!=""&&req.body.path!=""){
        var check=getjson_myuni(req.body.cs_id, req.body.as_id, req.body.token, req.body.host, 
          req.body.username,req.body.password,req.body.path,res,getSubmission);
      }
    }
  })
  app.post('/', urlencodedParser, function (req, res) {
      res.sendFile( __dirname + "/" + "index.html" );
  })
  var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  })
// getjson_myuni(8589,158949,'7036~mv2bsSy34e78P514Stk38MwyHaNFU9vx84MLZfrDe3YE1t4q2jOOLKz3uDzfqaUe',getSubmission);
// host: '192.168.43.153', username: 'teacher',password: 'teacher'
// path: /2020/s1/oop/prac1
function getjson_myuni(course_id, assignment_id, token,host,username,password,path,res,cb){
  const request = require('request');
  var check = true;
  request({
      url: 'https://myuni.adelaide.edu.au/api/v1/courses/'+course_id+'/assignments/'+assignment_id+'/submissions/',
      method: "GET",

      headers: {
          'Authorization': 'Bearer '+token
      },
  }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var myuni =  JSON.parse(body,course_id,assignment_id,token);
        cb(myuni,course_id,assignment_id,token,host,username,password,path,res);
      }
      else{
        res.sendFile( __dirname + "/" + "fail.html" );  
      }
  }); 
}
function getSubmission(myuni_inf,cs_id,as_id,token,host,username,password,path,res){
    let webpath = '/users/assessment/websubmit/'+ path +'marks-all.csv';
    const parse = require('csv-parse/lib/sync')
    const fs = require('fs');
    const request = require('request');
    let Client = require('ssh2-sftp-client');
    let sftp = new Client();
    var csv = require("csvtojson");
    sftp.connect({
      host: host,
      username: username,
      password: password
    }).then(() => {      
      return sftp.get(webpath);
    }).then((data) => {
      csv()
        .fromString(data.toString()) // changed this from  .fromStream(data)
        .subscribe(function(jsonObj) { //single json object will be emitted for each csv line
          // parse each json asynchronousely
          return new Promise(function(resolve, reject) {
            resolve();
            for(i = 0;i<myuni_inf.length;i++){
                if("a" + myuni_inf[i].id == jsonObj.StudentID ){
                    var requestData = { "grade_data": { [myuni_inf[i].user_id] : { "posted_grade": jsonObj.Mark } } };
                    request({
                      url: 'https://myuni.adelaide.edu.au/api/v1/courses/'+ cs_id +'/assignments/'+ as_id +'/submissions/update_grades',
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                        'Authorization': 'Bearer '+token,
                      },
                      body: JSON.stringify(requestData)
                    }, function(error, response, body) {
                      if (!error ) {
                        res.sendFile( __dirname + "/" + "fail.html" );                        
                      }
                    });
                }
            }
            res.sendFile( __dirname + "/" + "success.html" );
          })
        })
    }).catch((err) => {
      console.log(err, 'catch error');
      res.sendFile( __dirname + "/" + "fail.html" );
    });
}
