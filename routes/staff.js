const express = require('express');
const router = express.Router();
const Staff = require ('../models/staff');
const Staff_roles = require ('../models/staff_roles');
const Movie = require ('../models/movie');
const Work = require ('../models/work')
const mongoose = require ('mongoose');

router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find()
        //.populate('work.role').exec()
        res.render('staff/index', {
            staff: staff })
    } catch {
        res.redirect ('/');
        console.log('error on loading staff/new in staff.js (router)');
    }
});

//new staff (visual form) route
router.get("/new", async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ({})
        const movies = await Movie.find({})
        const staff = new Staff ([])
        res.render('staff/new', {
            movies:movies,
            staff : staff,
            staff_roles : staff_roles
        })
    } catch (err) {
        res.redirect ('/staff')
        console.log("ERROR: movies router get /new request is broken. err : " + err)
    }   
});

// create staff (process of creating after input is given) route
router.post ('/', async (req, res) => {

    setDate = (req.body.birthdate != "" ? new Date(req.body.birthdate) : "")

    const staff = new Staff ({
        name : req.body.name,
        summary : req.body.summary,
        birthdate: setDate
    })

    let movieStaff = {
        staff:[]
    }
    if (req.body.roles!=null && req.body.roles !="") {
        if (Array.isArray(req.body.roles)) {
            for (i=0; i < req.body.roles.length; i++) {
                let work = new Work ({
                    role: req.body.roles[i],
                    movie : req.body.movies[i]
                })
                await Movie.findByIdAndUpdate(req.body.movies[i],
                    {$push: {staff:staff.id}},
                    {safe:true, upsert:true}
                );
                staff.works.push(work);
                movieStaff.staff.push(work.id)
            }
        } else {
            let work = new Work ({
                role: req.body.roles,
                movie : req.body.movies
            })
            await Movie.findByIdAndUpdate(req.body.movies,
                {$push: {staff:staff.id}},
                {safe:true, upsert:true}
            );
            staff.works.push(work);
            movieStaff.staff.push(work.id)
        }
    }

    try {
        const newStaff = await staff.save()
        res.redirect (`staff/${newStaff.id}`)
        console.log("staff entry sucess")
    } catch {
        console.log("error on creating")

        const staff_roles = await Staff_roles.find ({})
        const movies = await Movie.find({})
        res.render('staff/new', {
            movies:movies,
            staff : staff,
            staff_roles : staff_roles,
            errorMessage: 'error creating staff'
    })
    }
});

router.get ('/:id', async (req,res) => {
    try {
        const staff = await Staff.findById(req.params.id).populate('works.movie works.role').exec()
        const movies = await Movie.find({ staff : staff.id})
        res.render ('staff/show', {
            staff : staff,
            movies : movies
        })
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
})

router.get ('/:id/edit', async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ({})
        const movies = await Movie.find({})
        const staff = await Staff.findById (req.params.id)
        res.render('staff/edit', {
            movies : movies,
            staff : staff,
            staff_roles : staff_roles
        })
    } catch (err) {
        res.redirect (`/staff/${req.params.id}`)
        console.log("ERROR: staff router get /edit request is broken. err : " + err)
    }  
})

router.put ('/:id', async (req,res) => {
    setDate = (req.body.birthdate != "" ? new Date(req.body.birthdate) : "")
    let staff

    try {
        staff = await Staff.findById(req.params.id);
        staff.summary = req.body.summary;
        staff.birthdate = setDate;
        await staff.save();
        res.redirect (`/staff/${staff.id}`);
    } catch (err){
        if (staff==null) {
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router delete in mstaff router")
            res.render('staff/edit', {
                staff : staff,
                errorMessage: 'error editing staff'
            })
        }
    }
})

router.delete ('/:id', async (req,res) => {
    let staff
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find staff
        staff = await Staff.findById(req.params.id);

        //remove staff
        let movie = await Movie.updateMany(
            { 'staff':id },
            { $pull : { staff : id}}
        )

        //delete staff
        await staff.remove();
        res.redirect ('/staff');
    } catch (err){
        if (staff==null) {
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router delete in mstaff router")
            res.render('staff/edit', {
                staff : staff,
                errorMessage: 'error editing staff'
            })
        }
    }
})


router.delete ('/:id', (req,res) => {
    
})

module.exports = router;