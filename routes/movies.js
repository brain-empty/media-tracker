const express = require('express');
const router = express.Router();
const Movie = require ('../models/movie');
const Staff_roles = require ('../models/staff_roles');
const Staff = require ('../models/staff');
const Work = require ('../models/work')
const Tag = require ('../models/tag')
const User = require ('../models/user')
const mongoose = require ('mongoose');
const passport = require ('passport');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all movies route
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find()
        let passObj = {movies: movies}
        if (req.user) {passObj.user=req.user}
        res.render('movies/index', passObj);
    } catch (err ){
        console.log('error on loading movies in movies.js (router)' + err);
        res.redirect ('/');
    }
});

// new movies (visual form) route
router.get("/new", checkAuthenticated, async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const movie = new Movie ()
        const staff = await Staff.find()
        const tags = await Tag.find()
        let passObj = { movie : movie,
            movie : movie,
            staff : staff,
            roles : staff_roles,
            tags : tags,
        }
        if (req.user) {passObj.user=req.user}
        res.render('movies/new', passObj)
    } catch (err) {
        res.redirect ('/movies')
        console.log("ERROR: movies router get /new request is broken. err : " + err)
    }  
});

// create movie (process of creating after input is given) route
router.post ('/', checkAuthenticated, async ( req, res ) => {   
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

    //set wallpaper
        if (req.body.wallpaperEncoded != null || req.body.wallpaper != null) { 
            saveWallpaper(newMovie, req.body.wallpaper)
        }

    //save in db and render new page 
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

        let passObj = { staff : staff, movie : movieTemp}
        if (req.user) {passObj.user=req.user}
        
        res.render ('movies/show', passObj)
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/edit', checkAuthenticated, async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const movie = await Movie.findById (req.params.id)
        const staff = await Staff.find()
        const tags = await Tag.find()
        let passObj = { movie : movie,
            staff : staff,
            roles : staff_roles,
            tags : tags
        }
        if (req.user) {passObj.user=req.user}
        res.render('movies/edit',passObj)
    } catch (err) {
        res.redirect ('/movies')
        console.log("ERROR: movies router get /edit request is broken. err : " + err)
    }  
});

router.put('/:id',checkAuthenticated, async (req, res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let movie

    //set cover
    if (req.body.coverEncoded != null || req.body.cover != null) { 
        saveCover(movie, req.body.cover)
    }

    //set wallpaper
    if (req.body.wallpaperEncoded != null || req.body.wallpaper != null) { 
        saveWallpaper(movie, req.body.wallpaper)
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

router.get ('/:id/track', checkAuthenticated, async (req,res) => {
    try{
        console.log(req.params.id)
        const movie = await Movie.findById (req.params.id)
        const user = await User.findById (req.user.id)
        res.render('movies/track', {
            movie : movie,
            user : user
        })
    } catch (err) {
        res.redirect ('/movies')
        console.log("ERROR: movies router get /track request is broken. err : " + err)
    }  
})

router.get('/:id/track/submit',checkAuthenticated, async (req, res) => {
    try {
        const entryUserFound = await User.find({"movies.movie": req.params.id})

        console.log(entryUserFound)
        if (entryUserFound.length!=0) {
            console.log("if user")
            await User.updateOne(
                { _id: req.user.id, "movies.movie": req.params.id },
                { $set: {
                            'movies.$.watchStatus' : req.query.watchStatus,
                            'movies.$.date' : req.query.watchDate,
                            'movies.$.rewatches' : req.query.rewatches
                        }
                }
            )
        } else {
            console.log("else user")
            const movieEntry = {
                movie : req.params.id,
                watchStatus : req.query.watchStatus,
                date : req.query.watchDate,
                rewatches: req.query.rewatches
            }
    
            await User.findByIdAndUpdate(req.user.id,
                {$push: {movies: movieEntry}},
                {safe: true, upsert: true}
            )
        }
        
        
        const ratingFound = await Movie.find({"ratings.user": req.user.id}) //checking if rating already exists

        if (ratingFound.length!=0) {       //if rating array doesn't have an element then just add a new one w
            await Movie.updateOne(
                { _id: req.params.id, "ratings.user": req.user.id },
                { $set: {
                            "ratings.$.rating" : req.query.userRating, 
                            'ratings.$.review':req.query.userReview
                        }
                }
            )
        } else {                            //else modify old one
            const rating = {
                rating:req.query.userRating, 
                review:req.query.userReview, 
                user:req.user.id
            }

            await Movie.findByIdAndUpdate(req.params.id,
                {$push: {ratings: rating}},
                {safe: true, upsert: true}
            )
        }
        
        res.redirect('/movies/:id')
    } catch (err) { 
        console.log(err)
        res.redirect('/:id/track/submit')
    }
})

router.delete ('/:id',checkAuthenticated,async (req,res) => {
    let movie
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find movie
        movie = await Movie.findById(req.params.id)

        //remove works relating to this movie
        await Staff.updateMany(
            { 'works.movie':id },
            { $pull : { works : { movie : id}}}
        )

        //remove tracks relating to this movie
        await User.updateMany (
            { 'movies.movie':id },
            { $pull : {movies :  {movie : id }} }
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

function saveWallpaper (movie, wallpaperEncoded) {
    if (wallpaperEncoded == null || wallpaperEncoded == "") return

    const wallpaper = JSON.parse(wallpaperEncoded)
    
    if (wallpaper != null && imageMimeTypes.includes(wallpaper.type)) {
        movie.wallpaperImage = new Buffer.from(wallpaper.data, "base64")
        movie.wallpaperImageType = wallpaper.type
    }
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
}

module.exports = router;