const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');

router.get('/', async (req, res) => {
    const movies = await Movie.find().limit(5);
    let passObj = {movies:movies}
    if (req.user) {passObj.username = req.user.username}
    res.render('index', passObj);
})

module.exports = router;