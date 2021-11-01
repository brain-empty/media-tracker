const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');

router.get('/', async (req, res) => {
    let searchOptions = {}

    if (req.query.search != null && req.query.search !== ''){
        searchOptions.name = new RegExp (req.query.search, 'i')
        // regexp makes the program search for the string even if it's not a full match (ke search would match kevin)
        // 'i' states that it's not case sensitive
    }

    try {
        const movies = await Movie.find(searchOptions)
        const staff = await Staff.find(searchOptions)
        res.render('search', {
            movies: movies, 
            staff: staff,
            searchOptions: req.query.search })

    } catch (err) {
        console.log('error on searching movies in search.js (router) : ' + err);
    }
})

module.exports = router;