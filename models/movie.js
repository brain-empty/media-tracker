const mongoose = require ('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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

movieSchema.virtual ('coverImagePath').get (function() {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

module.exports = mongoose.model ('Movie', movieSchema)