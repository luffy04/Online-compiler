const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');


app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.static("public"));
app.set('view engine', 'ejs');

//==================================================>

//Home route
app.get('/', (req, res) => {
    res.render("home");
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.get('/register', (req, res) => {
    res.render("register");
})
// ===============================================>
//Route to get the code written in textEditor.html file

app.get('/run', (req, res) => {
    fs.readFile('output.txt', (err, data) => {
        console.log(data);
        res.render('result', { data: data });
    })
})

app.post('/run', (req, res) => {

    console.log(req.body.code);
    fs.writeFile('data.cpp', req.body.code, (err) => {
        if (err) throw err;

        console.log("Saved!!");
    })
    res.redirect('/run');
    exec('make data', (err, stdout, stderr) => {
        if (err) {
            console.log(stderr);
            return;
        }
        exec('./data', (err, stdout, stderr) => {
            fs.writeFile('output.txt', stdout, (err) => {
                if (err) throw err;
            })
        })
    })

})

// ==================================================> Result route

app.get('/result', (req, res) => {

})



//==========================================> Listening port

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
