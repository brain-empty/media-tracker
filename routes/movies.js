const express = require('express');
const router = express.Router();
const Movie = require ('../models/movie');

//cover file upload setup
const multer = require ('multer')
const path = require ('path')
const uploadPath = path.join('public', Movie.coverImageBasePath)
const upload = multer ({
    dest: uploadPath,
    FileFilter: (req, file, callback) => {
        callback (null, boolean)
    }
})

//all movies route
router.get('/', async (req, res) => {
    let searchOptions = {}

    if (req.query.search != null && req.query.search !== ''){
        searchOptions.search = new RegExp (req.query.search, 'i')
        // regexp makes hte program search for the string even if it's not a full match (ke search would match kevin)
        // 'i' states that it's not case sensitive
    }

    try {
        const movies = await Movie.find(searchOptions)
        res.render('movies/index', {
            movies: movies, 
            searchOptions: req.query })

    } catch {
        res.redirect ('/');
        console.log('error on loading movies/new in movies.js (router)');
    }
});

//new movies (visual form) route
router.get("/new", (req,res) => {
    res.render('movies/new', { movie : new Movie () })
});


// create movie (process of creating after input is given) route
router.post ('/', async (req, res) => {
    const movie = new Movie ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags
    }) 
    console.log(movie)
    try {
        const newMovie = await movie.save()
        //res.redirect (`movies/${newMovies.id}`)
        //TODO : figure out how to accept array inputs
        res.redirect ('movies')
        console.log("movie entry sucess")
    } catch {
        res.render ('movies/new', {
        movie: movie,
        errorMessage: 'error creating movie'
        })
    }
});

module.exports = router;