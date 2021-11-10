const mongoose = require ('mongoose');

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    releaseDate:{
        type: Date
    },
    coverImage: {
        type: Buffer
    },
    coverImageType:{
        type: String
    }   
});

bookSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

module.exports = mongoose.model ('Book', bookSchema)