const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');

router.get('/', (req, res) => {
    let searchOptions = {};
    res.render('index', {searchOptions});
})

module.exports = router;