const express = require('express');
const router = express.Router();
const Show = require ('../models/show');
const Staff_roles = require ('../models/staff_roles');
const Staff = require ('../models/staff');
const Work = require ('../models/work')
const Tag = require ('../models/tag')
const mongoose = require ('mongoose');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all shows route
router.get('/', async (req, res) => {

    try {
        const shows = await Show.find()
        res.render('shows/index', {
            shows: shows});
    } catch (err ){
        res.redirect ('/');
        console.log('error on loading shows in shows.js (router)' + err);
    }
});

// new shows (visual form) route
router.get("/new", async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const show = new Show ()
        const staff = await Staff.find()
        const tags = await Tag.find()
        res.render('shows/new', {
            show : show,
            staff : staff,
            roles : staff_roles,
            tags : tags
        })
    } catch (err) {
        res.redirect ('/shows')
        console.log("ERROR: shows router get /new request is broken. err : " + err)
    }  
});

// create show (process of creating after input is given) route
router.post ('/', async ( req, res ) => {   
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
            console.log(work)
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
        saveCover(newshow, req.body.cover)
    }

    try {
        const newshowTemp = await newShow.save()
        res.redirect (`shows/${newshowTemp.id}`)
    } catch (err) {
        console.log(err + " - in last catch statement in router post in shows router")
        renderNewPage (res, newshow, true)
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

        res.render ('shows/show', {
            staff : staff,
            show : showTemp
        })
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/edit', async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const show = await Show.findById (req.params.id)
        const staff = await Staff.find()
        const tags = await Tag.find()
        res.render('shows/edit', {
            show : show,
            staff : staff,
            roles : staff_roles,
            tags : tags
        })
    } catch (err) {
        res.redirect ('/shows')
        console.log("ERROR: shows router get /edit request is broken. err : " + err)
    }  
});

router.put('/:id', async (req, res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let show

    //set cover
    if (req.body.coverEncoded != null || req.body.cover != null) { 
        saveCover(show, req.body.cover)
    }

    try {
        show = await Show.findById(req.params.id)
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

router.delete ('/:id', async (req,res) => {
    let show
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find show
        show = await Show.findById(req.params.id)

        //remove works relating to this show
        let staff = await Staff.updateMany(
            { 'works.show':id },
            { $pull : { works : { show : id}}}
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

module.exports = router;