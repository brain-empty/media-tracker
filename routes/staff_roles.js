// THIS FILE IS NOT BEING REQUIRED ANYWHERE. IT'S REDUNDANT. IMPLEMENT LATER. TODO.

const express = require('express');
const rolesRouter = express.Router();
const Staff = require ('../models/staff');
const Staff_roles = require ('../models/staff_roles');

// view staff roles route
rolesRouter.get('/', async (req, res) => {
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
        console.log('error on loading movies/new in movies.js (rolesRouter)');
    }
});

//new staff (visual form) route
rolesRouter.get("/staff/roles/new", async (req,res) => {
    try{
        const staff_roles = new Staff_roles ()
        res.render('staff/new', {
            staff_roles : staff_roles
        })

    } catch (err) {
        res.redirect ('/staff/new')
        console.log("ERROR: movies rolesRouter get /new request is broken. err : " + err)
    }   
});

// create staff (process of creating after input is given) route
rolesRouter.post ('/', async (req, res) => {
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
        res.render ('Staff/new', {
            staff: staff,
            errorMessage: 'error creating staff'
        })
    }
});


module.exports = rolesRouter;