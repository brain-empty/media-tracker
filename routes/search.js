const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Book = require ('../models/book');
const Show = require ('../models/show');

router.get('/', async (req, res) => {
    let searchOptions = {}

    if (req.query.search != null && req.query.search !== ''){
        searchOptions.name = new RegExp (req.query.search, 'i')
        // regexp makes the program search for the string even if it's not a full match (ke search would match kevin)
        // 'i' states that it's not case sensitive
    }
    try {
        const movies = await Movie.find(searchOptions)
        const books= await Book.find(searchOptions)
        const shows = await Show.find(searchOptions)
        
        let passObj = {
            movies: movies,
            shows: shows,
            books: books,
            searchOptions: req.query.search
        }
        if (req.user) {passObj.user=req.user}

        res.render('search', passObj)

    } catch (err) {
        console.log('error on searching movies in search.js (router) : ' + err);
    }
})

module.exports = router;