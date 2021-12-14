const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');
const Show = require ('../models/show');
const Book = require ('../models/book');

router.get('/', async (req, res) => {
    const movies = await Movie.find().limit(5);
    const shows = await Show.find().limit(5);
    const books = await Book.find().limit(5);
    let passObj = {
        movies:movies,
        shows:shows,
        books:books,
    }
    if (req.user) {passObj.user = req.user}
    res.render('index', passObj);
})

module.exports = router;