const express = require('express');
const router = express.Router();
const Book = require ('../models/book');
const Staff_roles = require ('../models/staff_roles');
const Staff = require ('../models/staff');
const Work = require ('../models/work')
const Tag = require ('../models/tag')
const User = require ('../models/user')
const mongoose = require ('mongoose');
const passport = require ('passport');

// file upload with filepond
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all books route
router.get('/', async (req, res) => {
    try {
        const books = await Book.find()
        let passObj = {books: books}
        if (req.user) {passObj.user=req.user}
        res.render('books/index', passObj);
    } catch (err ){
        console.log('error on loading books in books.js (router)' + err);
        res.redirect ('/');
    }
});

// new books (visual form) route
router.get("/new", checkAuthenticated, async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const book = new Book ()
        const staff = await Staff.find()
        const tags = await Tag.find()

        let passObj = { 
            book : book,
            staff : staff,
            roles : staff_roles,
            tags : tags
        }

        if (req.user) {passObj.user=req.user}

        res.render('books/new', passObj)
    } catch (err) {
        res.redirect ('/books')
        console.log("ERROR: books router get /new request is broken. err : " + err)
    }  
});

// create book (process of creating after input is given) route
router.post ('/', checkAuthenticated, async ( req, res ) => {   
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let newBook = new Book ({
        name : req.body.name,
        summary : req.body.summary,
        tags: req.body.tags,
        releaseDate: setDate,
        length: req.body.length       
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
                book : newBok.id
            })
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

    //set wallpaper
        if (req.body.wallpaperEncoded != null || req.body.wallpaper != null) { 
            saveWallpaper(newBook, req.body.wallpaper)
        }

    //save in db and render new page 
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

        let passObj = { staff : staff, book : bookTemp}
        if (req.user) {passObj.user=req.user}
        
        res.render ('books/show', passObj)
     } catch (err){
        console.log (err)
        res.redirect ('/')
    }
});

router.get ('/:id/edit', checkAuthenticated, async (req,res) => {
    try{
        const staff_roles = await Staff_roles.find ()
        const book = await Book.findById (req.params.id)
        const staff = await Staff.find()
        const tags = await Tag.find()
        let passObj = { book : book,
            staff : staff,
            roles : staff_roles,
            tags : tags
        }
        if (req.user) {passObj.user=req.user}
        res.render('books/edit',passObj)
    } catch (err) {
        res.redirect ('/books')
        console.log("ERROR: books router get /edit request is broken. err : " + err)
    }  
});

router.put('/:id',checkAuthenticated, async (req, res) => {
    setDate = (req.body.releaseDate != "" ? new Date(req.body.releaseDate) : "")

    let book

    try {
        book = await Book.findById(req.params.id)
        
        //set cover
        if (req.body.coverEncoded != null || req.body.cover != null) { 
            saveCover(book, req.body.cover)
        }

        //set wallpaper
        if (req.body.wallpaperEncoded != null || req.body.wallpaper != null) { 
            saveWallpaper(book, req.body.wallpaper)
        }

        book.summary = req.body.summary
        book.releaseDate = setDate
        book.length = req.body.length

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

router.get ('/:id/addstaff', checkAuthenticated, async (req,res) => {
    try{
        console.log(req.params.id)
        const staff_roles = await Staff_roles.find ()
        const staff = await Staff.find()
        let book = {
            id : req.params.id
        }
        let passObj = { 
            book : book,
            staff : staff,
            roles : staff_roles,
        }
        if (req.user) {passObj.user=req.user}
        res.render('books/addstaff', passObj)
    } catch (err) {
        res.redirect ('/books')
        console.log("ERROR: books router get /new request is broken. err : " + err)
    }  
})

router.get ('/:id/addstaff/submit', checkAuthenticated, async (req,res) => {
    try {

        let book = {
            id : req.params.id
        }

        let bookStaff = {
            staff:[]
        }

        if (Array.isArray(req.body.staff)) {
            for (i=0; i < req.body.staff.length; i++) {
                let staff = req.query.staff[i]
                console.log(staff)
                const work = new Work ({
                    role: req.body.roles[i],
                    book : book.id
                })

                bookStaff.staff.push(work.id)

                await Staff.findByIdAndUpdate(req.query.staff[i],
                    {$push: {works: work}},
                    {safe: true, upsert: true}
                );

                await Book.findByIdAndUpdate(book.id,
                    {$push: {staff:staff}},
                    {safe:true, upsert:true}
                );
            }
        } else {
            let staff = req.query.staff
            console.log(staff)
            let work = new Work ({
                role: req.query.roles,
                book : book.id
            })
            bookStaff.staff.push(work.id)
            await Staff.findByIdAndUpdate(req.query.staff,
                {$push: {works: work}},
                {safe: true, upsert: true}
            );
            await Book.findByIdAndUpdate(book.id,
                {$push: {staff:staff}},
                {safe:true, upsert:true}
            );
        }

        res.redirect (`/books/${req.params.id}`)
        // setting book staff
        
    } catch (e) {
        console.log("broke" + e)
    }
})

router.get ('/:id/track', checkAuthenticated, async (req,res) => {
    const bookId = mongoose.Types.ObjectId(req.params.id);
        const userId = mongoose.Types.ObjectId(req.user.id);
        

        let user = await User.findById (req.user.id)
        if (user.books.length!=0) {
            const userArr = await User.aggregate([
                { $match:{'_id':userId}},
                { $unwind : '$books'},
                {$match:{'books.book':bookId}}
            ]);
            if (userArr.length!=0) {
                user=userArr[0]
            }
        }

        let book = await Book.findById (req.params.id)
        if (book.ratings.length!=0) {
            const bookArr = await Book.aggregate([
                { $match:{'_id':bookId}},
                { $unwind : '$ratings'},
                { $match: 
                    {'ratings.user':userId}
                }
            ]);
            if (bookArr.length!=0) {
                console.log('ran')
                book = bookArr[0]
                book.id = mongoose.Types.ObjectId(book._id);
            }
        }

        res.render('books/track', {
            book : book,
            user : user
        })
   
})

router.get('/:id/track/submit',checkAuthenticated, async (req, res) => {
    let userId = mongoose.Types.ObjectId(req.user.id);
    let bookId = mongoose.Types.ObjectId(req.params.id);
    const entryUserFound = await User.aggregate([
        { $match:  {id:userId}},
        { $unwind: '$books' },
        { $match: {"books.book": bookId}}
    ])

    if (entryUserFound.length!=0) {
        await User.updateOne(
            { _id: req.user.id, "books.book": req.params.id },
            { $set: 
                {
                    'books.$.watchStatus' : req.query.watchStatus,
                    'books.$.date' : req.query.watchDate,
                    'books.$.rewatches' : req.query.rewatches,
                    'books.$.count':req.query.usercount
                }
            })
    } else {
        const bookEntry = {
            book : req.params.id,
            watchStatus : req.query.watchStatus,
            date : req.query.watchDate,
            rewatches: req.query.rewatches
        }

        await User.findByIdAndUpdate(req.user.id,
            {$push: {books: bookEntry}},
            {safe: true, upsert: true}
        )
    }

    
    const ratingFound = await Book.aggregate([
        { $match:{_id:bookId}},
        { $unwind : '$ratings'},
        { $match:{'ratings.user':userId}}
    ]); //checking if rating already exists

    if (ratingFound.length!=0) {       //if rating array doesn't have an element then just add a new one w
        await Book.updateOne(
            { _id: req.params.id, "ratings.user": req.user.id },
            { $set: {
                        "ratings.$.rating" : req.query.userRating, 
                        'ratings.$.review':req.query.userReview
                    }
            }
        )
    } else {                            //else modify old one
        const rating = {
            rating:req.query.userRating, 
            review:req.query.userReview, 
            user:req.user.id
        }

        await Book.findByIdAndUpdate(req.params.id,
            {$push: {ratings: rating}},
            {safe: true, upsert: true}
        )
    }
    const newBookTemp = await Book.findById(req.params.id)
    res.redirect (`/books/${req.params.id}`)
})

router.delete ('/:id',checkAuthenticated,async (req,res) => {
    let book
    let id = mongoose.Types.ObjectId(req.params.id);

    try {
        //find book
        book = await Book.findById(req.params.id)

        //remove works relating to this book
        await Staff.updateMany(
            { 'works.book':id },
            { $pull : { works : { book : id}}}
        )

        //remove tracks relating to this book
        await User.updateMany (
            { 'books.book':id },
            { $pull : {books :  {book : id }} }
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

function saveWallpaper (book, wallpaperEncoded) {
    if (wallpaperEncoded == null || wallpaperEncoded == "") return

    const wallpaper = JSON.parse(wallpaperEncoded)
    
    if (wallpaper != null && imageMimeTypes.includes(wallpaper.type)) {
        book.wallpaperImage = new Buffer.from(wallpaper.data, "base64")
        book.wallpaperImageType = wallpaper.type
    }
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
}

module.exports = router;