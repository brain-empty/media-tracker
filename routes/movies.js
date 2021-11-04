const express = require('express');
const router = express.Router();
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all movies route
router.get('/', async (req, res) => {

    try {
        const movies = await Movie.find().populate('staff').exec()
        res.render('movies/index', {
            movies: movies});
    } catch (err ){
        res.redirect ('/');
        console.log('error on loading movies in movies.js (router)' + err);
    }
});

//new movies (visual form) route
router.get("/new", async (req,res) => {
    renderNewPage (res, new Movie ())
});

// create movie (process of creating after input is given) route
router.post ('/', async (req, res) => {

setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")
    const movie = new Movie ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags.split(','),
        staff: req.body.staff,
        releaseDate: setDate
     }) 

    if (req.body.coverEncoded != null || movie.cover != null ) {
        saveCover(movie, req.body.cover)
    }

    try {
        const newMovie = await movie.save()
        //res.redirect (`movies/${newMovies.id}`)
        res.redirect ('movies')
    } catch {
        renderNewPage (res, movie, true)
    }
});
 
async function renderNewPage (res, movie, hasError = false) {
    try {
        const staff = await Staff.find ({})
        const params = {
            staff:staff,
            movie:movie
        }
        if (hasError) {params.errorMessage = 'error creating movie'}
        res.render ('movies/new', params);
        console.log(params.errorMessage);
    } catch (err) {
        res.redirect ('/movies')
        console.log ("ERROR: renderNewPage in movies.js router is broken. err : " + err)
    }
}

function saveCover (movie, coverEncoded) {
    if (coverEncoded == null || movie.cover==null ) return

    const cover = JSON.parse(coverEncoded)
    if (coverEncoded != null && imageMimeTypes.includes(cover.type)) {
        movie.coverImage = new Buffer.from(cover.data, "base64")
        movie.coverImageType = cover.type
    }
}

module.exports = router;