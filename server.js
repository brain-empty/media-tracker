if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require("express")
const app = express()
const expressLayouts = require ("express-ejs-layouts")
const bodyParser = require ("body-parser");
const methodOverride = require ("method-override")
const passport = require ('passport');
const flash = require ('express-flash')
const session = require ('express-session')
const User = require ('./models/user')
const bcrypt = require ('bcrypt');
const initializePassport = require ('./passport-config');
        initializePassport (
            passport, 
            email => User.find ({email:email}),
            id => User.findById(id)
        );

//setting things
app.set("view engine", "ejs");
app.set("views", __dirname + '/views');
app.set ("layout", "layouts/layout");
app.use(expressLayouts);
app.use (methodOverride('_method'));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({limit:'20mb', extended:false}));
app.use (flash ())
app.use (session ({
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized : false
}))
app.use (passport.initialize())
app.use (passport.session())

//connecting database
    const mongoose = require ("mongoose");
    mongoose.connect(process.env.DATABASE_URL, {useNewURLParser : true});
    const db = mongoose.connection
    db.on('error', error => console.error(error))
    db.once('open', () => console.log ("db connected."))

//routes definition
    const indexRouter = require ('./routes/index');
    const moviesRouter = require ('./routes/movies');
    const staffRouter = require ('./routes/staff');
    const searchRouter = require ('./routes/search');
    const booksRouter = require ('./routes/books');
    const userRouter = require ('./routes/user');
    const showsRouter = require ('./routes/shows')

//routes setting
    app.use('/', indexRouter);
    app.use('/movies', moviesRouter);
    app.use('/staff', staffRouter);
    app.use('/search', searchRouter);
    app.use('/books', booksRouter);
    app.use('/user', userRouter);
    app.use('/shows', showsRouter)

//user auth
    // user auth setup 

    //login render
        app.get('/login',checkNotAuthenticated, async (req, res) => {
            res.render('login')
        })

    //check login
        app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }))

    //register render
        app.get('/register',checkNotAuthenticated, async (req, res) => {
            res.render('register')
        })

    //save user 
        app.post('/register', checkNotAuthenticated, async (req,res) => {
            checkUser = await User.find({ username : req.body.username})
            checkEmail = await User.find({ email : req.body.email})

            if (checkEmail.length!=0){
                res.render('register', {
                    errorMessage:'Email is already being used for another account.',
                    username:req.body.username,
                    email:req.body.email
                })
            } else if (checkUser.length!=0) {
                res.render('register', {
                    errorMessage:'Username is already taken.',
                    username:req.body.username,
                    email:req.body.email
                })
            }  else if (req.body.password!=req.body.confirmpassword) {
                res.render('register', {
                    errorMessage:'Passwords do not match.',
                    username:req.body.username,
                    email:req.body.email
                })
            } else {
                try {
                    const hashedPassword = await bcrypt.hash (req.body.password, 10);
console.log(User)
                    const newUser = new User ({
                        username : req.body.username,
                        email : req.body.email,
                        password : hashedPassword 
                    })
                    console.log(newUser)
                    const user = await newUser.save ()
                    res.redirect('/login')
                } catch (err) {
                    console.log( err + ' - in post /register in users route')
                    res.redirect('/register')
                }
            }
        })

        function checkAuthenticated(req, res, next) {
            if (req.isAuthenticated()) {
              return next()
            }
          
            res.redirect('/login')
          }          

        function checkNotAuthenticated(req, res, next) {
            if (req.isAuthenticated()) {
              return res.redirect('/')
            }
            next()
          }

    //logout
    app.delete('/logout', (req, res) => {
        req.logOut()
        res.redirect('/')
    })

app.listen(process.env.PORT || 3000, () => console.log ("started app on port 3000"));

