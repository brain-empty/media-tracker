const express = require('express')
const router = express.Router()
const Movie = require ('../models/movie');
const Staff = require ('../models/staff');

router.get('/', (req, res) => {
    res.render('index');
})

module.exports = router;