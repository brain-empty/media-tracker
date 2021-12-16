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
        const user = await User.findById(req.params.id).populate('movies.movie books.book shows.show').exec();
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

router.get ('/:id/books', async (req,res) => {
    console.log(req.params)
    let id = mongoose.Types.ObjectId(req.params.id);
    console.log(id)
    const user = await User.findById(req.params.id).populate('books.book').exec();
    let passObj = { user:user }
    if (req.user) {passObj.username=req.user.username}
    res.render ('user/showbooks', passObj)
})

router.get ('/:id/shows', async (req,res) => {
    const user = await User.findById(req.params.id).populate('shows.show').exec();
    let passObj = { user:user }
    if (req.user) {passObj.username=req.user.username}
    res.render ('user/showshows', passObj)
})

module.exports = router;