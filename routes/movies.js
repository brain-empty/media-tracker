const express = require('express');
const router = express.Router();
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');
const fs = require ('fs')

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
        const movies = await Movie.find(searchOptions).populate('staff').exec()
        res.render('movies/index', {
            movies: movies, 
            searchOptions: req.query });
    } catch {
        res.redirect ('/');
        console.log('error on loading movies in movies.js (router)');
    }
});

//new movies (visual form) route
router.get("/new", async (req,res) => {
    renderNewPage (res, new Movie ())
});

// create movie (process of creating after input is given) route
router.post ('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null

    const movie = new Movie ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags,
        staff: req.body.staff,
        coverImageName: fileName,
        releaseDate: new Date(req.body.releaseDate)
     }) 

    try {
        const newMovie = await movie.save()
        //res.redirect (`movies/${newMovies.id}`)
        res.redirect ('movies')
    } catch {
        if (movie.coverImageName != null){
            removeMovieCover(movie.coverImageName)
            console.log(movie)
        }
        renderNewPage (res, movie, true)
    }
    
});

function removeMovieCover (fileName) {
    fs.unlink(path.join(uploadPath, fileName), err =>{
        if (err) console.error(err)
    }
    )
}
 
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
    } catch (err){
        res.redirect ('/movies')
        console.log ("ERROR: renderNewPage in movies.js router is broken. err : " + err)
    }
}
module.exports = router;