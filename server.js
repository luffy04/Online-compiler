const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const https = require('https');
const fs = require('fs');



app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.static("public"));
app.set('view engine', 'ejs');

// ============================================>
//Sphere ide route  - TO CHECK WORKING STATUS


var request = require('request');

// define access parameters
var accessToken = '2daee9913184ddf82b30e3753dfeeed0';
var endpoint = '801134c0.compilers.sphere-engine.com';

// send request
request({
    url: 'https://' + endpoint + '/api/v4/test?access_token=' + accessToken,
    method: 'GET'
}, function (error, response, body) {

    if (error) {
        console.log('Connection problem');
    }

    // process response
    if (response) {
        if (response.statusCode === 200) {
            console.log(JSON.parse(response.body)); // test message in JSON
        } else {
            if (response.statusCode === 401) {
                console.log('Invalid access token');
            }
        }
    }
});

//==================================================>

//Home route
app.get('/', (req, res) => {
    res.render("textEditor.ejs")
})


// ===========================================================
//result route

app.get('/result', (req, res) => {
    var ans;
    fs.readFile("temp.txt", 'utf8', (err, data) => {
        if (err) throw err;

        console.log(data);
        ans = data;

    })
})

// ===============================================>
//Route to get the code written in textEditor.html file

app.post('/run', function (req, res) {

    var submissionData = {
        compilerId: 1,   // For CPP compiler
        source: req.body.code
    };
    // console.log(JSON.parse(req.body));
    console.log(req.body.code);

    submission(submissionData, endpoint, accessToken, res);

})




//==========================================> Listening port

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

function submission(submissionData, endpoint, accessToken, res) {
    //request for submission 
    request({
        url: 'https://' + endpoint + '/api/v4/submissions?access_token=' + accessToken,
        method: 'POST',
        form: submissionData
    }, function (error, response, body) {

        if (error) {
            console.log('Connection problem');
        }

        // process response
        if (response) {
            if (response.statusCode === 201) {
                console.log(JSON.parse(response.body));
                var response_id = JSON.parse(response.body);
                console.log(response_id.id);

                //console.log(JSON.parse(response.body).id); // submission data in JSON
            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                } else if (response.statusCode === 402) {
                    console.log('Unable to create submission');
                } else if (response.statusCode === 400) {
                    var body = JSON.parse(response.body);
                    console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                }
                var response_id = -1//If the process is not completed
            }
        }
        setTimeout(function () {
            result(endpoint, response_id.id, accessToken, res)
        }, 10000);
    });
}

function result(endpoint, response_id, accessToken, res) {
    //Request for result
    console.log(response_id);
    console.log(endpoint);
    console.log(accessToken);
    request({
        url: 'https://' + endpoint + '/api/v4/submissions/' + response_id + '?access_token=' + accessToken,
        method: 'GET'
    }, function (error, response, body) {

        if (error) {
            console.log('Connection problem');
        }

        // process response
        if (response) {
            if (response.statusCode === 200) {
                console.log(JSON.parse(response.body)); // submission data in JSON
                var output = JSON.parse(response.body);
                const file = output.result.streams.output.uri;
                console.log(file);
                const myFile = fs.createWriteStream('temp.txt');
                const request = https.get(file, function (response) {
                    response.pipe(myFile);
                })
                setTimeout(function () {
                    res.redirect('/result');
                }, 6000);


            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                }
                if (response.statusCode === 403) {
                    console.log('Access denied');
                }
                if (response.statusCode === 404) {
                    console.log('Submision not found');
                }
            }
        }
    });
}


// yogoh85843@mailer9.net
// tempmail