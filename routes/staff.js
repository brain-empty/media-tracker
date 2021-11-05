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

    setDate = (req.body.birthdate != "" ? new Date(req.body.birthdate) : "")

    const staff = new Staff ({
        name : req.body.name,
        summary : req.body.summary,
        birthdate: setDate
    })
    let movieStaff = {
        staff:[]
    }
    if (req.body.role!=null && req.body.role !="") {
        if (Array.isArray(req.body.role)) {
            for (i=0; i < req.body.role.length; i++) {
                let work = new Work ({
                    role: req.body.role[i],
                    movie : req.body.movies[i]
                })
                movieStaff.staff.push(work.id)
                staff.works.push(work);
                movieStaff.staff.push(work.id)
            }
        } else {
            let work = new Work ({
                role: req.body.role,
                movie : req.body.movies
            })
            movieStaff.staff.push(work.id)
            staff.works.push(work);
        }
    }

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

router.get ('/:id', async (req,res) => {
    try {
        const staff = await Staff.find({id:req.params.id}).populate('works.movie works.role').exec()
        const movies = await Movie.find({ staff : staff.id})
        res.render ('staff/show', {
            staff : staff,
            movies : movies
        })
        console.log(staff)
        console.log (movies)
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
})

router.put ('/:id', async (req,res) => {
    let staff;

    try {
        staff = await Staff.findById(req.params.id)
        await staff.save
        res.redirect (`/movies/${staff.id}`)
        console.log("staff entry sucess")
    } catch {
        if ( author == null ) {
            res.redirect ('/')
        }
        const staff_roles = await Staff_roles.find ({})
        const movies = await Movie.find({})
        res.render('staff/new', {
            movies:movies,
            staff : staff,
            staff_roles : staff_roles,
            errorMessage: 'error udpating staff'
    })
    }
})

router.get ('/:id/edit', (req,res) => {
    
})


router.delete ('/:id', (req,res) => {
    
})

module.exports = router;