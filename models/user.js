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
    books : {},
    shows : {},
    password : {
        type : String, 
        required : true
    }
})

module.exports = mongoose.model ('User', userSchema)