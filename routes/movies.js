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
        const movies = await Movie.find().populate('staff').exec()
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

    if (req.body.coverEncoded != null || req.body.cover != null) {
        saveCover(newMovie, req.body.cover)
    }

    try {
        const newMovieTemp = await newMovie.save()
        res.redirect (`movies/${newMoviesTemp.id}`)
    } catch {
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
})

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
})

router.put ('/:id', async (req,res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")
    let movie   
    let movieStaff = {
        staff:[]
    }

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

    if (req.body.coverEncoded != null || req.body.cover != null) {
        saveCover(newMovie, req.body.cover)
    }

    try {
        const movie = await Movie.findById (req.params.id)
        console.log(req.body)
        await movie.save()
        res.redirect (`/movies/${newMoviesTemp.id}`)
    } catch {
        if (movie == null ) {
            res.redirect('/')
        } else {
        res.render('movise/edit', {
            movie:movie,
            errorMessage:"Error updating author"
        })}
    }
})

router.get ('/:id/delete', (req,res) => {
    res.send ('delete ' + req.params.id)
})
 
async function renderNewPage (res, movie, hasError = false) {
    try {
        const staff = await Staff.find ()
        const staff_roles = await Staff_roles.find ()
        const params = {
            staff:staff,
            movie:movie,
            roles : staff_roles
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
    if (coverEncoded == null || coverEncoded == "") return

    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        movie.coverImage = new Buffer.from(cover.data, "base64")
        movie.coverImageType = cover.type
    }
}

module.exports = router;