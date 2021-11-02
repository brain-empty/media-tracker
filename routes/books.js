const express = require('express');
const router = express.Router();
const Book = require ('../models/Book');

//cover file upload setup
const multer = require ('multer')
const path = require ('path')
const uploadPath = path.join('public', Book.coverImageBasePath)
const upload = multer ({
    dest: uploadPath,
    FileFilter: (req, file, callback) => {
        callback (null, boolean)
    }
})

//all Books route
router.get('/', async (req, res) =>{ 

    try {
        const Books = await Book.find()
        res.render('Books/index', {
            books: Books})

    } catch {
        res.redirect ('/');
        console.log('error on loading Books/new in Books.js (router)');
    }
});

//new Books (visual form) route
router.get("/new", (req,res) => {
    res.render('books/new', { book : new Book () })
});


// create Book (process of creating after input is given) route
router.post ('/', async (req, res) => {
    const book = new Book ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags
    }) 
    console.log(Book)
    try {
        const newBook = await Book.save()
        //res.redirect (`Books/${newBooks.id}`)
        //TODO : figure out how to accept array inputs
        res.redirect ('Books')
        console.log("Book entry sucess")
    } catch {
        res.render ('Books/new', {
        Book: Book,
        errorMessage: 'error creating Book'
        })
    }
});

module.exports = router;