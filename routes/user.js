const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Book = require ('../models/book')
const Show = require ('../models/show')
const Staff = require ('../models/staff');
const User = require ('../models/user');
const mongoose = require ('mongoose');

router.get ('/:id', async (req,res) => {
    try {
        const user = await User.findById(req.params.id).populate('movies.movie books.book').exec();
        let passObj = { user:user }
        if (req.user) {passObj.username=req.user.username}
        res.render ('user/show', passObj)
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/movies', async (req,res) => {
    const user = await User.findById(req.params.id).populate('movies.movie').exec();
    let passObj = { user:user }
    if (req.user) {passObj.username=req.user.username}
    res.render ('user/showmovies', passObj)
})

module.exports = router;