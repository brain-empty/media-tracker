const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');

router.get('/', async (req, res) => {
    const movies = await Movie.find().limit(5);
    res.render('index', {
        movies:movies
    });
})

module.exports = router;