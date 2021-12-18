const mongoose = require ('mongoose');

const showSchema = new mongoose.Schema({
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
    },
    wallpaperImage: {
        type: Buffer
    },
    wallpaperImageType: {
        type: Buffer
    },
    ratings: [{
        rating: { type:Number },
        review: {type:String},
        user: {type:mongoose.Schema.Types.ObjectId, ref : "User"}
    }],
    length: {
        type:Number
    }
});

showSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

showSchema.virtual('wallpaperImagePath').get(function() {
    if (this.wallpaperImage != null && this.wallpaperImageType != null) {
      return `data:${this.wallpaperImageType};charset=utf-8;base64,${this.wallpaperImage.toString('base64')}`
    }
})

showSchema.virtual('avgRating').get(function() {
    if (this.ratings.length != 0) {
        var avgRating=0;
        this.ratings.forEach ( ratings => {
            avgRating = avgRating + ratings.rating;
        })
        avgRating = avgRating/this.ratings.length;
        return avgRating;
    }
})

module.exports = mongoose.model ('Show', showSchema)