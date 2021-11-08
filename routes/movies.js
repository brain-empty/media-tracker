const express = require('express');
const router = express.Router();
const Movie = require ('../models/movie');
const Staff_roles = require ('../models/staff_roles');
const Staff = require ('../models/staff');
const Work = require ('../models/work')
const Tag = require ('../models/tag')
const mongoose = require ('mongoose');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all movies route
router.get('/', async (req, res) => {

    try {
        const movies = await Movie.find()
        res.render('movies/index', {
            movies: movies});
    } catch (err ){
        res.redirect ('/');
        console.log('error on loading movies in movies.js (router)' + err);
    }
});

// new movies (visual form) route
router.get("/new", async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const movie = new Movie ()
        const staff = await Staff.find()
        const tags = await Tag.find()
        res.render('movies/new', {
            movie : movie,
            staff : staff,
            roles : staff_roles,
            tags : tags
        })
    } catch (err) {
        res.redirect ('/movies')
        console.log("ERROR: movies router get /new request is broken. err : " + err)
    }  
});

// create movie (process of creating after input is given) route
router.post ('/', async ( req, res ) => {   
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let newMovie = new Movie ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags,
        releaseDate: setDate
    }) 

    let movieStaff = {
        staff:[]
    }

    // add new staff work
    if (req.body.staff!=null && req.body.staff !="") {
        if (Array.isArray(req.body.staff)) {
            for (i=0; i < req.body.staff.length; i++) {
                const work = new Work ({
                    role: req.body.roles[i],
                    movie : newMovie.id
                })
                movieStaff.staff.push(work.id)
                await Staff.findByIdAndUpdate(req.body.staff[i],
                    {$push: {works: work}},
                    {safe: true, upsert: true}
                );
            }
        } else {
            let work = new Work ({
                role: req.body.roles,
                movie : newMovie.id
            })
            console.log(work)
            movieStaff.staff.push(work.id)
            await Staff.findByIdAndUpdate(req.body.staff,
                {$push: {works: work}},
                {safe: true, upsert: true}
            );
        }
    }

    newMovie.staff = movieStaff.staff

    //set cover
    if (req.body.coverEncoded != null || req.body.cover != null) { 
        saveCover(newMovie, req.body.cover)
    }

    try {
        const newMovieTemp = await newMovie.save()
        res.redirect (`movies/${newMovieTemp.id}`)
    } catch (err) {
        console.log(err + " - in last catch statement in router post in movies router")
        renderNewPage (res, newMovie, true)
    }
});

router.get ('/:id', async (req,res) => {
    try {
        const movieTemp = await Movie.findById(req.params.id).populate('tags').exec()
        let id = mongoose.Types.ObjectId(movieTemp.id);

        const staff = await Staff.aggregate([
            { $match:{}},
            { $unwind : '$works'},
            { $match:{'works.movie':id}},
            {$lookup: {
                    from: "staff_roles",
                    localField: "works.role",
                    foreignField: "_id",
                    as: "works.role"}}
        ]);

        res.render ('movies/show', {
            staff : staff,
            movie : movieTemp
        })
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/edit', async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const movie = await Movie.findById (req.params.id)
        const staff = await Staff.find()
        const tags = await Tag.find()
        res.render('movies/edit', {
            movie : movie,
            staff : staff,
            roles : staff_roles,
            tags : tags
        })
    } catch (err) {
        res.redirect ('/movies')
        console.log("ERROR: movies router get /edit request is broken. err : " + err)
    }  
});

router.put('/:id', async (req, res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let movie

    //set cover
    if (req.body.coverEncoded != null || req.body.cover != null) { 
        saveCover(movie, req.body.cover)
    }

    try {
        movie = await Movie.findById(req.params.id)
        movie.summary = req.body.summary
        movie.releaseDate = setDate
        await movie.save()
        res.redirect (`/movies/${movie.id}`)
    } catch (err) {
        if (movie==null) {
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router post in movies router")
            res.render ('movies/edit', {
                movie:movie,
                errorMessage:"Error updating movie"
            })
        } 
    }
});

router.delete ('/:id', async (req,res) => {
    let movie
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find movie
        movie = await Movie.findById(req.params.id)

        //remove works relating to this movie
        let staff = await Staff.updateMany(
            { 'works.movie':id },
            { $pull : { works : { movie : id}}}
        )

        //delete movie
        await movie.remove()

        //redirect to home page
        res.redirect ('/movies')
    } catch (err) {
        if (movie==null) {
            console.log(err + " - in last catch statement in router delete in movies router (movie is null)")
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router delete in movies router")
            res.redirect (`/movies/${movie.id}`)
        }
        
    }
})
 
async function renderNewPage (res, movie, hasError = false) {
    try {
        const staff = await Staff.find ()
        const staff_roles = await Staff_roles.find ()
        const tags = await Tag.find()
        const params = {
            staff:staff,
            movie:movie,
            roles : staff_roles,
            tags : tags
        }
        if (hasError) {
            {params.errorMessage = 'error creating movie'}
            console.log(params.errorMessage);
        }
        res.render ('movies/new', params);
        
    } catch (err) {
        res.redirect ('/movies')
        console.log ("ERROR: renderNewPage in movies.js router is broken. err : " + err)
    }
}

function saveCover (movie, coverEncoded) {
    if (coverEncoded == null || coverEncoded == "") return

    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        movie.coverImage = new Buffer.from(cover.data, "base64")
        movie.coverImageType = cover.type
    }
}

module.exports = router;