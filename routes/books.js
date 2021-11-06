const express = require('express');
const router = express.Router();
const Book = require ('../models/book');
const Staff = require ('../models/staff');
const fs = require ('fs')
const path = require ('path')
const uploadPath = path.join('public', Book.coverImageBasePath)

//all books route
router.get('/', async (req, res) => {

    try {
        const books = await Book.find().populate('staff').exec()
        res.render('books/index', {
            books: books});
    } catch {
        res.redirect ('/');
        console.log('error on loading books in books.js (router)');
    }
});

//new books (visual form) route
router.get("/new", async (req,res) => {
    renderNewPage (res, new Book (), false)
});

// create book (process of creating after input is given) route
router.post ('/', async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const Date = req.body.releaseDate != null ? req.body.releaseDate : null

    const book = new Book ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags.split(','),
        staff: req.body.staff,
        coverImageName: fileName,
        releaseDate: Date
     }) 

    try {
        const newBook = await book.save()
        //res.redirect (`movies/${newBooks.id}`)
        res.redirect ('books')
    } catch {
        if (book.coverImageName != null){
            removeBookCover(book.coverImageName)
            console.log(book)
        }
        renderNewPage (res, book, true)
    }
    
});

function removeBookCover (fileName) {
    fs.unlink(path.join(uploadPath, fileName), err =>{
        if (err) console.error(err)
    })
}
 
async function renderNewPage (res, book, hasError) {
    try {
        const staff = await Staff.find ({})
        const params = {
            staff:staff,
            book:book
        }
        if (hasError) { params.errorMessage = 'error creating book'}
        res.render ('books/new', params);
        console.log( params.errorMessage + ". In renderNewPage function");
    } catch (err){
        res.redirect ('/books')
        console.log ("ERROR: renderNewPage in movies.js router is broken. err : " + err)
    }
}

module.exports = router;