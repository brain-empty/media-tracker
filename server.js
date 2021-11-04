if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require("express")
const app = express()
const expressLayouts = require ("express-ejs-layouts")
const bodyParser = require ("body-parser");
const methodOverride = require ("method-override")

//setting things
app.set("view engine", "ejs");
app.set("views", __dirname + '/views');
app.set ("layout", "layouts/layout");
app.use(expressLayouts);
app.use (methodOverride(''));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({limit:'10mb', extended:false}));

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
//routes setting
app.use('/', indexRouter);
app.use('/movies', moviesRouter);
app.use('/staff', staffRouter);
app.use('/search', searchRouter);
app.use('/books', booksRouter);

app.listen(process.env.PORT || 3000, () => console.log ("started app on port 3000"));

