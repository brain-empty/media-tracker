const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');
const User = require ('../models/user');
const mongoose = require ('mongoose');

router.get ('/:id', async (req,res) => {
    try {
        const user = await User.findById(req.params.id).populate('movies.movie').exec();
        let passObj = { user:user }
        if (req.user) {passObj.username=req.user.username}
        res.render ('user/show', passObj)
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

module.exports = router;