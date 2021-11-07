const mongoose = require ('mongoose');
const path = require ('path');
const coverImageBasePath = 'uploads/covers/books'

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    summary: {
        type:String
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }],
    tags:[{
        type: String
    }],
    releaseDate:{
        type: Date
    },
    coverImage: {
        type: Buffer
    },
    coverImageType:{
        type:String
    }  
});

bookSchema.virtual ('coverImagePath').get (function() {
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model ('Book', bookSchema)
module.exports.coverImageBasePath = coverImageBasePath