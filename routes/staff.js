const express = require('express');
const router = express.Router();
const Staff = require ('../models/staff');
const Staff_roles = require ('../models/staff_roles');
const Movie = require ('../models/movie');


router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find().populate('role').exec()
        res.render('staff/index', {
            staff: staff })
    } catch {
        res.redirect ('/');
        console.log('error on loading movies/new in movies.js (router)');
    }
});

//new staff (visual form) route
router.get("/new", async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ({})
        const staff = new Staff ()
        const movie = new Movie ()
        res.render('staff/new', {
            staff : staff,
            staff_roles : staff_roles,
            movies: movie
        })
    } catch (err) {
        res.redirect ('staff')
        console.log("ERROR: movies router get /new request is broken. err : " + err)
    }   
});

// create staff (process of creating after input is given) route
router.post ('/', async (req, res) => {
    const staff = new Staff ({
        name: req.body.name,
        role: req.body.role
    })
    try {
        const newStaff = await staff.save()
        //res.redirect (`movies/${newStaff.id}`)
        res.redirect('staff')
        console.log("staff entry sucess")
    } catch {
        console.log("error on creating")
        res.render ('staff/new', {
            staff: staff,
            errorMessage: 'error creating staff'
        })
    }
});

module.exports = router;