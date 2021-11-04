const express = require('express');
const router = express.Router();
const Staff = require ('../models/staff');
const Staff_roles = require ('../models/staff_roles');
const Movie = require ('../models/movie');


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

    const works = ({
        role : req.body.role,
        movie : req.body.movie,
        character : req.body.character
    })

    const staff = new Staff ({
        name : req.body.name
    })


    // staff.findByIdAndUpdate(staff.id,
    //     {$push {works : works}}
    // )

    try {
        const newStaff = await staff.save()
        //res.redirect (`movies/${newStaff.id}`)
        res.redirect('staff')
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

module.exports = router;