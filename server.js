const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
const mongoose = require('mongoose');
var User = require("./models/user");
var passport = require('passport');
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/CompileIt");

app.use(require("express-session")({
    secret: "here it is",
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.set('view engine', 'ejs');



passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//==================================================>

//Home route
app.get('/', (req, res) => {
    res.render("welcome");
})

app.get('/home', (req, res) => {
    res.render("textEditor");
})

app.get('/login', (req, res) => {
    res.render("login");
})

app.post('/login', passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
}),
    (req, res) => {
    });

//+==========================================================>

app.get('/register', (req, res) => {
    res.render("register");
})

app.post('/register', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            return res.render("register");
        } else {
            user.email = req.body.email;
            console.log(user);
            res.render("login");
        }
    })
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
