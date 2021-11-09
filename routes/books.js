const express = require('express');
const router = express.Router();
const Book = require ('../models/book');
const Staff_roles = require ('../models/staff_roles');
const Staff = require ('../models/staff');
const Work = require ('../models/work')
const Tag = require ('../models/tag')
const mongoose = require ('mongoose');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all books route
router.get('/', async (req, res) => {

    try {
        const books = await Book.find()
        res.render('books/index', {
            books: books});
    } catch (err ){
        res.redirect ('/');
        console.log('error on loading books in books.js (router)' + err);
    }
});

// new books (visual form) route
router.get("/new", async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const book = new Book ()
        const staff = await Staff.find()
        const tags = await Tag.find()
        res.render('books/new', {
            book : book,
            staff : staff,
            roles : staff_roles,
            tags : tags
        })
    } catch (err) {
        res.redirect ('/books')
        console.log("ERROR: books router get /new request is broken. err : " + err)
    }  
});

// create book (process of creating after input is given) route
router.post ('/', async ( req, res ) => {   
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let newBook = new Book ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags,
        releaseDate: setDate
    }) 

    let bookStaff = {
        staff:[]
    }

    // add new staff work
    if (req.body.staff!=null && req.body.staff !="") {
        if (Array.isArray(req.body.staff)) {
            for (i=0; i < req.body.staff.length; i++) {
                const work = new Work ({
                    role: req.body.roles[i],
                    book : newBook.id
                })
                bookStaff.staff.push(work.id)
                await Staff.findByIdAndUpdate(req.body.staff[i],
                    {$push: {works: work}},
                    {safe: true, upsert: true}
                );
            }
        } else {
            let work = new Work ({
                role: req.body.roles,
                book : newBook.id
            })
            console.log(work)
            bookStaff.staff.push(work.id)
            await Staff.findByIdAndUpdate(req.body.staff,
                {$push: {works: work}},
                {safe: true, upsert: true}
            );
        }
    }

    newBook.staff = bookStaff.staff

    //set cover
    if (req.body.coverEncoded != null || req.body.cover != null) { 
        saveCover(newBook, req.body.cover)
    }

    try {
        const newBookTemp = await newBook.save()
        res.redirect (`books/${newBookTemp.id}`)
    } catch (err) {
        console.log(err + " - in last catch statement in router post in books router")
        renderNewPage (res, newBook, true)
    }
});

router.get ('/:id', async (req,res) => {
    try {
        const bookTemp = await Book.findById(req.params.id).populate('tags').exec()
        let id = mongoose.Types.ObjectId(bookTemp.id);

        const staff = await Staff.aggregate([
            { $match:{}},
            { $unwind : '$works'},
            { $match:{'works.book':id}},
            {$lookup: {
                    from: "staff_roles",
                    localField: "works.role",
                    foreignField: "_id",
                    as: "works.role"}}
        ]);

        res.render ('books/show', {
            staff : staff,
            book : bookTemp
        })
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/edit', async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const book = await Book.findById (req.params.id)
        const staff = await Staff.find()
        const tags = await Tag.find()
        res.render('books/edit', {
            book : book,
            staff : staff,
            roles : staff_roles,
            tags : tags
        })
    } catch (err) {
        res.redirect ('/books')
        console.log("ERROR: books router get /edit request is broken. err : " + err)
    }  
});

router.put('/:id', async (req, res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let book

    //set cover
    if (req.body.coverEncoded != null || req.body.cover != null) { 
        saveCover(book, req.body.cover)
    }

    try {
        book = await Book.findById(req.params.id)
        book.summary = req.body.summary
        book.releaseDate = setDate
        await book.save()
        res.redirect (`/books/${book.id}`)
    } catch (err) {
        if (book==null) {
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router post in books router")
            res.render ('books/edit', {
                book:book,
                errorMessage:"Error updating book"
            })
        } 
    }
});

router.delete ('/:id', async (req,res) => {
    let book
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find book
        book = await Book.findById(req.params.id)

        //remove works relating to this book
        let staff = await Staff.updateMany(
            { 'works.book':id },
            { $pull : { works : { book : id}}}
        )

        //delete book
        await book.remove()

        //redirect to home page
        res.redirect ('/books')
    } catch (err) {
        if (book==null) {
            console.log(err + " - in last catch statement in router delete in books router (book is null)")
            res.redirect('/')
        } else {
            console.log(err + " - in last catch statement in router delete in books router")
            res.redirect (`/books/${book.id}`)
        }
        
    }
})
 
async function renderNewPage (res, book, hasError = false) {
    try {
        const staff = await Staff.find ()
        const staff_roles = await Staff_roles.find ()
        const tags = await Tag.find()
        const params = {
            staff:staff,
            book:book,
            roles : staff_roles,
            tags : tags
        }
        if (hasError) {
            {params.errorMessage = 'error creating book'}
            console.log(params.errorMessage);
        }
        res.render ('books/new', params);
        
    } catch (err) {
        res.redirect ('/books')
        console.log ("ERROR: renderNewPage in books.js router is broken. err : " + err)
    }
}

function saveCover (book, coverEncoded) {
    if (coverEncoded == null || coverEncoded == "") return

    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, "base64")
        book.coverImageType = cover.type
    }
}

module.exports = router;