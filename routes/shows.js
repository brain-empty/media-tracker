const express = require('express');
const router = express.Router();
const Show = require ('../models/show');
const Staff_roles = require ('../models/staff_roles');
const Staff = require ('../models/staff');
const Work = require ('../models/work')
const Tag = require ('../models/tag')
const User = require ('../models/user')
const mongoose = require ('mongoose');
const passport = require ('passport');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all shows route
router.get('/', async (req, res) => {
    try {
        const shows = await Show.find()
        let passObj = {shows: shows}
        if (req.user) {passObj.user=req.user}
        res.render('shows/index', passObj);
    } catch (err ){
        console.log('error on loading shows in shows.js (router)' + err);
        res.redirect ('/');
    }
});

// new shows (visual form) route
router.get("/new", checkAuthenticated, async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const show = new Show ()
        const staff = await Staff.find()
        const tags = await Tag.find()

        let passObj = { 
            show : show,
            staff : staff,
            roles : staff_roles,
            tags : tags
        }

        if (req.user) {passObj.user=req.user}

        res.render('shows/new', passObj)
    } catch (err) {
        res.redirect ('/shows')
        console.log("ERROR: shows router get /new request is broken. err : " + err)
    }  
});

// create show (process of creating after input is given) route
router.post ('/', checkAuthenticated, async ( req, res ) => {   
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let newShow = new Show ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags,
        releaseDate: setDate       
    })

    let showStaff = {
        staff:[]
    }

    // add new staff work
    if (req.body.staff!=null && req.body.staff !="") {
        if (Array.isArray(req.body.staff)) {
            for (i=0; i < req.body.staff.length; i++) {
                const work = new Work ({
                    role: req.body.roles[i],
                    show : newShow.id
                })
                showStaff.staff.push(work.id)
                await Staff.findByIdAndUpdate(req.body.staff[i],
                    {$push: {works: work}},
                    {safe: true, upsert: true}
                );
            }
        } else {
            let work = new Work ({
                role: req.body.roles,
                show : newShow.id
            })
            showStaff.staff.push(work.id)
            await Staff.findByIdAndUpdate(req.body.staff,
                {$push: {works: work}},
                {safe: true, upsert: true}
            );
        }
    }

    newShow.staff = showStaff.staff

    //set cover
        if (req.body.coverEncoded != null || req.body.cover != null) { 
            saveCover(newShow, req.body.cover)
        }

    //set wallpaper
        if (req.body.wallpaperEncoded != null || req.body.wallpaper != null) { 
            saveWallpaper(newShow, req.body.wallpaper)
        }

    //save in db and render new page 
        try {
            const newShowTemp = await newShow.save()
            res.redirect (`shows/${newShowTemp.id}`)
        } catch (err) {
            console.log(err + " - in last catch statement in router post in shows router")
            renderNewPage (res, newShow, true)
        }
});

router.get ('/:id', async (req,res) => {
    try {
        const showTemp = await Show.findById(req.params.id).populate('tags').exec()
        let id = mongoose.Types.ObjectId(showTemp.id);

        const staff = await Staff.aggregate([
            { $match:{}},
            { $unwind : '$works'},
            { $match:{'works.show':id}},
            {$lookup: {
                    from: "staff_roles",
                    localField: "works.role",
                    foreignField: "_id",
                    as: "works.role"}}
        ]);

        let passObj = { staff : staff, show : showTemp}
        if (req.user) {passObj.user=req.user}
        
        res.render ('shows/show', passObj)
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/edit', checkAuthenticated, async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const show = await Show.findById (req.params.id)
        const staff = await Staff.find()
        const tags = await Tag.find()
        let passObj = { show : show,
            staff : staff,
            roles : staff_roles,
            tags : tags
        }
        if (req.user) {passObj.user=req.user}
        res.render('shows/edit',passObj)
    } catch (err) {
        res.redirect ('/shows')
        console.log("ERROR: shows router get /edit request is broken. err : " + err)
    }  
});

router.put('/:id',checkAuthenticated, async (req, res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let show

    try {
        show = await Show.findById(req.params.id)
        //set cover
        if (req.body.coverEncoded != null || req.body.cover != null) { 
            saveCover(show, req.body.cover)
        }

        //set wallpaper
        if (req.body.wallpaperEncoded != null || req.body.wallpaper != null) { 
            saveWallpaper(show, req.body.wallpaper)
        }
        show.summary = req.body.summary
        show.releaseDate = setDate
        await show.save()
        res.redirect (`/shows/${show.id}`)
    } catch (err) {
        if (show==null) {
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router post in shows router")
            res.render ('shows/edit', {
                show:show,
                errorMessage:"Error updating show"
            })
        } 
    }
});

router.get ('/:id/addstaff', checkAuthenticated, async (req,res) => {
    try{
        console.log(req.params.id)
        const staff_roles = await Staff_roles.find ()
        const staff = await Staff.find()
        let show = {
            id : req.params.id
        }
        let passObj = { 
            show : show,
            staff : staff,
            roles : staff_roles,
        }
        if (req.user) {passObj.user=req.user}
        res.render('shows/addstaff', passObj)
    } catch (err) {
        res.redirect ('/shows')
        console.log("ERROR: shows router get /new request is broken. err : " + err)
    }  
})

router.get ('/:id/addstaff/submit', checkAuthenticated, async (req,res) => {
    try {

        let show = {
            id : req.params.id
        }

        let showStaff = {
            staff:[]
        }

        if (Array.isArray(req.body.staff)) {
            for (i=0; i < req.body.staff.length; i++) {
                let staff = req.query.staff[i]
                console.log(staff)
                const work = new Work ({
                    role: req.body.roles[i],
                    show : show.id
                })

                showStaff.staff.push(work.id)

                await Staff.findByIdAndUpdate(req.query.staff[i],
                    {$push: {works: work}},
                    {safe: true, upsert: true}
                );

                await Show.findByIdAndUpdate(show.id,
                    {$push: {staff:staff}},
                    {safe:true, upsert:true}
                );
            }
        } else {
            let staff = req.query.staff
            console.log(staff)
            let work = new Work ({
                role: req.query.roles,
                show : show.id
            })
            showStaff.staff.push(work.id)
            await Staff.findByIdAndUpdate(req.query.staff,
                {$push: {works: work}},
                {safe: true, upsert: true}
            );
            await Show.findByIdAndUpdate(show.id,
                {$push: {staff:staff}},
                {safe:true, upsert:true}
            );
        }

        res.redirect (`/shows/${req.params.id}`)
        // setting show staff
        
    } catch (e) {
        console.log("broke" + e)
    }
})


router.get ('/:id/track', checkAuthenticated, async (req,res) => {
    try{
        console.log(req.user)
        const showId = mongoose.Types.ObjectId(req.params.id);
        const userId = mongoose.Types.ObjectId(req.user.id);
        const show = await Show.findById (req.params.id)

        let user = await User.findById (req.user.id)
        if (user.shows.length!=0) {
            const userArr = await User.aggregate([
                { $match:{'_id':userId}},
                { $unwind : '$shows'},
                {$match:{'shows.show':showId}}
            ]);
            user = userArr[0]
        }

        res.render('shows/track', {
            show : show,
            user : user
        })
    } catch (err) {
        res.redirect ('/shows')
        console.log("ERROR: shows router get /track request is broken. err : " + err)
    }  
})

router.get('/:id/track/submit',checkAuthenticated, async (req, res) => {
        const entryUserFound = await User.find({"shows.show": req.params.id})
        if (entryUserFound.length!=0) {
            await User.updateOne(
                { _id: req.user.id, "shows.show": req.params.id },
                { $set: {
                            'shows.$.watchStatus' : req.query.watchStatus,
                            'shows.$.date' : req.query.watchDate,
                            'shows.$.rewatches' : req.query.rewatches
                        }
                }
            )
        } else {
            const showEntry = {
                show : req.params.id,
                watchStatus : req.query.watchStatus,
                date : req.query.watchDate,
                rewatches: req.query.rewatches
            }
    
            await User.findByIdAndUpdate(req.user.id,
                {$push: {shows: showEntry}},
                {safe: true, upsert: true}
            )
        }
        
        console.log()
        const ratingFound = await Show.find({"ratings.user": req.user.id}) //checking if rating already exists

        if (ratingFound.length!=0) {       //if rating array doesn't have an element then just add a new one w
            await Show.updateOne(
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

            await Show.findByIdAndUpdate(req.params.id,
                {$push: {ratings: rating}},
                {safe: true, upsert: true}
            )
        }
        const newShowTemp = Show.findById(req.params.id)
        res.redirect (`/shows/${req.params.id}`)
})

router.delete ('/:id',checkAuthenticated,async (req,res) => {
    let show
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find show
        show = await Show.findById(req.params.id)

        //remove works relating to this show
        await Staff.updateMany(
            { 'works.show':id },
            { $pull : { works : { show : id}}}
        )

        //remove tracks relating to this show
        await User.updateMany (
            { 'shows.show':id },
            { $pull : {shows :  {show : id }} }
        )

        //delete show
        await show.remove()

        //redirect to home page
        res.redirect ('/shows')
    } catch (err) {
        if (show==null) {
            console.log(err + " - in last catch statement in router delete in shows router (show is null)")
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router delete in shows router")
            res.redirect (`/shows/${show.id}`)
        }
        
    }
})
 
async function renderNewPage (res, show, hasError = false) {
    try {
        const staff = await Staff.find ()
        const staff_roles = await Staff_roles.find ()
        const tags = await Tag.find()
        const params = {
            staff:staff,
            show:show,
            roles : staff_roles,
            tags : tags
        }
        if (hasError) {
            {params.errorMessage = 'error creating show'}
            console.log(params.errorMessage);
        }
        res.render ('shows/new', params);
        
    } catch (err) {
        res.redirect ('/shows')
        console.log ("ERROR: renderNewPage in shows.js router is broken. err : " + err)
    }
}

function saveCover (show, coverEncoded) {
    if (coverEncoded == null || coverEncoded == "") return

    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        show.coverImage = new Buffer.from(cover.data, "base64")
        show.coverImageType = cover.type
    }
}

function saveWallpaper (show, wallpaperEncoded) {
    if (wallpaperEncoded == null || wallpaperEncoded == "") return

    const wallpaper = JSON.parse(wallpaperEncoded)
    
    if (wallpaper != null && imageMimeTypes.includes(wallpaper.type)) {
        show.wallpaperImage = new Buffer.from(wallpaper.data, "base64")
        show.wallpaperImageType = wallpaper.type
    }
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
}

module.exports = router;