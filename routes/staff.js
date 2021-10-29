const express = require('express');
const router = express.Router();
const Staff = require ('../models/staff');
const StaffRole = require ('../models/staff_roles');


router.get('/', async (req, res) => {
    let searchOptions = {}

    if (req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp (req.query.name, 'i')
        // regexp makes hte program search for the string even if it's not a full match (ke search would match kevin)
        // 'i' states that it's not case sensitive
    }

    try {
        const staff = await Staff.find(searchOptions)
        res.render('staff/index', {
            staff: staff, 
            searchOptions: req.query })

    } catch {
        res.redirect ('/');
        console.log('error on loading movies/new in movies.js (router)');
    }
});

//new staff (visual form) route
router.get("/new", (req,res) => {
    res.render('staff/new', { staff : new Staff () })
});

// create staff (process of creating after input is given) route
router.post ('/', async (req, res) => {
    const staff = new Staff ({
        name: req.body.name,
        role: req.body.role
    })
    try {
        const newMovie = await staff.save()
        //res.redirect (`movies/${newStaff.id}`)
        res.redirect ('Staff')
        console.log("staff entry sucess")
    } catch {
        res.render ('/', {
        staff: staff,
        errorMessage: 'error creating staff'
        })
    }
});

module.exports = router;