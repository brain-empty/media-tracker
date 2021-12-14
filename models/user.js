const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema  ({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
    },
    movies : [{
        movie : {type:mongoose.Schema.Types.ObjectId, ref : "Movie"},
        watchStatus : {type:String},
        date : {type:Date},
        rewatches: {type:Number}
    }],
    books : [{
        book : {type:mongoose.Schema.Types.ObjectId, ref : "Book"},
        watchStatus : {type:String},
        date : {type:Date},
        rewatches: {type:Number},
        count: {type:Number}
    }],
    shows : [{
        shows : {type:mongoose.Schema.Types.ObjectId, ref : "Show"},
        watchStatus : {type:String},
        date : {type:Date},
        rewatches: {type:Number},
        count: {type:Number}
    }],
    password : {
        type : String, 
        required : true
    }
})

module.exports = mongoose.model ('User', userSchema)