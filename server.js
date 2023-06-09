if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const bodyParser = require('body-parser')


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )



const users = []

const currentUser = {}


const events = [
    {
      id: 1,
      title: 'Hackathon',
      description: 'Description of Event 1'
    },
    {
      id: 2,
      title: 'Quiz Bowl',
      description: 'Description of Event 2'
    },
    {
        id: 3,
        title: 'Mobile Legends',
        description: 'Description of Event 3'
    }
  ];


const registrations = [];
const registration = {}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users); // Display newly registered in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})

// Routes
app.get('/', checkAuthenticated, (req, res) => { 
    res.render("index.ejs", {name: req.user.name, events,registrations})
    currentUser.name = req.user.name
    currentUser.email = req.user.email
    console.log(currentUser)
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes


app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        delete currentUser
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

// to handle registration form submission
app.post('/submit-registration', (req, res) => {
    const { eventId } = req.body;
    const event = events.find(event => event.id === parseInt(eventId));

    if (event) {
      registration.name = currentUser.name
      registration.email = currentUser.email
      registration.eventId = eventId
      registrations.push(registration);
      console.log(registration);
      res.redirect('/')
    } else {
      res.status(404).send('Event not found');
    }
  });


app.listen(3000) 