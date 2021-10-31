const express = require('express');
const router = express.Router();
const Movie = require ('../models/movie');
const Staff = require ('../models/staff')

//cover file upload setup
const multer = require ('multer')
const path = require ('path')
const uploadPath = path.join('public', Movie.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
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
router.get("/new", async (req,res) => {
    try {
        const staff = await Staff.find ({})
        const movie = new Movie ()
        res.render ('movies/new', {
            staff:staff,
            movie:movie
        }) 
    } catch (err){
        res.redirect ('/movies')
        console.log ("ERROR: movies router get /new request is broken. err : " + err)


    }
    
    
    // res.render('movies/new', { movie : new Movie () })
});


// create movie (process of creating after input is given) route
router.post ('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null

    const movie = new Movie ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags,  
        coverImageName: fileName
     }) 

    try {
        const newMovie = await movie.save()
        //res.redirect (`movies/${newMovies.id}`)
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